import { Action, ActionPanel, Icon, List, Toast, getPreferenceValues, showToast } from '@raycast/api';
import { useCachedState } from '@raycast/utils';
import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import type { ExtensionPreferences } from '@/types';
import type { EnrichedPackage, SearchStrategy } from '@/types/npmx';
import type { HistoryItem } from '@/types/storage';
import { npmxWeb } from '@/api/npmx';
import { HistoryListItem } from '@/components/HistoryListItem';
import { PackageListItem } from '@/components/PackageListItem';
import { fetchEnrichedPackages } from '@/utils/package';
import { addToHistory, getHistory } from '@/utils/storage';

export default function PackageList() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [history, setHistory] = useCachedState<HistoryItem[]>('history', []);
  const [results, setResults] = useState<EnrichedPackage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { historyCount, showLinkToSearchResultsInListView, searchStrategy } = getPreferenceValues<ExtensionPreferences>();
  const effectiveSearchStrategy: SearchStrategy = searchStrategy === 'opensearch' ? 'opensearch' : 'hybrid';

  const debounced = useDebouncedCallback(
    async (value: string) => {
      const updatedHistory = await addToHistory({ term: value, type: 'search' });
      setHistory(updatedHistory);
    },
    600,
    { debounceOnServer: true },
  );

  useEffect(() => {
    if (!searchTerm) {
      setResults([]);
      setIsLoading(false);
      return;
    }
    debounced(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    async function fetchHistory() {
      const historyItems = await getHistory();
      setHistory(historyItems);
    }
    fetchHistory();
  }, []);

  useEffect(() => {
    let canceled = false;
    const loadResults = async () => {
      if (!searchTerm.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const items = await fetchEnrichedPackages(searchTerm.trim(), effectiveSearchStrategy);
        if (!canceled) {
          setResults(items);
        }
      } catch (error) {
        if (!canceled) {
          console.error(error);
          showToast(Toast.Style.Failure, 'Could not fetch package data');
        }
      } finally {
        if (!canceled) {
          setIsLoading(false);
        }
      }
    };

    loadResults();
    return () => {
      canceled = true;
    };
  }, [searchTerm, effectiveSearchStrategy]);

  return (
    <List
      searchText={searchTerm}
      isLoading={isLoading}
      filtering={false}
      searchBarPlaceholder='Search packages, like "nuxt"...'
      onSearchTextChange={setSearchTerm}
    >
      {searchTerm ? (
        <>
          {results.length ? (
            <>
              {showLinkToSearchResultsInListView ? (
                <List.Item
                  title={`View search results for "${searchTerm}" on npmx.dev`}
                  icon={Icon.MagnifyingGlass}
                  actions={
                    <ActionPanel>
                      <Action.OpenInBrowser url={npmxWeb.search(searchTerm)} title="View Npmx Search Results" />
                    </ActionPanel>
                  }
                />
              ) : null}
              <List.Section title="Results" subtitle={results.length.toString()}>
                {results.map((result) => (
                  <PackageListItem key={`search-${result.name}`} result={result} setHistory={setHistory} />
                ))}
              </List.Section>
            </>
          ) : (
            <List.EmptyView title={`No results for "${searchTerm}"`} />
          )}
        </>
      ) : (
        <>
          {Number(historyCount) > 0 ? (
            history.length ? (
              <List.Section title="History">
                {history.map((item, index) => {
                  if (item.type === 'package' && item.package?.name) {
                    const packageName = item.package.name;
                    return (
                      <PackageListItem
                        key={`history-package-${packageName}-${index}`}
                        result={item.package}
                        setHistory={setHistory}
                        isHistoryItem={true}
                      />
                    );
                  }

                  return (
                    <HistoryListItem
                      key={`history-entry-${item.term}-${item.type}-${index}`}
                      item={item}
                      setHistory={setHistory}
                      setSearchTerm={setSearchTerm}
                    />
                  );
                })}
              </List.Section>
            ) : (
              <List.EmptyView title="Type something to get started" />
            )
          ) : null}
        </>
      )}
    </List>
  );
}
