import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { FailureMode } from '@shared/schema';

export function useSimulation(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ circuit, failureModes }: { circuit: any; failureModes: FailureMode[] }) => {
      return await apiRequest('POST', '/api/simulate', {
        sessionId,
        circuit,
        failureModes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress', sessionId] });
    },
  });
}
