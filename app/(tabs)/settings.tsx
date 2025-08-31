import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import LinearGradient from '@/components/Gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/stores/user-store';
import * as nav from '@/utils/router';
import { 
  User, 
  Volume2, 
  Globe, 
  Crown,
  Bell,
  Moon,
  Smartphone,
  ChevronRight,
  Star,
  RotateCcw,
} from 'lucide-react-native';
import * as Haptics from '@/utils/haptics';

export default function SettingsScreen() {
  const { profile, updateProfile, resetOnboarding } = useUserStore();
  const [showPersonalityModal, setShowPersonalityModal] = useState(false);
  const [personalityText, setPersonalityText] = useState(profile?.personalityPrompt || '');

  const handleHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impact('Light');
    }
  };

  const handleResetOnboarding = () => {
    handleHaptic();
    resetOnboarding();
    setTimeout(() => {
      nav.replace('/onboarding');
    }, 100);
  };

  const settingSections = [
    {
      title: 'Profile',
      items: [
        {
          id: 'profile',
          title: 'Personal Information',
          subtitle: `${profile?.name} • ${profile?.nickname}`,
          icon: User,
          onPress: () => handleHaptic(),
        },
        {
          id: 'personality',
          title: 'Communication Style',
          subtitle: 'How assistant talks to you',
          icon: User,
          onPress: () => {
            handleHaptic();
            setShowPersonalityModal(true);
          },
        },
        {
          id: 'voice',
          title: 'Assistant Voice',
          subtitle: `${profile?.voiceGender === 'female' ? 'Female' : 'Male'} voice`,
          icon: Volume2,
          onPress: () => handleHaptic(),
        },
        {
          id: 'language',
          title: 'Language',
          subtitle: profile?.language === 'ru' ? 'Русский' : 'English',
          icon: Globe,
          onPress: () => handleHaptic(),
        },
      ],
    },
    {
      title: 'Alarm Settings',
      items: [
        {
          id: 'notifications',
          title: 'Notifications',
          subtitle: 'Allow alarm notifications',
          icon: Bell,
          hasSwitch: true,
          value: true,
          onPress: () => handleHaptic(),
        },
        {
          id: 'difficulty',
          title: 'Question Difficulty',
          subtitle: `Level ${profile?.difficultyLevel || 3} of 5`,
          icon: Star,
          onPress: () => handleHaptic(),
        },
      ],
    },
    {
      title: 'App Settings',
      items: [
        {
          id: 'theme',
          title: 'Dark Mode',
          subtitle: 'Always enabled for better sleep',
          icon: Moon,
          hasSwitch: true,
          value: true,
          disabled: true,
          onPress: () => handleHaptic(),
        },
        {
          id: 'haptics',
          title: 'Haptic Feedback',
          subtitle: 'Vibration for interactions',
          icon: Smartphone,
          hasSwitch: true,
          value: true,
          onPress: () => handleHaptic(),
        },
      ],
    },
    {
      title: 'Advanced',
      items: [
        {
          id: 'reset',
          title: 'Reset Setup',
          subtitle: 'Start onboarding process again',
          icon: RotateCcw,
          onPress: handleResetOnboarding,
        },
      ],
    },
  ];

  const renderSettingItem = (item: any) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.settingItem, item.disabled && styles.settingItemDisabled]}
      onPress={item.onPress}
      disabled={item.disabled}
    >
      <LinearGradient
        colors={['#1F2937', '#374151']}
        style={styles.settingItemGradient}
      >
        <View style={styles.settingItemLeft}>
          <View style={styles.settingIcon}>
            <item.icon size={20} color="#8B5CF6" />
          </View>
          <View style={styles.settingInfo}>
            <Text style={styles.settingTitle}>{item.title}</Text>
            <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
          </View>
        </View>
        <View style={styles.settingItemRight}>
          {item.hasSwitch ? (
            <Switch
              value={item.value}
              onValueChange={() => {}}
              trackColor={{ false: '#374151', true: '#8B5CF6' }}
              thumbColor={item.value ? '#FFFFFF' : '#9CA3AF'}
              disabled={item.disabled}
            />
          ) : (
            <ChevronRight size={20} color="#6B7280" />
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#0A0A0F', '#1A1A2E']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Customize your Monday experience</Text>
          </View>

          <View style={styles.premiumCard}>
            <LinearGradient
              colors={['#8B5CF6', '#3B82F6']}
              style={styles.premiumGradient}
            >
              <Crown size={32} color="#FFFFFF" />
              <Text style={styles.premiumTitle}>Monday Premium</Text>
              <Text style={styles.premiumSubtitle}>
                Unlock unlimited alarms, advanced AI features, and more
              </Text>
              <TouchableOpacity style={styles.premiumButton} onPress={handleHaptic}>
                <View style={styles.premiumButtonContent}>
                  <Text style={styles.premiumButtonText}>Upgrade Now</Text>
                </View>
              </TouchableOpacity>
            </LinearGradient>
          </View>

          {settingSections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.items.map(renderSettingItem)}
              </View>
            </View>
          ))}

          <View style={styles.footer}>
            <Text style={styles.footerText}>Monday AI Alarm v1.0.0</Text>
            <Text style={styles.footerSubtext}>
              Made with ❤️ for smarter mornings
            </Text>
          </View>
        </ScrollView>
        
        <Modal
          visible={showPersonalityModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowPersonalityModal(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <LinearGradient
              colors={['#0A0A0F', '#1A1A2E', '#16213E']}
              style={styles.modalContainer}
            >
              <SafeAreaView style={styles.modalSafeArea}>
                <KeyboardAvoidingView 
                  style={styles.modalKeyboardView}
                  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                  <View style={styles.modalHeader}>
                    <TouchableOpacity 
                      onPress={() => setShowPersonalityModal(false)}
                      style={styles.modalCloseButton}
                    >
                      <Text style={styles.modalCloseText}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.modalTitle}>Communication Style</Text>
                    <TouchableOpacity 
                      onPress={() => {
                        updateProfile({ personalityPrompt: personalityText });
                        setShowPersonalityModal(false);
                        handleHaptic();
                      }}
                      style={styles.modalSaveButton}
                    >
                      <Text style={styles.modalSaveText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.modalContent}>
                    <Text style={styles.modalSubtitle}>
                      Describe how you want the assistant to communicate with you
                    </Text>
                    
                    <TextInput
                      style={[styles.modalTextInput, personalityText.trim().length > 0 && styles.modalTextInputFilled]}
                      placeholder="e.g., 'I want you to be strict and motivating, like a personal trainer. Encourage me and don't let me slack off.'"
                      placeholderTextColor="#6B7280"
                      value={personalityText}
                      onChangeText={setPersonalityText}
                      multiline
                      numberOfLines={6}
                      textAlignVertical="top"
                      autoFocus={false}
                    />
                  </View>
                </KeyboardAvoidingView>
              </SafeAreaView>
            </LinearGradient>
          </TouchableWithoutFeedback>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  premiumCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    borderRadius: 20,
    overflow: 'hidden',
  },
  premiumGradient: {
    padding: 24,
    alignItems: 'center',
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  premiumSubtitle: {
    fontSize: 14,
    color: '#E5E7EB',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  premiumButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  premiumButtonContent: {
    alignItems: 'center',
  },
  premiumButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  sectionContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  settingItem: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItemDisabled: {
    opacity: 0.6,
  },
  settingItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  settingItemRight: {
    marginLeft: 16,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#4B5563',
  },
  modalContainer: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalKeyboardView: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  modalCloseButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalCloseText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalSaveButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  modalSaveText: {
    color: '#8B5CF6',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalTextInput: {
    width: '100%',
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#374151',
    minHeight: 150,
    maxHeight: 200,
  },
  modalTextInputFilled: {
    borderColor: '#8B5CF6',
    borderWidth: 2,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
  },
});