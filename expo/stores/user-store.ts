import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  language: 'ru' | 'en' | 'uk';
  voiceGender: 'male' | 'female';
  nickname: string;
  personalityPrompt: string;
  isOnboarded: boolean;
  difficultyLevel: number;
  preferredTopics: string[];
}

export type RepeatDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface SleepPlan {
  bedTime: string;
  wakeTime: string;
  repeatDays: RepeatDay[];
  ringtoneId: string;
  enabled: boolean;
}

export interface AlarmSettings {
  time: string;
  isEnabled: boolean;
  topic: 'math' | 'geography' | 'history' | 'physics';
  questionsCount: number;
}

interface UserStore {
  profile: UserProfile | null;
  alarmSettings: AlarmSettings;
  sleepPlan: SleepPlan;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setAlarmSettings: (settings: Partial<AlarmSettings>) => void;
  setSleepPlan: (updates: Partial<SleepPlan>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      profile: null,
      alarmSettings: {
        time: '07:00',
        isEnabled: false,
        topic: 'math',
        questionsCount: 10,
      },
      sleepPlan: {
        bedTime: '22:00',
        wakeTime: '08:00',
        repeatDays: [1,2,3,4,5],
        ringtoneId: 'polaris',
        enabled: true,
      },
      setProfile: (profile) => set({ profile }),
      updateProfile: (updates) => set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null
      })),
      setAlarmSettings: (settings) => set((state) => ({
        alarmSettings: { ...state.alarmSettings, ...settings }
      })),
      setSleepPlan: (updates) => set((state) => ({
        sleepPlan: { ...state.sleepPlan, ...updates }
      })),
      completeOnboarding: () => set((state) => ({
        profile: state.profile ? { ...state.profile, isOnboarded: true } : null
      })),
      resetOnboarding: () => set(() => ({
        profile: null
      })),
    }),
    {
      name: 'monday-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);