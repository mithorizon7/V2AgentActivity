import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { CircuitBlock, CircuitConnection } from '@shared/schema';

export function useCircuitBuilder(sessionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      blocks,
      connections,
    }: {
      blocks: CircuitBlock[];
      connections: CircuitConnection[];
    }) => {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      const res = await apiRequest('POST', '/api/circuit', {
        sessionId,
        blocks,
        connections,
      });
      return await res.json();
    },
    onSuccess: () => {
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: ['/api/progress', sessionId] });
      }
    },
  });
}
