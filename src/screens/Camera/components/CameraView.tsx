// src/screens/Camera/components/CameraView.tsx

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera, CameraDevice } from 'react-native-vision-camera';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from '@react-native-community/blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  SharedValue,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Dimensions } from 'react-native';

import { Colors } from '../../../constants/colors';
import { styles } from '../CameraScreen.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ModeConfig {
  title: string;
  subtitle: string;
  icon: string;
  tip: string;
}

interface CameraViewProps {
  cameraRef: React.RefObject<Camera | null>;
  device: CameraDevice;
  isActive: boolean;
  mode: 'clothes' | 'body' | 'outfit';
  modeConfig: ModeConfig;
  isCapturing: boolean;
  shutterAnimation: SharedValue<number>;
  shutterOpacity: SharedValue<number>;
  guidePulse: SharedValue<number>;
  onClose: () => void;
  onTakePicture: () => void;
}


export const CameraView: React.FC<CameraViewProps> = ({
  cameraRef,
  device,
  isActive,
  mode,
  modeConfig,
  isCapturing,
  shutterAnimation,
  shutterOpacity,
  guidePulse,
  onClose,
  onTakePicture,
}) => {
  // Guide animation
  useEffect(() => {
    guidePulse.value = withSequence(
      withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
    );
    const interval = setInterval(() => {
      guidePulse.value = withSequence(
        withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const animatedShutterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shutterAnimation.value }],
  }));

  const animatedFlashStyle = useAnimatedStyle(() => ({
    opacity: shutterOpacity.value,
    pointerEvents: shutterOpacity.value > 0 ? 'auto' : 'none',
  }));

  const animatedGuideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: guidePulse.value }],
  }));

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive}
        photo={true}
        photoQualityBalance="quality"
      />

      {/* 플래시 */}
      <Animated.View
        style={[styles.flashOverlay, animatedFlashStyle]}
        pointerEvents="none"
      />

      <SafeAreaView style={styles.cameraOverlay}>
        {/* 헤더 */}
        <Animated.View
          style={styles.cameraHeader}
          entering={FadeInDown.duration(600)}
        >
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="transparent"
            />
            <View style={styles.glassButtonInner}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </View>
          </TouchableOpacity>

          <View style={styles.modeBadge}>
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="transparent"
            />
            <View style={styles.modeBadgeContent}>
              <Ionicons
                name={modeConfig.icon as any}
                size={16}
                color={Colors.textPrimary}
              />
              <Text style={styles.modeTitle}>{modeConfig.title}</Text>
            </View>
          </View>

          <View style={{ width: 44 }} />
        </Animated.View>

        {/* 캡쳐 가이드 */}
        <View style={styles.captureGuideContainer}>
          {(mode === 'clothes' || mode === 'outfit') && (
            <Animated.View style={[styles.itemGuide, animatedGuideStyle]}>
              <View style={styles.guideCorner1} />
              <View style={styles.guideCorner2} />
              <View style={styles.guideCorner3} />
              <View style={styles.guideCorner4} />
              <View style={styles.guideCenterDot} />
            </Animated.View>
          )}

          {mode === 'body' && (
            <Animated.View style={[styles.bodyGuide, animatedGuideStyle]}>
              <View style={styles.bodyGuideFrame}>
                <LinearGradient
                  colors={[Colors.primary + '30', Colors.primary + '10']}
                  style={styles.bodyGuideGradient}
                />
                <Ionicons
                  name="body-outline"
                  size={200}
                  color={Colors.primary + '40'}
                />
              </View>
            </Animated.View>
          )}
        </View>

        {/* 바텀 */}
        <Animated.View
          style={styles.bottomControlsContainer}
          entering={FadeInUp.duration(600)}
        >
          {/* 툴팁 */}
          <Animated.View
            style={styles.tipCard}
            entering={FadeInUp.duration(600).delay(200)}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="transparent"
            />
            <View style={styles.tipContent}>
              <View style={styles.tipDot} />
              <Text style={styles.tipText}>{modeConfig.tip}</Text>
            </View>
          </Animated.View>

          {/* 메인 컨트롤 */}
          <View style={styles.mainControls}>
            <Animated.View style={animatedShutterStyle}>
              <Pressable
                style={styles.shutterButton}
                onPress={onTakePicture}
                disabled={isCapturing}
              >
                <LinearGradient
                  colors={[
                    'rgba(255,255,255,0.95)',
                    'rgba(255,255,255,0.85)',
                  ]}
                  style={styles.shutterOuter}
                >
                  <View style={styles.shutterInner}>
                    {isCapturing && (
                      <ActivityIndicator size="small" color={Colors.primary} />
                    )}
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};