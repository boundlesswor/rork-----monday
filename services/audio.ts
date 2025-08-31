import TrackPlayer from 'react-native-track-player'; // Прямой импорт (убрали try)

export const Audio = {
  // For compatibility where Audio.Sound.createAsync was used
  Sound: {
    async createAsync(source: { uri: string }, initialStatus?: { volume?: number; shouldPlay?: boolean; isLooping?: boolean }, onPlaybackStatusUpdate?: (status: unknown) => void) {
      await TrackPlayer.setupPlayer({});
      await TrackPlayer.reset();
      await TrackPlayer.add({ id: 'preview', url: source.uri, title: 'Preview' });
      if (onPlaybackStatusUpdate) {
        const sub = TrackPlayer.addEventListener('playback-state', (state: unknown) => onPlaybackStatusUpdate(state));
      }
      if (initialStatus?.shouldPlay !== false) await TrackPlayer.play();
      const sound = {
        async stopAsync() { try { await TrackPlayer.stop(); } catch {} },
        async unloadAsync() { try { await TrackPlayer.reset(); } catch {} },
      };
      return { sound };
    }
  }
};

export async function createRemoteSound(
  uri: string,
  onPlaybackStatusUpdate?: (status: unknown) => void,
) {
  const { sound } = await Audio.Sound.createAsync(
    { uri },
    { volume: 1.0, shouldPlay: true, isLooping: false },
    (status) => onPlaybackStatusUpdate && onPlaybackStatusUpdate(status as unknown)
  );
  return sound as { stopAsync: () => Promise<void>; unloadAsync: () => Promise<void> };
}
