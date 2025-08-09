"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes - optimized for production
        gcTime: 30 * 60 * 1000, // 30 minutes - better caching for production
        retry: 2, // More retries for production reliability
        refetchOnWindowFocus: false,
        // Disable background refetching in production for better performance
        refetchOnMount: true,
        refetchOnReconnect: true,
        refetchIntervalInBackground: false,
      },
      mutations: {
        retry: 1, // Retry failed mutations once
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}