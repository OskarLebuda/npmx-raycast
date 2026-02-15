export const NPX_WEB_BASE = 'https://npmx.dev';
export const NPX_API_BASE = `${NPX_WEB_BASE}/api`;

const encodePackageName = (packageName: string): string => {
  if (packageName.startsWith('@')) {
    return `@${encodeURIComponent(packageName.slice(1))}`;
  }
  return encodeURIComponent(packageName);
};

export const npmxApi = {
  suggestions: (query: string) => `${NPX_API_BASE}/opensearch/suggestions?q=${encodeURIComponent(query)}`,
  packageMeta: (packageName: string) => `${NPX_API_BASE}/registry/package-meta/${encodePackageName(packageName)}`,
  packageReadmeMarkdown: (packageName: string) => `${NPX_API_BASE}/registry/readme/markdown/${encodePackageName(packageName)}`,
  packageDownloads: (packageName: string) => `${NPX_API_BASE}/registry/downloads/${encodePackageName(packageName)}/versions`,
  packageProvenance: (packageName: string, version: string) =>
    `${NPX_API_BASE}/registry/provenance/${encodePackageName(packageName)}/v/${encodeURIComponent(version)}`,
} as const;

export const npmxWeb = {
  search: (query: string) => `${NPX_WEB_BASE}/search?q=${encodeURIComponent(query)}`,
  package: (packageName: string) => `${NPX_WEB_BASE}/package/${packageName}`,
} as const;
