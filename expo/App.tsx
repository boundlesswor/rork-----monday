import React, { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native'; // Из RN, не Expo
import SplashScreen from 'react-native-splash-screen'; // Новая lib
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Импортируй экраны (замени на реальные пути)
import IndexScreen from './index'; // app/index.tsx
import OnboardingScreen from './onboarding'; // app/onboarding.tsx
import TabsNavigator from './(tabs)/_layout'; // Табы как nested navigator
import AlarmActiveScreen from './alarm-active'; // app/alarm-active.tsx

const queryClient = new QueryClient();
const Stack = createStackNavigator();

function RootLayoutNav() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      // Здесь загружай ресурсы (fonts, etc.)
      setIsReady(true);
      SplashScreen.hide(); // Скрываем splash
    };
    initializeApp();
  }, []);

  if (!isReady) {
    return null;
  }

  return (
    <>
      <StatusBar barStyle="light-content" /> {/* Из RN */}
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#0A0A0F' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" component={IndexScreen} />
        <Stack.Screen name="onboarding" component={OnboardingScreen} />
        <Stack.Screen name="tabs" component={TabsNavigator} />
        <Stack.Screen
          name="alarmActive"
          component={AlarmActiveScreen}
          options={{ presentation: 'fullScreenModal' }}
        />
      </Stack.Navigator>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <NavigationContainer>
          <RootLayoutNav />
        </NavigationContainer>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
