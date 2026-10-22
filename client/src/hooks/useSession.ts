import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useConsent, safeLocalStorage } from '@/hooks/useConsent';
import { sessionIdSchema, type LearnerProgress } from '@shared/schema';

const PERSISTED_LEARNING_STATE_KEYS = [
  'classification_unsorted_v1',
  'classification_sorted_v1',
  'classification_explanations_v1',
  'classification_confidence_v1',
  'classification_explanation_prompt_v1',
  'phase1_guided_unsorted_v1',
  'phase1_guided_sorted_v1',
  'phase1_guided_explanations_v1',
  'phase1_guided_attempts_v1',
  'phase1_guided_explanation_prompt_v1',
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
] as const;

function clearPersistedLearningState(
  storage: ReturnType<typeof safeLocalStorage>,
) {
  PERSISTED_LEARNING_STATE_KEYS.forEach((key) => storage.removeItem(key));
}

function isMissingProgressError(error: Error | null) {
  if (!error) {
    return false;
  }

  return error.message.startsWith('404:') && error.message.includes('Progress not found');
}

export function useSession() {
  const { hasConsent } = useConsent();
  const storage = useMemo(() => safeLocalStorage(hasConsent), [hasConsent]);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    const saved = storage.getItem('agentLearningSessionId');
    return sessionIdSchema.safeParse(saved).success ? saved : null;
  });

  const queryClient = useQueryClient();

  const {
    data: progress,
    error: progressError,
    isLoading,
    refetch,
  } = useQuery<LearnerProgress, Error>({
    queryKey: ['/api/progress', sessionId],
    enabled: !!sessionId,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  const createSession = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/session/create');
      return await response.json() as { sessionId: string; progress: LearnerProgress };
    },
    onSuccess: (data: { sessionId: string; progress: LearnerProgress }) => {
      setSessionId(data.sessionId);
      storage.setItem('agentLearningSessionId', data.sessionId);
      queryClient.setQueryData(['/api/progress', data.sessionId], data.progress);

      clearPersistedLearningState(storage);
    },
  });

  useEffect(() => {
    if (!sessionId) {
      createSession.mutate();
    }
  }, [sessionId]);

  useEffect(() => {
    if (hasConsent && sessionId) {
      storage.setItem('agentLearningSessionId', sessionId);
    }
  }, [hasConsent, sessionId, storage]);

  useEffect(() => {
    if (!sessionId || !isMissingProgressError(progressError)) {
      return;
    }

    queryClient.removeQueries({ queryKey: ['/api/progress', sessionId] });
    storage.removeItem('agentLearningSessionId');
    clearPersistedLearningState(storage);
    setSessionId(null);
  }, [progressError, queryClient, sessionId, storage]);

  const isRecoveringStaleSession = Boolean(sessionId && isMissingProgressError(progressError));

  return {
    sessionId,
    progress,
    isLoading: isLoading || createSession.isPending || isRecoveringStaleSession,
    hasSessionError: Boolean((!sessionId && createSession.error) || (progressError && !isMissingProgressError(progressError))),
    retrySession: () => sessionId ? void refetch() : createSession.mutate(),
  };
}
