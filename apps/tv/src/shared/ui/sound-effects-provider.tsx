import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from 'react';
import { StyleSheet, type ImageRequireSource } from 'react-native';
import Video, { type VideoRef } from 'react-native-video';
import type { ReactVideoSource } from 'react-native-video/lib/types/video';
import {
  soundButtonSubmit,
  soundError,
  soundFocus,
} from '@shared/assets/sounds';

type SoundEffectsContextValue = {
  playFocus: () => void;
  playSubmit: () => void;
  playError: () => void;
};

type SoundRef = MutableRefObject<VideoRef | null>;

const SoundEffectsContext = createContext<SoundEffectsContextValue>({
  playFocus: () => {},
  playSubmit: () => {},
  playError: () => {},
});

function toVideoSource(source: ImageRequireSource): ReactVideoSource {
  return source as unknown as ReactVideoSource;
}

function createPlaySound(ref: SoundRef, minIntervalMs = 0) {
  let lastPlayedAt = 0;

  return () => {
    const now = Date.now();
    if (now - lastPlayedAt < minIntervalMs) return;
    lastPlayedAt = now;

    ref.current?.seek(0);
    ref.current?.resume();
  };
}

export function SoundEffectsProvider({ children }: { children: ReactNode }) {
  const focusRef = useRef<VideoRef | null>(null);
  const submitRef = useRef<VideoRef | null>(null);
  const errorRef = useRef<VideoRef | null>(null);

  const playFocus = useMemo(() => createPlaySound(focusRef, 45), []);
  const playSubmit = useMemo(() => createPlaySound(submitRef), []);
  const playError = useMemo(() => createPlaySound(errorRef), []);
  const pauseFocus = useCallback(() => focusRef.current?.pause(), []);
  const pauseSubmit = useCallback(() => submitRef.current?.pause(), []);
  const pauseError = useCallback(() => errorRef.current?.pause(), []);
  const value = useMemo(
    () => ({ playFocus, playSubmit, playError }),
    [playError, playFocus, playSubmit],
  );

  return (
    <SoundEffectsContext.Provider value={value}>
      {children}
      <Video
        disableFocus
        mixWithOthers="mix"
        paused
        ref={focusRef}
        source={toVideoSource(soundFocus)}
        style={styles.hidden}
        onEnd={pauseFocus}
      />
      <Video
        disableFocus
        mixWithOthers="mix"
        paused
        ref={submitRef}
        source={toVideoSource(soundButtonSubmit)}
        style={styles.hidden}
        onEnd={pauseSubmit}
      />
      <Video
        disableFocus
        mixWithOthers="mix"
        paused
        ref={errorRef}
        source={toVideoSource(soundError)}
        style={styles.hidden}
        onEnd={pauseError}
      />
    </SoundEffectsContext.Provider>
  );
}

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
