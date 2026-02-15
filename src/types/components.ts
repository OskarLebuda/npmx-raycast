import type { EnrichedPackage, SearchablePackage } from '@/types/npmx';
import type { HistoryItem } from '@/types/storage';
import type { Dispatch, SetStateAction } from 'react';

export interface PackageListItemProps {
  result: SearchablePackage & Partial<EnrichedPackage>;
  setHistory?: Dispatch<SetStateAction<HistoryItem[]>>;
  isHistoryItem?: boolean;
}

export interface HistoryListItemProps {
  item: HistoryItem;
  setHistory: Dispatch<SetStateAction<HistoryItem[]>>;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

export interface ReadmeProps {
  packageName: string;
}
