import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient'; // Замена expo-linear-gradient
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native'; // Для back
import { useUserStore } from '@/stores/user-store';
import {
  Volume2,
  CheckCircle,
  XCircle,
  Brain,
  Clock,
  ArrowLeft,
} from 'lucide-react-native';
import { trigger } from 'react-native-haptic-feedback'; // Замена expo-haptics

const mathQuestions = [
  { question: "7 × 8 = ?", answer: "56", options: ["54", "56", "58", "60"] },
  { question: "9 × 6 = ?", answer: "54", options: ["52", "54", "56", "58"] },
  { question: "8 × 7 = ?", answer: "56", options: ["54", "56", "58", "60"] },
  { question: "6 × 9 = ?", answer: "54", options: ["52", "54", "56", "58"] },
  { question: "7 × 9 = ?", answer: "63", options: ["61", "63", "65", "67"] },
];

export default function AlarmActiveScreen() {
  const { profile, alarmSettings } = useUserStore();
  const navigation = useNavigation(); // Для back
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Pulse animation for the alarm
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const handleAnswerSelect = (answer) => {
    if (Platform.OS !== 'web') {
      trigger('impactLight'); // Замена
    }
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    const isCorrect = selectedAnswer === mathQuestions[currentQuestion].answer;
   
    if (Platform.OS !== 'web') {
      trigger(isCorrect ? 'impactHeavy' : 'impactMedium'); // Замена
    }
    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
    }
    setShowResult(true);
    setTimeout(() => {
      if (currentQuestion < mathQuestions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        // All questions completed
        setTimeout(() => {
          navigation.goBack(); // Замена router.back()
        }, 2000);
      }
    }, 1500);
  };

  const currentQ = mathQuestions[currentQuestion];
  const isLastQuestion = currentQuestion === mathQuestions.length - 1;
  const progress = ((currentQuestion + 1) / mathQuestions.length) * 100;

  if (showResult) {
    const isCorrect = selectedAnswer === currentQ.answer;
    return (
      <LinearGradient
        colors={isCorrect ? ['#10B981', '#059669'] : ['#EF4444', '#DC2626']}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()} // Замена
          >
            <LinearGradient
              colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
              style={styles.backButtonGradient}
            >
              <ArrowLeft size={24} color="#FFFFFF" />
            </LinearGradient>
          </TouchableOpacity>
         
          <View style={styles.resultContainer}>
            {isCorrect ? (
              <CheckCircle size={80} color="#FFFFFF" />
            ) : (
              <XCircle size={80} color="#FFFFFF" />
            )}
            <Text style={styles.resultTitle}>
              {isCorrect ? 'Correct!' : 'Wrong Answer'}
            </Text>
            {!isCorrect && (
              <Text style={styles.correctAnswer}>
                The correct answer is: {currentQ.answer}
              </Text>
            )}
            {isLastQuestion && (
              <View style={styles.finalScore}>
                <Text style={styles.finalScoreText}>
                  Final Score: {correctAnswers}/{mathQuestions.length}
                </Text>
                <Text style={styles.finalScoreSubtext}>
                  {correctAnswers >= 3 ? 'Great job! 🎉' : 'Keep practicing! 💪'}
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#0A0A0F', '#1A1A2E', '#16213E']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()} // Замена
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.backButtonGradient}
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </LinearGradient>
        </TouchableOpacity>
       
        <View style={styles.header}>
          <Animated.View
            style={[
              styles.alarmIcon,
              { transform: [{ scale: pulseAnim }] }
            ]}
          >
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.alarmIconGradient}
            >
              <Volume2 size={32} color="#FFFFFF" />
            </LinearGradient>
          </Animated.View>
          <Text style={styles.alarmTitle}>Wake Up Challenge!</Text>
          <Text style={styles.alarmSubtitle}>
            Answer correctly to stop the alarm
          </Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.progressText}>
            Question {currentQuestion + 1} of {mathQuestions.length}
          </Text>
        </View>
        <View style={styles.questionContainer}>
          <LinearGradient
            colors={['#1F2937', '#374151']}
            style={styles.questionCard}
          >
            <Brain size={24} color="#8B5CF6" />
            <Text style={styles.questionText}>{currentQ.question}</Text>
          </LinearGradient>
        </View>
        <View style={styles.optionsContainer}>
          {currentQ.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === option && styles.optionButtonSelected,
              ]}
              onPress={() => handleAnswerSelect(option)}
            >
              <LinearGradient
                colors={selectedAnswer === option
                  ? ['#8B5CF6', '#3B82F6']
                  : ['#1F2937', '#374151']}
                style={styles.optionGradient}
              >
                <Text style={[
                  styles.optionText,
                  selectedAnswer === option && styles.optionTextSelected,
                ]}>
                  {option}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              !selectedAnswer && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmitAnswer}
            disabled={!selectedAnswer}
          >
            <LinearGradient
              colors={selectedAnswer
                ? ['#8B5CF6', '#3B82F6']
                : ['#374151', '#374151']}
              style={styles.submitButtonGradient}
            >
              <Text style={styles.submitButtonText}>Submit Answer</Text>
            </LinearGradient>
          </TouchableOpacity>
          <View style={styles.scoreContainer}>
            <Clock size={16} color="#9CA3AF" />
            <Text style={styles.scoreText}>
              Score: {correctAnswers}/{currentQuestion + (showResult ? 1 : 0)}
            </Text>
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
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  alarmIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 20,
  },
  alarmIconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  alarmSubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
  },
  progressText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  questionContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  questionCard: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    gap: 16,
  },
  questionText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  optionsContainer: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  optionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionButtonSelected: {
    transform: [{ scale: 1.02 }],
  },
  optionGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  scoreText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  correctAnswer: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  finalScore: {
    alignItems: 'center',
    marginTop: 32,
  },
  finalScoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  finalScoreSubtext: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
});
