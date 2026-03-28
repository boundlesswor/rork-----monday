import { Platform } from 'react-native';
import { trigger } from 'react-native-haptic-feedback'; // Прямой импорт

export type ImpactStyle = 'Light' | 'Medium' | 'Heavy' | 'Rigid' | 'Soft';

export async function selection(): Promise<void> {
  try {
    if (Platform.OS === 'web') return;
    trigger('selection', { enableVibrateFallback: true });
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
    trigger(map[style], { enableVibrateFallback: true });
  } catch (e) {
    console.log('[haptics.impact] error', e);
  }
}
