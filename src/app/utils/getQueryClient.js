import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

export const queryClient = cache(() => new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60 * 1000,     // Data stays fresh for 1 minute
            cacheTime: 5 * 60 * 1000, // Cache persists for 5 minutes
        }
    }
})); 