import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { LearnerProgress } from '@shared/schema';

export function useSession() {
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem('agentLearningSessionId');
  });

  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery<LearnerProgress>({
    queryKey: ['/api/progress', sessionId],
    enabled: !!sessionId,
  });

  const createSession = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('GET', '/api/session/create');
      return response as unknown as { sessionId: string; progress: LearnerProgress };
    },
    onSuccess: (data: { sessionId: string; progress: LearnerProgress }) => {
      setSessionId(data.sessionId);
      localStorage.setItem('agentLearningSessionId', data.sessionId);
      queryClient.setQueryData(['/api/progress', data.sessionId], data.progress);
    },
  });

  useEffect(() => {
    if (!sessionId) {
      createSession.mutate();
    }
  }, [sessionId]);

  return {
    sessionId,
    progress,
    isLoading: isLoading || createSession.isPending,
  };
}
