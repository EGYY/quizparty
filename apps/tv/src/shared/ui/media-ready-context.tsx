import { createContext, useContext } from 'react';

/**
 * Provides a callback that TvMediaPlayer calls once when video/audio is
 * ready for display. GamePage wires it to the WebSocket signalMediaReady,
 * which tells the server to start the round timer.
 */
export const MediaReadyContext = createContext<(() => void) | null>(null);

export function useMediaReady(): (() => void) | null {
  return useContext(MediaReadyContext);
}
