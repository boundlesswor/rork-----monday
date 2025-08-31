import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; // Замена expo-linear-gradient
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native'; // Новый для replace
import { useUserStore, UserProfile } from '@/stores/user-store';
import { User, Volume2, Globe, ChevronLeft, MessageCircle } from 'lucide-react-native';
import { trigger } from 'react-native-haptic-feedback'; // Замена expo-haptics

type Language = 'ru' | 'en' | 'uk';

const { width, height } = Dimensions.get('window');
// ЕДИНЫЕ СЛОТЫ / ВЫСОТЫ (без "магии")
const ICON_SLOT = 88; // зона для иконки (высота)
const FOOTER_HEIGHT = 72; // высота футера с кнопкой
// Резерв под клавиатуру — фиксируем экран будто клава уже открыта (чуть меньше → поле ближе к клавиатуре)
const RESERVED_KEYBOARD_AREA = Platform.OS === 'android' ? 220 : 200;
// ---------- i18n ----------
const getSteps = (language: Language) => {
  const t = {
    ru: {
      language: { title: 'Выберите язык', subtitle: 'Выберите предпочитаемый язык' },
      name: { title: 'Как к вам обращаться?', subtitle: 'Введите ваше имя или как вы хотите, чтобы к вам обращались' },
      voice: { title: 'Голос ассистента', subtitle: 'Выберите голос вашего ИИ-ассистента Monday' },
      personality: { title: 'Настройка общения', subtitle: 'Опишите, как вы хотите, чтобы ассистент с вами общался' },
      btn: { cont: 'Продолжить', start: 'Начать' },
    },
    en: {
      language: { title: 'Choose Language', subtitle: 'Select your preferred language' },
      name: { title: 'How should I address you?', subtitle: 'Enter your name or how you want to be addressed' },
      voice: { title: 'Assistant Voice', subtitle: 'Choose your AI assistant Monday voice' },
      personality: { title: 'Communication Style', subtitle: 'Describe how you want the assistant to communicate with you' },
      btn: { cont: 'Continue', start: 'Get Started' },
    },
    uk: {
      language: { title: 'Оберіть мову', subtitle: 'Виберіть бажану мову' },
      name: { title: 'Як до вас звертатися?', subtitle: 'Введіть ваше імʼя или як ви хочете, щоб до вас зверталися' },
      voice: { title: 'Голос асистента', subtitle: 'Оберіть голос вашого ІІ-асистента Monday' },
      personality: { title: 'Налаштування спілкування', subtitle: 'Опишіть, як ви хочете, щоб асистент з вами спілкувався' },
      btn: { cont: 'Продовжити', start: 'Почати' },
    },
  }[language];
  return [
    { id: 'language', ...t.language, btn: t.btn },
    { id: 'name', ...t.name, btn: t.btn },
    { id: 'voice', ...t.voice, btn: t.btn },
    { id: 'personality', ...t.personality, btn: t.btn },
  ];
};

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [currentStep, setCurrentStep] = useState(0);
  const [slideAnim] = useState(new Animated.Value(0));
  const [formData, setFormData] = useState({
    language: 'ru',
    name: '',
    voiceGender: 'female',
    personalityPrompt: '',
  });
  const navigation = useNavigation(); // Для replace
  const { setProfile, completeOnboarding } = useUserStore();
  const steps = getSteps(formData.language);
  // контентная высота будто клава уже открыта
  const contentMinHeight =
    Math.max(320, height - RESERVED_KEYBOARD_AREA - FOOTER_HEIGHT - insets.top - insets.bottom);

  const handleNext = () => {
    if (Platform.OS !== 'web') trigger('impactLight'); // Замена Haptics
    if (currentStep < steps.length - 1) {
      const next = currentStep + 1;
      Animated.timing(slideAnim, {
        toValue: -next * width,
        duration: 280,
        useNativeDriver: true,
      }).start();
      setCurrentStep(next);
      Keyboard.dismiss();
    } else {
      const profile = {
        name: formData.name,
        language: formData.language,
        voiceGender: formData.voiceGender,
        nickname: formData.name,
        personalityPrompt: formData.personalityPrompt,
        isOnboarded: true,
        difficultyLevel: 3,
        preferredTopics: ['math'],
      };
      setProfile(profile);
      completeOnboarding();
      setTimeout(() => navigation.replace('tabs'), 80); // Замена router.replace('/(tabs)/home') — 'tabs' как nested
    }
  };

  const handleBack = () => {
    if (Platform.OS !== 'web') trigger('impactLight');
    if (currentStep === 0) return;
    const prev = currentStep - 1;
    Animated.timing(slideAnim, {
      toValue: -prev * width,
      duration: 280,
      useNativeDriver: true,
    }).start();
    setCurrentStep(prev);
    Keyboard.dismiss();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.name.trim().length > 0;
      case 3: return formData.personalityPrompt.trim().length > 0;
      default: return true;
    }
  };

  const getButtonText = () => {
    const isLast = currentStep === steps.length - 1;
    const t = steps[currentStep].btn;
    return isLast ? t.start : t.cont;
  };

  // ---------- Steps ----------
  const StepIcon = ({ children }) => (
    <View style={styles.iconSlot}>{children}</View>
  );

  const renderLanguageStep = () => (
    <View style={[styles.stepContent, { minHeight: contentMinHeight }]}>
      <StepIcon><Globe size={64} color="#8B5CF6" /></StepIcon>
      <Text style={styles.stepTitle}>{steps[0].title}</Text>
      <Text style={styles.stepSubtitle}>{steps[0].subtitle}</Text>
      <View style={styles.optionsCol}>
        {[
          { key: 'ru', label: 'Русский' },
          { key: 'uk', label: 'Українська' },
          { key: 'en', label: 'English' },
        ].map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={styles.optionBtn}
            onPress={() => setFormData({ ...formData, language: opt.key })}
            activeOpacity={0.85}
          >
            <View style={[
              styles.optionInner,
              formData.language === opt.key && styles.optionInnerSelected
            ]}>
              <Text style={[
                styles.optionText,
                formData.language === opt.key && styles.optionTextSelected
              ]}>
                {opt.label}
              </Text>
              {formData.language === opt.key && (
                <View style={styles.checkmark}><Text style={styles.checkmarkText}>✓</Text></View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderNameStep = () => (
    <View style={[styles.stepContent, { minHeight: contentMinHeight }]}>
      <StepIcon><User size={64} color="#8B5CF6" /></StepIcon>
      <Text style={styles.stepTitle}>{steps[1].title}</Text>
      <Text style={styles.stepSubtitle}>{steps[1].subtitle}</Text>
      <TextInput
        style={[styles.textInput, formData.name ? styles.textInputFilled : null]}
        placeholder={
          formData.language === 'ru'
            ? 'Например: Александр, Босс, Шеф...'
            : formData.language === 'uk'
            ? 'Наприклад: Олександр, Бос, Шеф...'
            : 'e.g., Alexander, Boss, Chief...'
        }
        placeholderTextColor="#6B7280"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        returnKeyType="done"
        onSubmitEditing={Keyboard.dismiss}
        blurOnSubmit
      />
    </View>
  );

  const renderVoiceStep = () => (
    <View style={[styles.stepContent, { minHeight: contentMinHeight }]}>
      <StepIcon><Volume2 size={64} color="#8B5CF6" /></StepIcon>
      <Text style={styles.stepTitle}>{steps[2].title}</Text>
      <Text style={styles.stepSubtitle}>{steps[2].subtitle}</Text>
      <View style={styles.optionsCol}>
        {[
          {
            key: 'female',
            label:
              formData.language === 'ru' ? 'Женский голос' :
              formData.language === 'uk' ? 'Жіночий голос' : 'Female Voice'
          },
          {
            key: 'male',
            label:
              formData.language === 'ru' ? 'Мужской голос' :
              formData.language === 'uk' ? 'Чоловічий голос' : 'Male Voice'
          },
        ].map(opt => (
          <TouchableOpacity
            key={opt.key}
            style={styles.optionBtn}
            onPress={() => setFormData({ ...formData, voiceGender: opt.key })}
            activeOpacity={0.85}
          >
            <View style={[
              styles.optionInner,
              formData.voiceGender === opt.key && styles.optionInnerSelected
            ]}>
              <View style={{ marginRight: 12 }}>
                <Volume2 size={24} color={formData.voiceGender === opt.key ? '#8B5CF6' : '#6B7280'} />
              </View>
              <Text style={[
                styles.optionText,
                formData.voiceGender === opt.key && styles.optionTextSelected
              ]}>
                {opt.label}
              </Text>
              {formData.voiceGender === opt.key && (
                <View style={styles.checkmark}><Text style={styles.checkmarkText}>✓</Text></View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPersonalityStep = () => (
    <View style={[styles.stepContent, { minHeight: contentMinHeight }]}>
      <StepIcon><MessageCircle size={64} color="#8B5CF6" /></StepIcon>
      <Text style={styles.stepTitle}>{steps[3].title}</Text>
      <Text style={styles.stepSubtitle}>{steps[3].subtitle}</Text>
      <ScrollView
        style={{ width: '100%' }}
        contentContainerStyle={{ paddingBottom: 8 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          style={[styles.textArea, formData.personalityPrompt ? styles.textInputFilled : null]}
          placeholder={
            formData.language === 'ru'
              ? 'Например: "Хочу строгий и мотивирующий тон, как личный тренер..."'
              : formData.language === 'uk'
              ? 'Наприклад: "Хочу суворий і мотивуючий тон, як персональний тренер..."'
              : 'e.g., "Be strict and motivating, like a personal trainer..."'
          }
          placeholderTextColor="#6B7280"
          value={formData.personalityPrompt}
          onChangeText={(text) => setFormData({ ...formData, personalityPrompt: text })}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
          blurOnSubmit
        />
      </ScrollView>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={['#0A0A0F', '#1A1A2E', '#16213E']}
        style={styles.container}
      >
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header */}
          <View style={styles.header}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.backBtn} onPress={handleBack} activeOpacity={0.85}>
                <ChevronLeft size={24} color="#FFFFFF" />
              </TouchableOpacity>
            )}
            <View style={styles.progress}>
              {steps.map((_, i) => (
                <View key={i} style={[styles.dot, i <= currentStep && styles.dotActive]} />
              ))}
            </View>
          </View>
          {/* Content (фиксированная верстка, как при открытой клавиатуре) */}
          <View style={styles.contentOuter}>
            <Animated.View
              style={[
                styles.slider,
                { transform: [{ translateX: slideAnim }] }
              ]}
            >
              {[renderLanguageStep, renderNameStep, renderVoiceStep, renderPersonalityStep].map((fn, i) => (
                <View key={i} style={styles.slide}>
                  {fn()}
                </View>
              ))}
            </Animated.View>
          </View>
          {/* Footer (кнопка на основном фоне, без черной полосы) */}
          <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <TouchableOpacity
              style={[styles.cta, !canProceed() && styles.ctaDisabled]}
              onPress={handleNext}
              disabled={!canProceed()}
              activeOpacity={0.9}
            >
              <Text style={styles.ctaText}>{getButtonText()}</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingTop: 8,
    paddingHorizontal: 24,
    position: 'relative',
  },
  backBtn: {
    position: 'absolute', left: 24, top: 8, zIndex: 2,
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },
  progress: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 8,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#374151' },
  dotActive: { backgroundColor: '#8B5CF6' },

  contentOuter: {
    flex: 1,
    overflow: 'hidden',
  },
  slider: {
    flex: 1,
    width: width * 4,
    flexDirection: 'row',
  },
  slide: {
    width,
    paddingHorizontal: 24,
    // высоту контента контролируем на уровне stepContent
  },

  iconSlot: {
    height: ICON_SLOT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  stepContent: {
    width: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: 12 + FOOTER_HEIGHT,
  },

  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },

  optionsCol: { width: '100%', gap: 12 },
  optionBtn: { width: '100%', borderRadius: 16, overflow: 'hidden' },
  optionInner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 20, backgroundColor: 'rgba(31,41,55,0.8)',
    borderWidth: 1, borderColor: '#374151', borderRadius: 16,
  },
  optionInnerSelected: {
    backgroundColor: 'rgba(139,92,246,0.2)',
    borderColor: '#8B5CF6', borderWidth: 2,
  },
  optionText: { fontSize: 18, color: '#9CA3AF', fontWeight: '600' },
  optionTextSelected: { color: '#FFFFFF' },

  checkmark: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#8B5CF6',
    justifyContent: 'center', alignItems: 'center',
  },
  checkmarkText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },

  textInput: {
    width: '100%',
    padding: 20, borderRadius: 16,
    backgroundColor: 'rgba(31,41,55,0.8)',
    color: '#FFFFFF', fontSize: 18,
    borderWidth: 1, borderColor: '#374151',
  },
  textInputFilled: {
    borderColor: '#8B5CF6', borderWidth: 2, backgroundColor: 'rgba(139,92,246,0.1)',
  },

  textArea: {
    width: '100%',
    padding: 20, borderRadius: 16,
    backgroundColor: 'rgba(31,41,55,0.8)',
    color: '#FFFFFF', fontSize: 16,
    borderWidth: 1, borderColor: '#374151',
    minHeight: 120, maxHeight: 160,
  },

  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    height: FOOTER_HEIGHT,
    // фон прозрачный → виден основной градиент (нет черной полосы)
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  cta: {
    height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#8B5CF6',
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { color: '#FFF', fontSize: 18, fontWeight: '600' },
});
