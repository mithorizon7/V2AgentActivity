import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function useCircuitBuilder(sessionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ blocks, connections }: { blocks: any[]; connections: any[] }) => {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      return await apiRequest('POST', '/api/circuit', {
        sessionId,
        blocks,
        connections,
      });
    },
    onSuccess: () => {
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: ['/api/progress', sessionId] });
      }
    },
  });
}
