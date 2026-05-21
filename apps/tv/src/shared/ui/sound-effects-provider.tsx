import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
  setMuted: (muted: boolean) => void;
};

type SoundRef = MutableRefObject<VideoRef | null>;

const SoundEffectsContext = createContext<SoundEffectsContextValue>({
  playFocus: () => {},
  playSubmit: () => {},
  playError: () => {},
  setMuted: () => {},
});

function toVideoSource(source: ImageRequireSource): ReactVideoSource {
  return source as unknown as ReactVideoSource;
}

function createPlaySound(
  ref: SoundRef,
  mutedRef: MutableRefObject<boolean>,
  minIntervalMs = 0,
) {
  let lastPlayedAt = 0;

  return () => {
    if (mutedRef.current) return;
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
  const mutedRef = useRef(false);

  const pauseFocus = useCallback(() => focusRef.current?.pause(), []);
  const pauseSubmit = useCallback(() => submitRef.current?.pause(), []);
  const pauseError = useCallback(() => errorRef.current?.pause(), []);
  const pauseAll = useCallback(() => {
    pauseFocus();
    pauseSubmit();
    pauseError();
  }, [pauseError, pauseFocus, pauseSubmit]);
  const setMuted = useCallback(
    (muted: boolean) => {
      mutedRef.current = muted;
      if (muted) pauseAll();
    },
    [pauseAll],
  );
  const playFocus = useMemo(() => createPlaySound(focusRef, mutedRef, 45), []);
  const playSubmit = useMemo(() => createPlaySound(submitRef, mutedRef), []);
  const playError = useMemo(() => createPlaySound(errorRef, mutedRef), []);
  const value = useMemo(
    () => ({ playFocus, playSubmit, playError, setMuted }),
    [playError, playFocus, playSubmit, setMuted],
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

export function useSoundEffectsMuted(muted: boolean) {
  const { setMuted } = useContext(SoundEffectsContext);
  useEffect(() => {
    setMuted(muted);
    return () => setMuted(false);
  }, [muted, setMuted]);
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
