import type {
  EnrichedPackage,
  ProvenanceResponse,
  SearchStrategy,
  SearchSuggestionsResponse,
  SearchablePackage,
  VersionDistributionResponse,
} from '@/types/npmx';
import type { CacheEntry, GitLabProjectResponse, RepositoryStarsResponse, UnghRepoResponse } from '@/types/package';
import { npmxApi } from '@/api/npmx';
import { parseRepoUrl } from '@/utils/git';

const CACHE_TTL_MS = 1000 * 60 * 10;

const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Reads a value from cache if present and not expired.
 */
const getFromCache = <T>(key: string): T | undefined => {
  const hit = cache.get(key);
  if (!hit) return undefined;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return hit.value as T;
};

/**
 * Stores a value in cache using the shared TTL.
 */
const setCache = <T>(key: string, value: T): T => {
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
};

/**
 * Fetches JSON and throws on non-2xx responses.
 */
const fetchJSON = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }
  return (await response.json()) as T;
};

/**
 * Returns cached JSON response or fetches and caches it.
 */
const getCachedJSON = async <T>(cacheKey: string, url: string): Promise<T> => {
  const cached = getFromCache<T>(cacheKey);
  if (cached !== undefined) {
    return cached;
  }
  return setCache(cacheKey, await fetchJSON<T>(url));
};

/**
 * Fetches search suggestions for a package query.
 */
export const fetchSuggestions = async (query: string): Promise<string[]> => {
  if (!query.trim()) return [];
  const response = await getCachedJSON<SearchSuggestionsResponse>(
    `suggestions:${query.toLowerCase()}`,
    npmxApi.suggestions(query),
  );
  return response[1] ?? [];
};

/**
 * Resolves package names for the selected search strategy.
 */
const resolvePackageNames = async (query: string, strategy: SearchStrategy): Promise<string[]> => {
  if (strategy === 'opensearch') {
    return (await fetchSuggestions(query)).slice(0, 12);
  }

  // Hybrid currently stays within npmx.dev API boundaries.
  // If npmx.dev exposes a richer full-search endpoint, we can extend this mode.
  return (await fetchSuggestions(query)).slice(0, 12);
};

/**
 * Fetches package metadata from the npmx API.
 */
const fetchPackageMeta = async (packageName: string): Promise<SearchablePackage> => {
  return getCachedJSON<SearchablePackage>(`meta:${packageName}`, npmxApi.packageMeta(packageName));
};

/**
 * Fetches total version downloads, returning undefined on failure.
 */
const fetchVersionDownloads = async (packageName: string): Promise<number | undefined> => {
  try {
    const response = await getCachedJSON<VersionDistributionResponse>(
      `downloads:${packageName}`,
      npmxApi.packageDownloads(packageName),
    );
    return response.totalDownloads;
  } catch {
    return undefined;
  }
};

/**
 * Fetches provenance info for a specific package version.
 */
const fetchProvenance = async (packageName: string, version: string): Promise<ProvenanceResponse | null> => {
  try {
    return await getCachedJSON<ProvenanceResponse | null>(
      `provenance:${packageName}@${version}`,
      npmxApi.packageProvenance(packageName, version),
    );
  } catch {
    return null;
  }
};

/**
 * Fetches repository stars and stargazers URL for supported hosts.
 */
const fetchRepositoryStars = async (repositoryUrl?: string): Promise<RepositoryStarsResponse> => {
  const parsed = parseRepoUrl(repositoryUrl);
  if (!parsed.type || !parsed.owner || !parsed.name) {
    return {};
  }

  if (parsed.type === 'github') {
    const starsUrl = `https://github.com/${parsed.owner}/${parsed.name}/stargazers`;
    try {
      const response = await getCachedJSON<UnghRepoResponse>(
        `stars:github:${parsed.owner}/${parsed.name}`,
        `https://ungh.cc/repos/${parsed.owner}/${parsed.name}`,
      );
      return { stars: response.repo?.stars, starsUrl };
    } catch {
      return { starsUrl };
    }
  }

  if (parsed.type === 'gitlab') {
    const host = parsed.host ?? 'gitlab.com';
    const starsUrl = `${parsed.repoUrl ?? `https://${host}/${parsed.owner}/${parsed.name}`}/-/starrers`;
    const projectPath = encodeURIComponent(`${parsed.owner}/${parsed.name}`);
    try {
      const response = await getCachedJSON<GitLabProjectResponse>(
        `stars:gitlab:${host}:${parsed.owner}/${parsed.name}`,
        `https://${host}/api/v4/projects/${projectPath}`,
      );
      return { stars: response.star_count, starsUrl };
    } catch {
      return { starsUrl };
    }
  }

  return {};
};

/**
 * Fetches and enriches package search results with metrics.
 */
export const fetchEnrichedPackages = async (query: string, strategy: SearchStrategy = 'hybrid'): Promise<EnrichedPackage[]> => {
  const suggestions = await resolvePackageNames(query, strategy);

  const enriched: Array<EnrichedPackage | null> = await Promise.all(
    suggestions.map(async (packageName) => {
      try {
        const meta = await fetchPackageMeta(packageName);
        const [downloads, provenance, stars] = await Promise.all([
          fetchVersionDownloads(packageName),
          fetchProvenance(meta.name, meta.version),
          fetchRepositoryStars(meta.links.repository),
        ]);

        const packageEntry: EnrichedPackage = {
          ...meta,
          weeklyDownloads: meta.weeklyDownloads ?? 0,
          totalVersionDownloads: downloads,
          hasProvenance: Boolean(provenance),
          provenanceProvider: provenance?.providerLabel,
          githubStars: stars.stars,
          githubStarsUrl: stars.starsUrl,
        };
        return packageEntry;
      } catch {
        return null;
      }
    }),
  );

  return enriched.filter((pkg): pkg is EnrichedPackage => pkg !== null);
};
