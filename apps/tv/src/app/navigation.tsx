import { useCallback, useMemo } from 'react';
import {
  createNavigationContainerRef,
  useNavigation,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TvQuiz } from '@entities/quiz';
import type { TvRoom } from '@entities/room';

export type TvRoute =
  | { name: 'home' }
  | { name: 'lobby'; quiz: TvQuiz; room: TvRoom }
  | {
      name: 'game';
      playerId: string;
      playerToken: string;
      quiz: TvQuiz;
      room: TvRoom;
    };

export type TvStackParamList = {
  Game: { playerId: string; playerToken: string; quiz: TvQuiz; room: TvRoom };
  Home: undefined;
  Lobby: { quiz: TvQuiz; room: TvRoom };
};

export const tvNavigationRef = createNavigationContainerRef<TvStackParamList>();

type TvNavigationApi = {
  back: () => void;
  home: () => void;
  navigate: (route: TvRoute) => void;
};

function navigateWithNativeStack(
  navigation: NativeStackNavigationProp<TvStackParamList>,
  route: TvRoute,
) {
  if (route.name === 'home') {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
    return;
  }

  if (route.name === 'lobby') {
    navigation.navigate('Lobby', {
      quiz: route.quiz,
      room: route.room,
    });
    return;
  }

  navigation.navigate('Game', {
    playerId: route.playerId,
    playerToken: route.playerToken,
    quiz: route.quiz,
    room: route.room,
  });
}

export function useTvNavigation(): TvNavigationApi {
  const navigation =
    useNavigation<NativeStackNavigationProp<TvStackParamList>>();

  const navigate = useCallback(
    (route: TvRoute) => navigateWithNativeStack(navigation, route),
    [navigation],
  );

  const back = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }, [navigation]);

  const home = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Home' }],
    });
  }, [navigation]);

  return useMemo(
    () => ({
      back,
      home,
      navigate,
    }),
    [back, home, navigate],
  );
}
