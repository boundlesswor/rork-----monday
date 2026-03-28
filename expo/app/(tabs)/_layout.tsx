import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { Settings, Mic, Home as HomeIcon } from 'lucide-react-native';

// Импортируй твои экраны (замени на реальные пути)
import HomeScreen from './home'; // или правильный путь к home/index.tsx
import AssistantScreen from './assistant'; // или правильный путь
import SettingsScreen from './settings'; // или правильный путь

const Tab = createBottomTabNavigator();

export default function TabLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        tabBarStyle: {
          // Если хочешь скрыть таббар глобально, но для stack navigation это может не подойти — лучше управлять visibility в навигаторе
          display: 'none', // Если нужно скрыть, иначе удали эту опцию
          height: 0,
          padding: 0,
          margin: 0,
          borderTopWidth: 0,
          backgroundColor: 'transparent',
        },
      }}
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <HomeIcon size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="assistant"
        component={AssistantScreen}
        options={{
          title: "Monday",
          tabBarIcon: ({ color, size }) => <Mic size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
