import { router as expoRouter } from 'expo-router';

export function push(path: string) {
  try {
    expoRouter.push(path as any);
  } catch (e) {
    console.log('[router.push] fallback', path, e);
  }
}

export function replace(path: string) {
  try {
    expoRouter.replace(path as any);
  } catch (e) {
    console.log('[router.replace] fallback', path, e);
  }
}

export function back() {
  try {
    expoRouter.back();
  } catch (e) {
    console.log('[router.back] fallback', e);
  }
}
