import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import LinearGradient from '@/components/Gradient';
import * as nav from '@/utils/router';
import { useUserStore } from '@/stores/user-store';

export default function IndexScreen() {
  const { profile } = useUserStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('Index screen - Profile:', profile);
      console.log('Index screen - Is onboarded:', profile?.isOnboarded);
      
      if (!profile?.isOnboarded) {
        console.log('Index screen - Navigating to onboarding');
        nav.replace('/onboarding');
      } else {
        console.log('Index screen - Navigating to tabs');
        nav.replace('/(tabs)/home');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [profile?.isOnboarded]);

  return (
    <LinearGradient
      colors={['#0A0A0F', '#1A1A2E', '#16213E']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.title}>Monday</Text>
        <Text style={styles.subtitle}>Smart Alarm Assistant</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});