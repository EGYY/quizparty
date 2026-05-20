import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, type ImageRequireSource } from 'react-native';
import Video from 'react-native-video';
import type { ReactVideoSource } from 'react-native-video/lib/types/video';
import {
  soundButtonSubmit,
  soundError,
  soundFocus,
} from '@shared/assets/sounds';

function toVideoSource(source: ImageRequireSource): ReactVideoSource {
  return source as unknown as ReactVideoSource;
}

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
  const value = useMemo(
    () => ({ playFocus, playSubmit, playError }),
    [playError, playFocus, playSubmit],
  );

  return (
    <SoundEffectsContext.Provider value={value}>
      {children}
      {focusKey > 0 ? (
        <Video
          key={`focus-${focusKey}`}
          disableFocus
          mixWithOthers="mix"
          paused={false}
          source={toVideoSource(soundFocus)}
          style={styles.hidden}
        />
      ) : null}
      {submitKey > 0 ? (
        <Video
          key={`submit-${submitKey}`}
          disableFocus
          mixWithOthers="mix"
          paused={false}
          source={toVideoSource(soundButtonSubmit)}
          style={styles.hidden}
        />
      ) : null}
      {errorKey > 0 ? (
        <Video
          key={`error-${errorKey}`}
          disableFocus
          mixWithOthers="mix"
          paused={false}
          source={toVideoSource(soundError)}
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
