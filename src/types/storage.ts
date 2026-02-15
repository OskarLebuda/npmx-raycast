import type { SearchablePackage } from '@/types/npmx';

export type HistoryType = 'search' | 'package';

export interface HistoryItem {
  term: string;
  type: HistoryType;
  description?: string;
  package?: SearchablePackage;
}
