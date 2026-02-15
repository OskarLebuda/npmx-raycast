export type ExtensionPreferences = {
  defaultCopyAction: 'yarn' | 'npm' | 'pnpm' | 'bun';
  secondaryCopyAction: 'yarn' | 'npm' | 'pnpm' | 'bun';
  defaultOpenAction: 'openRepository' | 'openHomepage' | 'npmPackagePage' | 'npmxPackagePage';
  historyCount: string;
  showLinkToSearchResultsInListView: boolean;
  searchStrategy: 'hybrid' | 'opensearch';
};
