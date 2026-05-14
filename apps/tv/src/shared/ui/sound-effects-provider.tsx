import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet } from 'react-native';
import Video from 'react-native-video';
import {
  soundButtonSubmit,
  soundError,
  soundFocus,
} from '@shared/assets/sounds';

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

type SoundEffectsContextValue = {
  playFocus: () => void;
  playSubmit: () => void;
  playError: () => void;
};

const SoundEffectsContext = createContext<SoundEffectsContextValue>({
  playFocus: () => {},
  playSubmit: () => {},
  playError: () => {},
});

// ─────────────────────────────────────────────────────────────────────────────
// Provider — each sound gets its own counter; incrementing the counter changes
// the Video `key`, which remounts it and plays from the start.
// ─────────────────────────────────────────────────────────────────────────────

export function SoundEffectsProvider({ children }: { children: ReactNode }) {
  const [focusKey, setFocusKey] = useState(0);
  const [submitKey, setSubmitKey] = useState(0);
  const [errorKey, setErrorKey] = useState(0);

  const playFocus = useCallback(() => setFocusKey(k => k + 1), []);
  const playSubmit = useCallback(() => setSubmitKey(k => k + 1), []);
  const playError = useCallback(() => setErrorKey(k => k + 1), []);

  return (
    <SoundEffectsContext.Provider value={{ playFocus, playSubmit, playError }}>
      {children}
      {focusKey > 0 ? (
        <Video
          key={`focus-${focusKey}`}
          mixWithOthers="mix"
          paused={false}
          source={soundFocus}
          style={styles.hidden}
        />
      ) : null}
      {submitKey > 0 ? (
        <Video
          key={`submit-${submitKey}`}
          mixWithOthers="mix"
          paused={false}
          source={soundButtonSubmit}
          style={styles.hidden}
        />
      ) : null}
      {errorKey > 0 ? (
        <Video
          key={`error-${errorKey}`}
          mixWithOthers="mix"
          paused={false}
          source={soundError}
          style={styles.hidden}
        />
      ) : null}
    </SoundEffectsContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useSoundEffects() {
  return useContext(SoundEffectsContext);
}

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: 1,
    height: 1,
  },
});
