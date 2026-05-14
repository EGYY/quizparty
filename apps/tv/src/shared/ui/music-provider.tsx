import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet } from 'react-native';
import Video from 'react-native-video';
import { soundMainTheme } from '@shared/assets/sounds';

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

type TrackState = {
  source: any;
  loop: boolean;
  /** Incrementing key forces Video remount (= restart) when source changes */
  key: number;
} | null;

type MusicContextValue = {
  setTrack: (source: unknown, loop?: boolean) => void;
};

const MusicContext = createContext<MusicContextValue>({ setTrack: () => {} });

// ─────────────────────────────────────────────────────────────────────────────
// Provider — renders a single persistent Video at the app level.
// Switching tracks changes `key`, which remounts the Video so playback
// restarts from the beginning of the new track.
// Same track → key unchanged → Video stays mounted → plays through seamlessly.
// ─────────────────────────────────────────────────────────────────────────────

export function MusicProvider({ children }: { children: ReactNode }) {
  const [track, setTrackState] = useState<TrackState>({
    source: soundMainTheme,
    loop: true,
    key: 0,
  });

  const setTrack = useCallback((source: unknown, loop = true) => {
    if (source == null) {
      setTrackState(null);
      return;
    }
    setTrackState(prev => {
      // Same source and same loop mode → don't restart, continue playing
      if (prev != null && prev.source === source && prev.loop === loop)
        return prev;
      return { source, loop, key: (prev?.key ?? 0) + 1 };
    });
  }, []);

  return (
    <MusicContext.Provider value={{ setTrack }}>
      {children}
      {track != null ? (
        <Video
          key={track.key}
          ignoreSilentSwitch="ignore"
          mixWithOthers="mix"
          paused={false}
          playInBackground
          repeat={track.loop}
          source={track.source}
          style={styles.hidden}
        />
      ) : null}
    </MusicContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook — call inside any screen/widget to declare which track should play.
// `loop` defaults to true. Pass false for one-shot playback.
// When `source` changes the track updates immediately.
// No cleanup needed: the next screen will set its own track.
// ─────────────────────────────────────────────────────────────────────────────

export function useMusicTrack(source: unknown, loop = true) {
  const { setTrack } = useContext(MusicContext);
  useEffect(() => {
    setTrack(source, loop);
  }, [source, loop, setTrack]);
}

const styles = StyleSheet.create({
  // No opacity — opacity:0 can cause tvOS to suspend the rendering layer,
  // which pauses the audio. Positioning off-screen keeps the layer active.
  hidden: {
    position: 'absolute',
    top: -10,
    left: -10,
    width: 1,
    height: 1,
  },
});
