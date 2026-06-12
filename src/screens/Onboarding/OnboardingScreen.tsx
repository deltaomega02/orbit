// src/screens/Onboarding/OnboardingScreen.tsx
// 온보딩 화면 - 메인 컴포넌트

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

import { Colors } from '../../constants/colors';
import { Config } from '../../constants/config';
import { styles } from './OnboardingScreen.styles';
import { OnboardingStep } from './components/OnboardingStep';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 타입 정의
interface OnboardingStepData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: string[];
}

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [currentStep, setCurrentStep] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const progress = useSharedValue(0);

  // 온보딩 스텝 데이터
  const onboardingSteps: OnboardingStepData[] = [
    {
      id: '1',
      title: 'Welcome to Orbit',
      subtitle: 'Your Style, Your Universe',
      description:
        'Transform your wardrobe into a personalized fashion universe with AI-powered styling',
      icon: 'planet-outline',
      gradient: [Colors.primary, Colors.secondary],
    },
    {
      id: '2',
      title: 'Smart Digital Closet',
      subtitle: 'Organize Effortlessly',
      description:
        'Photograph your clothes and let AI remove backgrounds instantly. Build your digital wardrobe in minutes',
      icon: 'shirt-outline',
      gradient: ['#667eea', '#764ba2'],
    },
    {
      id: '3',
      title: 'AI Style Assistant',
      subtitle: 'Perfect Outfits Daily',
      description:
        'Get personalized outfit recommendations based on weather, occasion, and your unique style',
      icon: 'sparkles',
      gradient: ['#f093fb', '#f5576c'],
    },
    {
      id: '4',
      title: 'Virtual Try-On',
      subtitle: 'See Before You Wear',
      description:
        'Visualize outfits on your body with our advanced AI virtual fitting technology',
      icon: 'camera-outline',
      gradient: ['#4facfe', '#00f2fe'],
    },
  ];

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      progress.value = withSpring(newStep);
      scrollRef.current?.scrollTo({
        x: SCREEN_WIDTH * newStep,
        animated: true,
      });
    } else {
      completeOnboarding();
    }
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem(Config.STORAGE_KEYS.ONBOARDING, 'true');
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Main',
            state: {
              routes: [{ name: 'Home' }],
            },
          },
        ],
      });
    } catch (error) {
      console.error('Error saving onboarding status:', error);
    }
  };

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(
        progress.value,
        [0, onboardingSteps.length - 1],
        [SCREEN_WIDTH / onboardingSteps.length, SCREEN_WIDTH]
      ),
    };
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      {currentStep < onboardingSteps.length - 1 && (
        <TouchableOpacity style={styles.skipButton} onPress={skipOnboarding}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressBarStyle]} />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.scrollView}
      >
        {onboardingSteps.map((step, index) => (
          <OnboardingStep
            key={step.id}
            step={step}
            index={index}
            currentStep={currentStep}
          />
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[styles.dot, index === currentStep && styles.dotActive]}
            />
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity onPress={nextStep} style={styles.nextButton}>
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark || Colors.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButtonGradient}
          >
            <Text style={styles.nextButtonText}>
              {currentStep === onboardingSteps.length - 1
                ? 'Get Started'
                : 'Next'}
            </Text>
            <Ionicons
              name={
                currentStep === onboardingSteps.length - 1
                  ? 'rocket'
                  : 'arrow-forward'
              }
              size={20}
              color={Colors.textPrimary}
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Terms Text */}
        {currentStep === onboardingSteps.length - 1 && (
          <Animated.View entering={FadeInUp.duration(400).delay(200)}>
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>
            </Text>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default OnboardingScreen;