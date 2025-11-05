import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

export function useCircuitBuilder(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ blocks, connections }: { blocks: any[]; connections: any[] }) => {
      return await apiRequest('POST', '/api/circuit', {
        sessionId,
        blocks,
        connections,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress', sessionId] });
    },
  });
}
