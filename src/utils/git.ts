import gitUrlParse from 'git-url-parse';
import type { ParseRepoUrlResponse, RepoProvider } from '@/types/git';

/**
 * Normalizes git repository URLs by removing common prefixes/suffixes.
 */
export const cleanGitUrl = (url: string): string => {
  let cleanUrl = url.startsWith('git+') ? url.slice(4) : url;
  cleanUrl = cleanUrl.endsWith('.git') ? cleanUrl.slice(0, -4) : cleanUrl;
  return cleanUrl;
};

/**
 * Parses repository URL and extracts provider-specific metadata.
 */
export const parseRepoUrl = (repoUrl?: string): ParseRepoUrlResponse => {
  const invalidUrl = {
    owner: null,
    name: null,
    type: undefined,
    repoUrl: undefined,
  };
  if (!repoUrl) return invalidUrl;

  try {
    try {
      const url = new URL(repoUrl);
      url.protocol = 'https:';
      repoUrl = url.toString();
    } catch {
      // Some git URLs can use unsupported protocols for URL()
    }
    const parsedUrl = gitUrlParse(repoUrl);
    const cleanedUrl = cleanGitUrl(parsedUrl.toString('https'));
    const isGithubRepo = cleanedUrl.includes('github.com');
    const isGitlabRepo = cleanedUrl.includes('gitlab.com');
    const owner = parsedUrl.owner;
    const name = parsedUrl.name;
    const host = parsedUrl.source;
    const type = isGithubRepo ? 'github' : isGitlabRepo ? 'gitlab' : undefined;

    return {
      owner,
      name,
      type,
      host,
      repoUrl: cleanedUrl,
    };
  } catch {
    return invalidUrl;
  }
};

/**
 * Builds a changelog URL for supported git providers.
 */
export const getChangelogUrl = (
  type: RepoProvider | undefined,
  owner: string | null | undefined,
  name: string | null | undefined,
) => {
  if (type === 'github' && owner && name) {
    return `https://github.com/${owner}/${name}/releases`;
  }
  return null;
};
