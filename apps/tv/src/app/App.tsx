import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { tvNavigationRef, type TvStackParamList } from '@app/navigation';
import { ToastProvider } from '@app/toast-provider';
import { HomePage } from '@pages/home';
import { GamePage } from '@pages/game';
import { LobbyPage } from '@pages/lobby';
import { MusicProvider } from '@shared/ui/music-provider';
import { SoundEffectsProvider } from '@shared/ui/sound-effects-provider';

const Stack = createNativeStackNavigator<TvStackParamList>();
type LobbyScreenProps = NativeStackScreenProps<TvStackParamList, 'Lobby'>;
type GameScreenProps = NativeStackScreenProps<TvStackParamList, 'Game'>;

export default function App() {
  return (
    <SafeAreaProvider>
      <MusicProvider>
        <SoundEffectsProvider>
          <StatusBar barStyle="light-content" hidden />
          <ToastProvider>
            <NavigationContainer ref={tvNavigationRef}>
              <Stack.Navigator
                initialRouteName="Home"
                screenOptions={{
                  animation: 'fade',
                  contentStyle: { backgroundColor: '#101426' },
                  headerShown: false,
                  orientation: 'landscape',
                }}
              >
                <Stack.Screen component={HomePage} name="Home" />
                <Stack.Screen name="Lobby">
                  {({ route }: LobbyScreenProps) => (
                    <LobbyPage
                      route={{
                        name: 'lobby',
                        quiz: route.params.quiz,
                        room: route.params.room,
                      }}
                    />
                  )}
                </Stack.Screen>
                <Stack.Screen name="Game">
                  {({ route }: GameScreenProps) => (
                    <GamePage
                      route={{
                        name: 'game',
                        playerId: route.params.playerId,
                        quiz: route.params.quiz,
                        room: route.params.room,
                      }}
                    />
                  )}
                </Stack.Screen>
              </Stack.Navigator>
            </NavigationContainer>
          </ToastProvider>
        </SoundEffectsProvider>
      </MusicProvider>
    </SafeAreaProvider>
  );
}
