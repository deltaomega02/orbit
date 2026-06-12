// src/screens/Onboarding/components/OnboardingStep.tsx

import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Colors } from '../../../constants/colors';
import { styles } from '../OnboardingScreen.styles';

interface OnboardingStepData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  gradient: string[];
}

interface OnboardingStepProps {
  step: OnboardingStepData;
  index: number;
  currentStep: number;
}

export const OnboardingStep: React.FC<OnboardingStepProps> = ({
  step,
  index,
  currentStep,
}) => {
  return (
    <View style={styles.stepContainer}>
      <Animated.View
        entering={index === currentStep ? FadeInUp.duration(600) : undefined}
        style={styles.contentContainer}
      >
        {/* Icon with Gradient Background */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark || Colors.primary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.iconContainer}
        >
          <Ionicons name={step.icon as any} size={80} color={Colors.textPrimary} />
        </LinearGradient>

        {/* Text Content */}
        <Animated.View
          entering={
            index === currentStep ? FadeInDown.duration(600).delay(200) : undefined
          }
          style={styles.textContainer}
        >
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.subtitle}>{step.subtitle}</Text>
          <Text style={styles.description}>{step.description}</Text>
        </Animated.View>

        {/* Decorative Elements */}
        <View style={styles.decorativeOrbs}>
          <View style={[styles.orb, styles.orbSmall]} />
          <View style={[styles.orb, styles.orbMedium]} />
          <View style={[styles.orb, styles.orbLarge]} />
        </View>
      </Animated.View>
    </View>
  );
};