import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useConsent, safeLocalStorage } from '@/hooks/useConsent';
import type { LearnerProgress } from '@shared/schema';

export function useSession() {
  const { hasConsent } = useConsent();
  const storage = safeLocalStorage(hasConsent);
  
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return storage.getItem('agentLearningSessionId');
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
      storage.setItem('agentLearningSessionId', data.sessionId);
      queryClient.setQueryData(['/api/progress', data.sessionId], data.progress);
      
      // Clear legacy global classification state when new session starts
      storage.removeItem('classification_unsorted_v1');
      storage.removeItem('classification_sorted_v1');
      storage.removeItem('guided_unsorted_v1');
      storage.removeItem('guided_sorted_v1');
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
