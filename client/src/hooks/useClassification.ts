import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { ClassificationSubmission } from '@shared/schema';

export function useClassification(sessionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ submissions, confidence }: { submissions: ClassificationSubmission[]; confidence?: number }) => {
      return await apiRequest('POST', '/api/classify', {
        submissions,
        ...(confidence !== undefined && { confidence }),
      });
    },
    onSuccess: () => {
      if (sessionId) {
        queryClient.invalidateQueries({ queryKey: ['/api/progress', sessionId] });
      }
    },
  });
}
