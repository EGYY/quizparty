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
import { soundError } from '@shared/assets/sounds';

type SoundEffectsContextValue = {
  playError: () => void;
  setMuted: (muted: boolean) => void;
};

type SoundRef = MutableRefObject<VideoRef | null>;

const SoundEffectsContext = createContext<SoundEffectsContextValue>({
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
  const errorRef = useRef<VideoRef | null>(null);
  const mutedRef = useRef(false);

  const pauseError = useCallback(() => errorRef.current?.pause(), []);
  const setMuted = useCallback(
    (muted: boolean) => {
      mutedRef.current = muted;
      if (muted) pauseError();
    },
    [pauseError],
  );
  const playError = useMemo(() => createPlaySound(errorRef, mutedRef), []);
  const value = useMemo(() => ({ playError, setMuted }), [playError, setMuted]);

  return (
    <SoundEffectsContext.Provider value={value}>
      {children}
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
