import { Action, ActionPanel, Color, Icon, Keyboard, List, Toast, getPreferenceValues, showToast } from '@raycast/api';
import type { ExtensionPreferences } from '@/types';
import type { PackageListItemProps } from '@/types/components';
import { npmxApi, npmxWeb } from '@/api/npmx';
import { CopyInstallActions } from '@/components/CopyInstallActions';
import { Readme } from '@/screens/Readme';
import { getChangelogUrl, parseRepoUrl } from '@/utils/git';
import { addToHistory, removeItemFromHistory } from '@/utils/storage';

export const PackageListItem = ({ result, setHistory, isHistoryItem }: PackageListItemProps) => {
  const { defaultOpenAction, historyCount } = getPreferenceValues<ExtensionPreferences>();
  const pkg = result;
  const { owner, name, type, repoUrl } = parseRepoUrl(pkg.links?.repository);
  const changelogUrl = getChangelogUrl(type, owner, name);

  const handleAddToHistory = async () => {
    const history = await addToHistory({
      term: pkg.name,
      type: 'package',
      package: result,
    });
    if (Number(historyCount) <= 0) return;
    setHistory?.(history);
    showToast(Toast.Style.Success, `Added ${result.name} to history`);
  };

  const openActions = {
    openRepository: repoUrl ? (
      <Action.OpenInBrowser key="openRepository" url={repoUrl} title="Open Repository" onOpen={handleAddToHistory} />
    ) : null,
    openHomepage:
      pkg.links.homepage && pkg.links.homepage !== repoUrl ? (
        <Action.OpenInBrowser
          key="openHomepage"
          url={pkg.links.homepage}
          title="Open Homepage"
          icon={Icon.Link}
          onOpen={handleAddToHistory}
        />
      ) : null,
    npmxPackagePage: (
      <Action.OpenInBrowser
        key="npmxPackagePage"
        url={npmxWeb.package(pkg.name)}
        title="Open Npmx Package Page"
        icon={Icon.MagnifyingGlass}
        onOpen={handleAddToHistory}
      />
    ),
    changelogPackagePage: changelogUrl ? (
      <Action.OpenInBrowser key="openChangelog" url={changelogUrl} title="Open Changelog" />
    ) : null,
    githubStarsPage: pkg.githubStarsUrl ? (
      <Action.OpenInBrowser key="githubStarsPage" url={pkg.githubStarsUrl} title="Open GitHub Stargazers" icon={Icon.Star} />
    ) : null,
    provenanceApi: (
      <Action.OpenInBrowser
        key="provenanceApi"
        url={npmxApi.packageProvenance(pkg.name, pkg.version)}
        title="Open Provenance API Data"
        icon={Icon.Shield}
      />
    ),
  };

  const keywords = Array.isArray(pkg.keywords) ? pkg.keywords : [];

  const accessories: List.Item.Accessory[] = [];
  if (keywords.length) {
    accessories.push({
      icon: Icon.Tag,
      tooltip: keywords.join(', '),
    });
  }

  if (pkg.hasProvenance) {
    accessories.push({
      icon: Icon.Shield,
      tooltip: pkg.provenanceProvider ? `Provenance: ${pkg.provenanceProvider}` : 'Verified provenance available',
    });
  }

  if (typeof pkg.githubStars === 'number') {
    accessories.push({
      text: `★ ${pkg.githubStars.toLocaleString()}`,
      tooltip: 'GitHub stars',
    });
  }

  accessories.push({
    text: `v${pkg.version}`,
    tooltip: 'Latest version',
  });

  return (
    <List.Item
      id={pkg.name}
      key={pkg.name}
      title={pkg.name}
      subtitle={pkg.description}
      icon={Icon.Box}
      accessories={accessories}
      keywords={keywords}
      actions={
        <ActionPanel>
          <ActionPanel.Section title="Links">
            {Object.entries(openActions)
              .sort(([actionName]) => (actionName === defaultOpenAction ? -1 : 0))
              .map(([, action]) => action)
              .filter(Boolean)}
          </ActionPanel.Section>

          <ActionPanel.Section title="Actions">
            {isHistoryItem ? (
              <Action
                title="Remove from History"
                onAction={async () => {
                  const history = await removeItemFromHistory({ term: pkg.name, type: 'package' });
                  setHistory?.(history);
                }}
                icon={Icon.XMarkCircle}
                style={Action.Style.Destructive}
              />
            ) : null}
          </ActionPanel.Section>

          <ActionPanel.Section title="Info">
            <Action.Push title="View Readme" target={<Readme packageName={pkg.name} />} icon={Icon.Paragraph} />
            {pkg.links.bugs ? <Action.OpenInBrowser url={pkg.links.bugs} title="Open Issues / Bugs" icon={Icon.Bug} /> : null}
            {pkg.githubStarsUrl ? (
              <Action.OpenInBrowser url={pkg.githubStarsUrl} title="Open GitHub Stargazers" icon={Icon.Star} />
            ) : null}
            <Action.CopyToClipboard
              title="Copy Package Metrics"
              content={[
                `Package: ${pkg.name}`,
                `Version: ${pkg.version}`,
                `Weekly downloads: ${(pkg.weeklyDownloads ?? 0).toLocaleString()}`,
                `Version downloads total: ${pkg.totalVersionDownloads?.toLocaleString() ?? 'n/a'}`,
                `GitHub stars: ${pkg.githubStars?.toLocaleString() ?? 'n/a'}`,
                `Provenance: ${pkg.hasProvenance ? (pkg.provenanceProvider ?? 'yes') : 'no'}`,
              ].join('\n')}
              icon={Icon.Document}
            />
            <Action.OpenInBrowser
              url={`https://bundlephobia.com/package/${pkg.name}`}
              title="Open Bundlephobia"
              icon={Icon.LevelMeter}
            />
          </ActionPanel.Section>

          <ActionPanel.Section title="Copy">
            <CopyInstallActions packageName={pkg.name} />
            <Action.CopyToClipboard title="Copy Package Name" content={pkg.name} />
            <Action.CopyToClipboard title="Copy Version" content={pkg.version} />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
};
