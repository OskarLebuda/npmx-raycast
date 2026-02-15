export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface UnghRepoResponse {
  repo: {
    stars?: number;
  } | null;
}

export interface GitLabProjectResponse {
  star_count?: number;
}

export interface RepositoryStarsResponse {
  stars?: number;
  starsUrl?: string;
}
