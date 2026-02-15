export type SearchSuggestionsResponse = [string, string[]];

export interface SearchablePackage {
  name: string;
  version: string;
  description?: string;
  keywords?: string[];
  license?: string;
  date: string;
  links: {
    npm: string;
    homepage?: string;
    repository?: string;
    bugs?: string;
  };
  author?: {
    name?: string;
    email?: string;
    url?: string;
    username?: string;
  };
  maintainers?: Array<{
    name?: string;
    email?: string;
    url?: string;
    username?: string;
  }>;
  weeklyDownloads?: number;
}

export interface EnrichedPackage extends SearchablePackage {
  weeklyDownloads: number;
  totalVersionDownloads?: number;
  hasProvenance?: boolean;
  provenanceProvider?: string;
  githubStars?: number;
  githubStarsUrl?: string;
}

export interface ReadmeMarkdownResponse {
  packageName: string;
  version?: string;
  markdown?: string;
}

export interface VersionDistributionResponse {
  package: string;
  mode: 'major' | 'minor';
  totalDownloads: number;
}

export interface ProvenanceResponse {
  provider: string;
  providerLabel: string;
}

export type SearchStrategy = 'hybrid' | 'opensearch';
