import { Detail } from '@raycast/api';
import type { ReadmeProps } from '@/types/components';
import { useReadme } from '@/hooks/useReadme';

export const Readme = ({ packageName }: ReadmeProps) => {
  const { data, isLoading } = useReadme(packageName);
  return <Detail markdown={data} isLoading={isLoading} />;
};
