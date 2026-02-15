import { Toast, showToast } from '@raycast/api';
import { useFetch } from '@raycast/utils';
import type { ReadmeMarkdownResponse } from '@/types/npmx';
import { npmxApi } from '@/api/npmx';
import { normalizeReadmeMarkdown } from '@/utils/markdown';

/**
 * Fetches and normalizes README markdown for a package.
 */
export const useReadme = (packageName: string) => {
  const url = npmxApi.packageReadmeMarkdown(packageName);
  const { data, isLoading, revalidate, error } = useFetch<string, string>(url, {
    parseResponse: async (response) => {
      if (!response.ok) {
        throw new Error(`Failed to fetch README for ${packageName}`);
      }
      const payload = (await response.json()) as ReadmeMarkdownResponse;
      if (!payload.markdown) {
        return `# ${packageName}\n\nNo README found for this package.`;
      }
      return normalizeReadmeMarkdown(payload.markdown);
    },
    initialData: 'Loading README...',
    onError: (err) => {
      showToast({
        style: Toast.Style.Failure,
        title: `Could not load README for ${packageName}`,
        message: String(err),
      });
    },
  });

  return {
    isLoading,
    data,
    revalidate,
    error,
  };
};
