import { Platform } from 'react-native';

let RNHF: { trigger: (type: string, options?: { enableVibrateFallback?: boolean; ignoreAndroidSystemSettings?: boolean }) => void } | null = null;
try {
  // @ts-ignore
  RNHF = require('react-native-haptic-feedback');
} catch {}

export type ImpactStyle = 'Light' | 'Medium' | 'Heavy' | 'Rigid' | 'Soft';

export async function selection(): Promise<void> {
  try {
    if (Platform.OS === 'web') return;
    if (RNHF) RNHF.trigger('selection', { enableVibrateFallback: true });
  } catch (e) {
    console.log('[haptics.selection] error', e);
  }
}

export async function impact(style: ImpactStyle = 'Light'): Promise<void> {
  try {
    if (Platform.OS === 'web') return;
    const map: Record<ImpactStyle, string> = {
      Light: 'impactLight',
      Medium: 'impactMedium',
      Heavy: 'impactHeavy',
      Rigid: 'impactRigid',
      Soft: 'impactSoft',
    };
    if (RNHF) RNHF.trigger(map[style], { enableVibrateFallback: true });
  } catch (e) {
    console.log('[haptics.impact] error', e);
  }
}
