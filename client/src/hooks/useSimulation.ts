import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { FailureMode } from '@shared/schema';

export function useSimulation(sessionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ circuit, failureModes }: { circuit: any; failureModes: FailureMode[] }) => {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      return await apiRequest('POST', '/api/simulate', {
        sessionId,
        circuit,
        failureModes,
      });
    },
    onSuccess: () => {
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: ['/api/progress', sessionId] });
      }
    },
  });
}
