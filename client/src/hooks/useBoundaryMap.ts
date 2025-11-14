import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { BoundaryElement, BoundaryConnection } from '@shared/schema';

export function useBoundaryMap(sessionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ elements, connections }: { elements: BoundaryElement[]; connections: BoundaryConnection[] }) => {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      return await apiRequest('POST', '/api/boundary-map', {
        sessionId,
        elements,
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
