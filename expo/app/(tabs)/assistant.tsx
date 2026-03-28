import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Vibration, // Для базового вибро, если не используешь haptic-feedback
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; // Замена, если был expo
// Или если '@/components/Gradient' уже на react-native-linear-gradient, импортируй оттуда
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '@/stores/user-store';
import {
  Mic,
  Send,
  // Volume2, // Не используется в коде, можно удалить если не нужно
  Calendar,
  Cloud,
  MessageCircle,
  Sparkles,
} from 'lucide-react-native';
// import * as Haptics from '@/utils/haptics'; // Удаляем, если Expo-based
import { trigger } from 'react-native-haptic-feedback'; // Новая lib для haptics

const quickCommands = [
  { id: 'weather', text: "What's the weather?", icon: Cloud },
  { id: 'reminder', text: 'Set a reminder', icon: Calendar },
  { id: 'chat', text: "Let's chat", icon: MessageCircle },
];

export default function AssistantScreen() {
  const { profile } = useUserStore();
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [conversation, setConversation] = useState([
    {
      id: '1',
      type: 'assistant',
      text: `Hello ${profile?.nickname || 'there'}! I'm Monday, your AI assistant. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);

  const handleSendMessage = () => {
    if (!message.trim()) return;
    if (Platform.OS !== 'web') {
      trigger('impactLight'); // Замена Haptics
      // Или Vibration.vibrate(10); для простоты
    }
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: message,
      timestamp: new Date(),
    };
    const assistantResponse = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      text: `I understand you said "${message}". This is a demo response. In the full version, I'll provide intelligent responses using AI!`,
      timestamp: new Date(),
    };
    setConversation(prev => [...prev, userMessage, assistantResponse]);
    setMessage('');
  };

  const handleQuickCommand = (command: string) => {
    if (Platform.OS !== 'web') {
      trigger('impactLight');
    }
    setMessage(command);
  };

  const toggleListening = () => {
    if (Platform.OS !== 'web') {
      trigger('impactMedium');
    }
    setIsListening(!isListening);
    
    // In a real app, this would start/stop voice recognition
    setTimeout(() => {
      if (!isListening) {
        setMessage("Hey Monday, what's the weather like today?");
        setIsListening(false);
      }
    }, 2000);
  };

  return (
    <LinearGradient
      colors={['#0A0A0F', '#1A1A2E']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.assistantAvatar}>
            <LinearGradient
              colors={['#8B5CF6', '#3B82F6']}
              style={styles.avatarGradient}
            >
              <Sparkles size={24} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Text style={styles.assistantName}>Monday</Text>
          <Text style={styles.assistantStatus}>
            {isListening ? 'Listening...' : 'Ready to help'}
          </Text>
        </View>
        <ScrollView style={styles.conversation} showsVerticalScrollIndicator={false}>
          {conversation.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageContainer,
                msg.type === 'user' ? styles.userMessage : styles.assistantMessage,
              ]}
            >
              <LinearGradient
                colors={msg.type === 'user'
                  ? ['#8B5CF6', '#3B82F6']
                  : ['#1F2937', '#374151']}
                style={styles.messageBubble}
              >
                <Text style={styles.messageText}>{msg.text}</Text>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>
        <View style={styles.quickCommands}>
          <Text style={styles.quickCommandsTitle}>Quick Commands</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.quickCommandsRow}>
              {quickCommands.map((command) => {
                const IconComponent = command.icon;
                return (
                  <TouchableOpacity
                    key={command.id}
                    style={styles.quickCommandButton}
                    onPress={() => handleQuickCommand(command.text)}
                  >
                    <LinearGradient
                      colors={['#1F2937', '#374151']}
                      style={styles.quickCommandGradient}
                    >
                      <IconComponent size={16} color="#8B5CF6" />
                      <Text style={styles.quickCommandText}>{command.text}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
        <View style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <TouchableOpacity
              style={[
                styles.micButton,
                isListening && styles.micButtonActive,
              ]}
              onPress={toggleListening}
            >
              <LinearGradient
                colors={isListening
                  ? ['#EF4444', '#DC2626']
                  : ['#8B5CF6', '#3B82F6']}
                style={styles.micButtonGradient}
              >
                <Mic size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder="Type your message..."
              placeholderTextColor="#6B7280"
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity
              style={styles.sendButton}
              onPress={handleSendMessage}
              disabled={!message.trim()}
            >
              <LinearGradient
                colors={message.trim()
                  ? ['#8B5CF6', '#3B82F6']
                  : ['#374151', '#374151']}
                style={styles.sendButtonGradient}
              >
                <Send size={20} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
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
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
  },
  assistantAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 12,
  },
  avatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assistantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  assistantStatus: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  conversation: {
    flex: 1,
    paddingHorizontal: 24,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  assistantMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 20,
  },
  quickCommands: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  quickCommandsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  quickCommandsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickCommandButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  quickCommandGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  quickCommandText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  micButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  micButtonActive: {
    transform: [{ scale: 1.1 }],
  },
  micButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#1F2937',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
