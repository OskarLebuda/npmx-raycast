import { Action, ActionPanel, Icon, List } from '@raycast/api';
import { useId } from 'react';
import type { HistoryListItemProps } from '@/types/components';
import { getHistory, removeAllItemsFromHistory, removeItemFromHistory } from '@/utils/storage';

export const HistoryListItem = ({ item, setHistory, setSearchTerm }: HistoryListItemProps) => {
  const id = useId();
  return (
    <List.Item
      title={item.term}
      key={id}
      icon={item.type === 'search' ? Icon.MagnifyingGlass : Icon.Box}
      actions={
        <ActionPanel>
          <Action title="Search Package" onAction={() => setSearchTerm(item.term)} icon={Icon.MagnifyingGlass} />
          <Action
            title="Remove from History"
            onAction={async () => {
              const history = await removeItemFromHistory(item);
              setHistory(history);
            }}
            icon={Icon.XMarkCircle}
            style={Action.Style.Destructive}
          />
          <Action
            title="Clear All Items from History"
            shortcut={{
              macOS: { modifiers: ['cmd'], key: 'backspace' },
              Windows: { modifiers: ['ctrl'], key: 'backspace' },
            }}
            onAction={async () => {
              await removeAllItemsFromHistory();
              const history = await getHistory();
              setHistory(history);
            }}
            icon={Icon.XMarkCircleFilled}
            style={Action.Style.Destructive}
          />
        </ActionPanel>
      }
      accessories={[
        {
          icon: Icon.ArrowRightCircle,
          tooltip: 'Search for this package',
        },
      ]}
    />
  );
};
