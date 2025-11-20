import useSWR from 'swr';
import { ArkaCDNClient, FileInfo } from '@/lib/arka-cdn-client';

const POLL_INTERVAL = 3000;

const filesFetcher = async (client: ArkaCDNClient): Promise<FileInfo[]> => {
  if (!client.isAuthenticated()) {
    throw new Error('No autenticado');
  }
  const response = await client.listFiles();
  return response.data || [];
};

export const useFiles = (client: ArkaCDNClient, isAuthenticated: boolean) => {
  const { data, error, isLoading, mutate } = useSWR<FileInfo[]>(
    isAuthenticated ? ['files', client] : null,
    () => filesFetcher(client),
    {
      refreshInterval: POLL_INTERVAL,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    files: data || [],
    isLoading,
    error,
    mutate,
  };
};

const fileFetcher = async ([fileId, client]: [string, ArkaCDNClient]): Promise<FileInfo> => {
  if (!client.isAuthenticated()) {
    throw new Error('No autenticado');
  }
  const response = await client.getFile(fileId);
  return response.data;
};

export const useFile = (client: ArkaCDNClient, fileId: string | null, isAuthenticated: boolean) => {
  const { data, error, isLoading, mutate } = useSWR<FileInfo>(
    isAuthenticated && fileId ? ['file', fileId, client] : null,
    () => fileFetcher([fileId!, client]),
    {
      refreshInterval: (data) => {
        const hasPendingChunks = data?.chunks?.some(
          (chunk) => chunk.uploadStatus === 'pending' || chunk.uploadStatus === 'uploading'
        );
        return hasPendingChunks ? 2000 : 5000;
      },
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  return {
    file: data,
    isLoading,
    error,
    mutate,
  };
};

