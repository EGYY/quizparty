import { NativeModules, Platform } from 'react-native';

function getMetroHost(): string | undefined {
  const scriptUrl = (
    NativeModules.SourceCode as { scriptURL?: string } | undefined
  )?.scriptURL;
  return scriptUrl?.match(/^https?:\/\/([^/:]+)/)?.[1];
}

const fallbackHost = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const host = getMetroHost() ?? fallbackHost;

export const API_ORIGIN = `http://${host}:3001`;
export const API_BASE_URL = `${API_ORIGIN}/api`;
export const SOCKET_BASE_URL = API_ORIGIN;
export const WEB_PUBLIC_ORIGIN = `http://${host}:5173`;
