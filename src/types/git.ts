export type RepoProvider = 'github' | 'gitlab';

export interface ParseRepoUrlResponse {
  owner: string | null | undefined;
  name: string | null | undefined;
  type?: RepoProvider;
  host?: string;
  repoUrl?: string;
}
