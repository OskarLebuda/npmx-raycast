import { Action, getPreferenceValues } from '@raycast/api';
import type { ExtensionPreferences } from '@/types';
import type { CopyInstallActionsProps, PackageManager } from '@/types/install';
import type { Keyboard } from '@raycast/api';

const PACKAGE_MANAGERS: PackageManager[] = ['yarn', 'npm', 'pnpm', 'bun'];
const INSTALL_VERB: Record<PackageManager, 'add' | 'install'> = {
  yarn: 'add',
  npm: 'install',
  pnpm: 'install',
  bun: 'add',
};
const MANAGER_LABEL: Record<PackageManager, string> = {
  yarn: 'Yarn',
  npm: 'npm',
  pnpm: 'pnpm',
  bun: 'bun',
};

const defaultShortcut: Keyboard.Shortcut = {
  macOS: { key: 'c', modifiers: ['shift', 'cmd'] },
  Windows: { key: 'c', modifiers: ['shift', 'ctrl'] },
};

const alternateShortcut: Keyboard.Shortcut = {
  macOS: { key: 'c', modifiers: ['opt', 'cmd'] },
  Windows: { key: 'c', modifiers: ['alt', 'ctrl'] },
};

const buildManagerOrder = (primary: PackageManager, secondary: PackageManager): PackageManager[] => {
  const prioritized = [primary, secondary].filter((value, index, list) => list.indexOf(value) === index);
  const fallback = PACKAGE_MANAGERS.filter((manager) => !prioritized.includes(manager));
  return [...prioritized, ...fallback];
};

export const CopyInstallActions = ({ packageName }: CopyInstallActionsProps) => {
  const { defaultCopyAction, secondaryCopyAction } = getPreferenceValues<ExtensionPreferences>();
  const orderedManagers = buildManagerOrder(defaultCopyAction, secondaryCopyAction);

  const copyActions = orderedManagers.map((manager) => {
    const isPrimary = defaultCopyAction === manager;
    const isSecondary = secondaryCopyAction === manager;
    const shortcut = isPrimary ? defaultShortcut : isSecondary ? alternateShortcut : undefined;

    return (
      <Action.CopyToClipboard
        title={`Copy ${MANAGER_LABEL[manager]} Install Command`}
        content={`${manager} ${INSTALL_VERB[manager]} ${packageName}`}
        shortcut={shortcut}
        key={manager}
      />
    );
  });

  return <>{copyActions}</>;
};
