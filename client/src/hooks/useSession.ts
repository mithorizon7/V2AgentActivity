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
      return await response.json() as { sessionId: string; progress: LearnerProgress };
    },
    onSuccess: (data: { sessionId: string; progress: LearnerProgress }) => {
      setSessionId(data.sessionId);
      storage.setItem('agentLearningSessionId', data.sessionId);
      queryClient.setQueryData(['/api/progress', data.sessionId], data.progress);
      
      // Clear persisted learning state so new sessions always start fresh
      [
        'classification_unsorted_v1',
        'classification_sorted_v1',
        'classification_explanations_v1',
        'classification_confidence_v1',
        'phase1_guided_unsorted_v1',
        'phase1_guided_sorted_v1',
        'phase1_guided_explanations_v1',
        'phase1_guided_attempts_v1',
        'currentStage',
        'primerComplete',
        'workedExampleComplete',
        'guidedPracticeComplete',
        'circuitBridgeComplete',
        'memoryConnectionsPracticeComplete',
        'phase1Complete',
        'phase2Complete',
        'phase3Complete',
        'phase4Complete',
        'phase5Complete',
      ].forEach((key) => storage.removeItem(key));
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
