import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { ClassificationSubmission } from '@shared/schema';

export function useClassification(sessionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissions, confidence }: { submissions: ClassificationSubmission[]; confidence: number }) => {
      if (!sessionId) {
        throw new Error('Session ID is required');
      }
      const res = await apiRequest('POST', '/api/classify', {
        sessionId,
        submissions,
        confidence,
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
