import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, type ImageRequireSource } from 'react-native';
import Video from 'react-native-video';
import type { ReactVideoSource } from 'react-native-video/lib/types/video';
import { soundMainTheme } from '@shared/assets/sounds';

type SoundSource = ImageRequireSource;

type TrackState = {
  source: SoundSource;
  loop: boolean;
  key: number;
} | null;

type TrackRequest = {
  loop: boolean;
  order: number;
  source: SoundSource | null | undefined;
};

type MusicContextValue = {
  clearTrackRequest: (id: number) => void;
  setPaused: (paused: boolean) => void;
  setTrackRequest: (
    id: number,
    source: SoundSource | null | undefined,
    loop?: boolean,
  ) => void;
};

const MusicContext = createContext<MusicContextValue>({
  clearTrackRequest: () => {},
  setPaused: () => {},
  setTrackRequest: () => {},
});

let nextMusicRequestId = 1;

function toVideoSource(source: ImageRequireSource): ReactVideoSource {
  return source as unknown as ReactVideoSource;
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const clearTrackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestsRef = useRef(new Map<number, TrackRequest>());
  const [paused, setPaused] = useState(false);
  const [track, setTrackState] = useState<TrackState>({
    source: soundMainTheme,
    loop: true,
    key: 0,
  });

  const applyRequestedTrack = useCallback(() => {
    const activeRequest = [...requestsRef.current.values()].sort(
      (a, b) => b.order - a.order,
    )[0];
    const source = activeRequest ? activeRequest.source : soundMainTheme;
    const loop = activeRequest?.loop ?? true;

    setTrackState(prev => {
      if (source == null) {
        if (clearTrackTimerRef.current != null) {
          clearTimeout(clearTrackTimerRef.current);
        }
        clearTrackTimerRef.current = setTimeout(() => {
          setTrackState(null);
          clearTrackTimerRef.current = null;
        }, 80);
        return prev;
      }

      if (clearTrackTimerRef.current != null) {
        clearTimeout(clearTrackTimerRef.current);
        clearTrackTimerRef.current = null;
      }

      if (prev != null && prev.source === source && prev.loop === loop) {
        return prev;
      }

      return { source, loop, key: (prev?.key ?? 0) + 1 };
    });
  }, []);

  const setTrackRequest = useCallback(
    (id: number, source: SoundSource | null | undefined, loop = true) => {
      requestsRef.current.set(id, { source, loop, order: id });
      applyRequestedTrack();
    },
    [applyRequestedTrack],
  );

  const clearTrackRequest = useCallback(
    (id: number) => {
      requestsRef.current.delete(id);
      applyRequestedTrack();
    },
    [applyRequestedTrack],
  );

  const value = useMemo(
    () => ({ clearTrackRequest, setPaused, setTrackRequest }),
    [clearTrackRequest, setPaused, setTrackRequest],
  );

  useEffect(() => {
    return () => {
      if (clearTrackTimerRef.current != null) {
        clearTimeout(clearTrackTimerRef.current);
      }
    };
  }, []);

  return (
    <MusicContext.Provider value={value}>
      {children}
      {track != null ? (
        <Video
          key={track.key}
          disableFocus
          ignoreSilentSwitch="ignore"
          mixWithOthers="mix"
          paused={paused}
          repeat={track.loop}
          source={toVideoSource(track.source)}
          style={styles.hidden}
        />
      ) : null}
    </MusicContext.Provider>
  );
}

export function useMusicTrack(
  source: SoundSource | null | undefined,
  loop = true,
) {
  const { clearTrackRequest, setTrackRequest } = useContext(MusicContext);
  const idRef = useRef<number | null>(null);

  if (idRef.current == null) {
    idRef.current = nextMusicRequestId;
    nextMusicRequestId += 1;
  }

  useEffect(() => {
    const id = idRef.current;
    if (id == null) return undefined;

    setTrackRequest(id, source, loop);
    return () => clearTrackRequest(id);
  }, [source, loop, clearTrackRequest, setTrackRequest]);
}

export function useMusicPaused(paused: boolean) {
  const { setPaused } = useContext(MusicContext);
  useEffect(() => {
    setPaused(paused);
    return () => setPaused(false);
  }, [paused, setPaused]);
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
