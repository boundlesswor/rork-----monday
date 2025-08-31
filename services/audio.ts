import { Audio as ExpoAudio } from 'expo-av';

export const Audio = ExpoAudio;

export async function createRemoteSound(
  uri: string,
  onPlaybackStatusUpdate?: (status: unknown) => void,
) {
  const { sound } = await ExpoAudio.Sound.createAsync(
    { uri },
    { volume: 1.0, shouldPlay: true, isLooping: false },
    (status) => onPlaybackStatusUpdate && onPlaybackStatusUpdate(status as unknown)
  );
  return sound;
}
