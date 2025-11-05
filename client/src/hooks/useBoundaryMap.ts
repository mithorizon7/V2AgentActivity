import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { BoundaryElement, BoundaryConnection } from '@shared/schema';

export function useBoundaryMap(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ elements, connections }: { elements: BoundaryElement[]; connections: BoundaryConnection[] }) => {
      return await apiRequest('POST', '/api/boundary-map', {
        sessionId,
        elements,
        connections,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/progress', sessionId] });
    },
  });
}
