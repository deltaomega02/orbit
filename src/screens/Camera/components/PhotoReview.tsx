// src/screens/Camera/components/PhotoReview.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from '@react-native-community/blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';

import { Colors } from '../../../constants/colors';
import { styles } from '../CameraScreen.styles';

interface ModeConfig {
  title: string;
  subtitle: string;
  icon: string;
  tip: string;
}

interface PhotoReviewProps {
  imageUri: string;
  mode: 'clothes' | 'body' | 'outfit';
  modeConfig: ModeConfig;
  onRetake: () => void;
  onConfirm: () => void;
}

export const PhotoReview: React.FC<PhotoReviewProps> = ({
  imageUri,
  mode,
  modeConfig,
  onRetake,
  onConfirm,
}) => {
  return (
    <View style={styles.container}>
      <Image source={{ uri: imageUri }} style={styles.capturedImage} />

      {/* Dark overlay */}
      <LinearGradient
        colors={[
          'rgba(0,0,0,0.3)',
          'transparent',
          'transparent',
          'rgba(0,0,0,0.4)',
        ]}
        locations={[0, 0.2, 0.8, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.reviewContainer}>
        {/* 헤더 */}
        <Animated.View
          style={styles.reviewHeader}
          entering={FadeInDown.duration(400)}
        >
          <View style={styles.glassPanel}>
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="transparent"
            />
            <View style={styles.glassPanelContent}>
              <TouchableOpacity onPress={onRetake} style={styles.backButton}>
                <Ionicons
                  name="arrow-back"
                  size={24}
                  color={Colors.textPrimary}
                />
              </TouchableOpacity>
              <View style={styles.headerCenter}>
                <Text style={styles.reviewTitle}>Review</Text>
                <Text style={styles.reviewSubtitle}>{modeConfig.title}</Text>
              </View>
              <View style={{ width: 40 }} />
            </View>
          </View>
        </Animated.View>

        {/* AI Info Card (옷 촬영 시에만) */}
        {mode === 'clothes' && (
          <Animated.View
            style={styles.aiInfoCard}
            entering={FadeInUp.duration(400).delay(200)}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={15}
              reducedTransparencyFallbackColor="transparent"
            />
            <LinearGradient
              colors={['rgba(139,125,255,0.1)', 'rgba(139,125,255,0.05)']}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.aiInfoContent}>
              <View style={styles.aiIconContainer}>
                <Ionicons name="sparkles" size={20} color={Colors.primary} />
              </View>
              <View style={styles.aiTextContainer}>
                <Text style={styles.aiTitle}>AI Processing Ready</Text>
                <Text style={styles.aiDescription}>
                  Background will be removed automatically
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* 액션 버튼 */}
        <Animated.View
          style={styles.reviewActions}
          entering={FadeInUp.duration(400).delay(100)}
        >
          <TouchableOpacity
            style={styles.retakeButtonGlass}
            onPress={onRetake}
            activeOpacity={0.8}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="transparent"
            />
            <View style={styles.buttonContent}>
              <Ionicons name="refresh" size={20} color={Colors.textPrimary} />
              <Text style={styles.retakeText}>Retake</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.confirmButtonGlass}
            onPress={onConfirm}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.buttonContent}>
              <Text style={styles.confirmText}>Use This Photo</Text>
              <Ionicons
                name="checkmark"
                size={20}
                color={Colors.textPrimary}
              />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};