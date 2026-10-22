import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { SimulationStep } from '@shared/schema';
import type { FailureConfig } from '@shared/runtime/types';

type SimulateBlockIds = {
  perception: string;
  reasoning: string;
  planning: string;
  execution: string;
};

export function useSimulation(sessionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      blockIds,
      fixtureId,
      failureConfig,
    }: {
      blockIds: SimulateBlockIds;
      fixtureId: string;
      failureConfig?: FailureConfig;
    }) => {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      const res = await apiRequest('POST', '/api/simulate', {
        sessionId,
        blockIds,
        fixtureId,
        failureConfig,
      });
      return await res.json() as {
        steps: SimulationStep[];
        success: boolean;
        finalState: Record<string, unknown>;
      };
    },
    onSuccess: () => {
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: ['/api/progress', sessionId] });
      }
    },
  });
}
