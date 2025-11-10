import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const CONSENT_KEY = 'user_consent_storage';

// All localStorage keys used by the learning platform
const LEARNING_STORAGE_KEYS = [
  'agentLearningSessionId',
  'classification_unsorted_v1',
  'classification_sorted_v1', 
  'classification_explanations_v1',
  'phase1_guided_unsorted_v1',
  'phase1_guided_sorted_v1',
  'phase1_guided_explanations_v1',
  'phase1_guided_attempts_v1',
  'primerComplete',
  'workedExampleComplete',
  'guidedPracticeComplete',
];

export type ConsentStatus = 'pending' | 'granted' | 'denied';

interface ConsentState {
  status: ConsentStatus;
  timestamp: number;
}

interface ConsentContextType {
  consentStatus: ConsentStatus;
  grantConsent: () => void;
  denyConsent: () => void;
  resetConsent: () => void;
  hasConsent: boolean;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export function ConsentProvider({ children }: { children: ReactNode }) {
  // Initialize consent status synchronously from localStorage so components
  // can read it immediately on first render (critical for data rehydration)
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        const state: ConsentState = JSON.parse(stored);
        return state.status;
      }
    } catch (e) {
      // If we can't read localStorage, remain in pending state
    }
    return 'pending';
  });

  const grantConsent = () => {
    const state: ConsentState = {
      status: 'granted',
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
      setConsentStatus('granted');
    } catch (e) {
      console.error('Failed to save consent preference');
    }
  };

  const denyConsent = () => {
    const state: ConsentState = {
      status: 'denied',
      timestamp: Date.now(),
    };
    try {
      // Clear all learning progress when consent is denied
      LEARNING_STORAGE_KEYS.forEach(key => {
        localStorage.removeItem(key);
      });
      
      localStorage.setItem(CONSENT_KEY, JSON.stringify(state));
      setConsentStatus('denied');
    } catch (e) {
      console.error('Failed to save consent preference');
    }
  };

  const resetConsent = () => {
    setConsentStatus('pending');
    try {
      localStorage.removeItem(CONSENT_KEY);
    } catch (e) {
      console.error('Failed to reset consent');
    }
  };

  return (
    <ConsentContext.Provider
      value={{
        consentStatus,
        grantConsent,
        denyConsent,
        resetConsent,
        hasConsent: consentStatus === 'granted',
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsent must be used within ConsentProvider');
  }
  return context;
}

// Safe localStorage wrapper that respects consent
export function safeLocalStorage(consentGranted: boolean) {
  return {
    getItem: (key: string): string | null => {
      if (!consentGranted) return null;
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key: string, value: string): void => {
      if (!consentGranted) return;
      try {
        localStorage.setItem(key, value);
      } catch (e) {
        console.warn('Failed to save to localStorage:', e);
      }
    },
    removeItem: (key: string): void => {
      if (!consentGranted) return;
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn('Failed to remove from localStorage:', e);
      }
    },
  };
}
