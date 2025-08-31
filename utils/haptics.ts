import { Platform } from 'react-native';
import * as ExpoHaptics from 'expo-haptics';

export type ImpactStyle =
  | 'Light'
  | 'Medium'
  | 'Heavy'
  | 'Rigid'
  | 'Soft';

export async function selection(): Promise<void> {
  try {
    if (Platform.OS !== 'web') await ExpoHaptics.selectionAsync();
  } catch (e) {
    console.log('[haptics.selection] error', e);
  }
}

export async function impact(style: ImpactStyle = 'Light'): Promise<void> {
  try {
    if (Platform.OS === 'web') return;
    const map: Record<ImpactStyle, ExpoHaptics.ImpactFeedbackStyle> = {
      Light: ExpoHaptics.ImpactFeedbackStyle.Light,
      Medium: ExpoHaptics.ImpactFeedbackStyle.Medium,
      Heavy: ExpoHaptics.ImpactFeedbackStyle.Heavy,
      Rigid: ExpoHaptics.ImpactFeedbackStyle.Rigid,
      Soft: ExpoHaptics.ImpactFeedbackStyle.Soft,
    };
    await ExpoHaptics.impactAsync(map[style]);
  } catch (e) {
    console.log('[haptics.impact] error', e);
  }
}
