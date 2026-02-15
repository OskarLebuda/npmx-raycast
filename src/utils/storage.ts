import { LocalStorage, getPreferenceValues } from '@raycast/api';
import type { ExtensionPreferences } from '@/types';
import type { HistoryItem } from '@/types/storage';

const LOCAL_STORAGE_KEY = 'npmx-history';

/**
 * Builds a stable identity key for a history entry.
 */
const getHistoryItemKey = (item: HistoryItem): string => {
  if (item.type === 'package' && item.package?.name) {
    return `${item.type}:${item.package.name}`;
  }
  return `${item.type}:${item.term}`;
};

/**
 * Removes duplicates while preserving insertion order.
 */
const uniqueHistoryItems = (items: HistoryItem[]): HistoryItem[] => {
  const seen = new Set<string>();
  const unique: HistoryItem[] = [];

  for (const item of items) {
    const key = getHistoryItemKey(item);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(item);
  }

  return unique;
};

/**
 * Returns persisted history trimmed to the configured limit.
 */
export const getHistory = async (): Promise<HistoryItem[]> => {
  const { historyCount } = getPreferenceValues<ExtensionPreferences>();
  const historyFromStorage = await LocalStorage.getItem<string>(LOCAL_STORAGE_KEY);
  const history: HistoryItem[] = JSON.parse(historyFromStorage ?? '[]');
  const historyWithoutDuplicates = uniqueHistoryItems(history);

  if (historyWithoutDuplicates.length > Number(historyCount)) {
    historyWithoutDuplicates.length = Number(historyCount);
  }

  return historyWithoutDuplicates;
};

/**
 * Adds one history entry and returns updated list.
 */
export const addToHistory = async (item: HistoryItem) => {
  const { historyCount } = getPreferenceValues<ExtensionPreferences>();
  const history = await getHistory();
  const historyWithNewItem = [item, ...history];
  const updatedHistoryList = uniqueHistoryItems(historyWithNewItem);

  if (updatedHistoryList.length > Number(historyCount)) {
    updatedHistoryList.length = Number(historyCount);
  }

  await LocalStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistoryList));
  return getHistory();
};

/**
 * Removes matching entries from history by term and type.
 */
const removeMatchingItemFromArray = (arr: HistoryItem[], item: HistoryItem): HistoryItem[] => {
  let i = 0;
  while (i < arr.length) {
    if (arr[i].term === item.term && arr[i].type === item.type) {
      arr.splice(i, 1);
    } else {
      i += 1;
    }
  }
  return arr;
};

/**
 * Removes one history entry and returns updated list.
 */
export const removeItemFromHistory = async (item: HistoryItem) => {
  const history = await getHistory();
  const updatedHistoryList = removeMatchingItemFromArray(history, item);
  await LocalStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedHistoryList));
  return getHistory();
};

/**
 * Clears all history entries.
 */
export const removeAllItemsFromHistory = async () => {
  await LocalStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
  return getHistory();
};
