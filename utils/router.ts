import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

export type RootStackParamList = {
  Tabs: undefined;
  Onboarding: undefined;
  AlarmActive: undefined;
  SleepSettings: undefined;
};

export type TabsParamList = {
  Home: undefined;
  Assistant: undefined;
  Settings: undefined;
};

type AllRoutes = RootStackParamList & TabsParamList;

export const navigationRef = createNavigationContainerRef<AllRoutes>();

function mapPathToRoute(path: string): { name: keyof AllRoutes; params?: object } {
  switch (path) {
    case '/onboarding':
      return { name: 'Onboarding' } as const;
    case '/alarm-active':
      return { name: 'AlarmActive' } as const;
    case '/(tabs)/home':
    case '/home':
      return { name: 'Home' } as const;
    case '/(tabs)/assistant':
    case '/assistant':
      return { name: 'Assistant' } as const;
    case '/(tabs)/settings':
    case '/settings':
      return { name: 'Settings' } as const;
    case '/(tabs)/sleep-settings':
    case '/sleep-settings':
      return { name: 'SleepSettings' } as const;
    default:
      return { name: 'Home' } as const;
  }
}

export function push(pathOrName: string) {
  try {
    const { name, params } = mapPathToRoute(pathOrName);
    if (navigationRef.isReady()) {
      (navigationRef as any).navigate(name, params || {});
    } else {
      console.log('[router.push] nav not ready, queued', name, params);
    }
  } catch (e) {
    console.log('[router.push] error', pathOrName, e);
  }
}

export function replace(pathOrName: string) {
  try {
    const { name, params } = mapPathToRoute(pathOrName);
    if (navigationRef.isReady()) {
      navigationRef.dispatch(CommonActions.reset({ index: 0, routes: [{ name: name as string, params: params || {} }] }));
    } else {
      console.log('[router.replace] nav not ready, queued', name, params);
    }
  } catch (e) {
    console.log('[router.replace] error', pathOrName, e);
  }
}

export function back() {
  try {
    if (navigationRef.isReady() && navigationRef.canGoBack()) navigationRef.goBack();
  } catch (e) {
    console.log('[router.back] error', e);
  }
}