// src/screens/Closet/components/AIAnalysisModal.tsx
// Gemini AI 분석 진행 상황을 보여주는 프리미엄 모달
// ⭐ v5.0: DeleteConfirmModal과 동일한 글래스모피즘 디자인

import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  withDelay,
  interpolate,
  Extrapolate,
  ZoomIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AIAnalysisModalProps {
  visible: boolean;
  progress: number; // 0-100
  status: 'analyzing' | 'completed' | 'error';
  message: string;
  clothingName?: string;
}

const AIAnalysisModal: React.FC<AIAnalysisModalProps> = ({
  visible,
  progress,
  status,
  message,
  clothingName = '옷',
}) => {
  // 애니메이션 값들
  const progressWidth = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);
  const errorShake = useSharedValue(0);
  const spinnerRotation = useSharedValue(0);

  // 스피너 회전 애니메이션
  useEffect(() => {
    if (status === 'analyzing') {
      spinnerRotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    }
  }, [status]);

  // Progress 바 애니메이션
  useEffect(() => {
    progressWidth.value = withSpring(progress, {
      damping: 15,
      stiffness: 100,
    });
  }, [progress]);

  // 완료 체크마크 애니메이션
  useEffect(() => {
    if (status === 'completed') {
      checkmarkScale.value = withSequence(
        withDelay(200, withSpring(1.15, { damping: 12, stiffness: 180 })),
        withSpring(1, { damping: 15, stiffness: 150 })
      );
    } else {
      checkmarkScale.value = 0;
    }
  }, [status]);

  // 에러 흔들기 애니메이션
  useEffect(() => {
    if (status === 'error') {
      errorShake.value = withSequence(
        withTiming(-8, { duration: 80 }),
        withTiming(8, { duration: 80 }),
        withTiming(-8, { duration: 80 }),
        withTiming(8, { duration: 80 }),
        withTiming(0, { duration: 80 })
      );
    }
  }, [status]);

  // 애니메이션 스타일들
  const progressStyle = useAnimatedStyle(() => {
    const actualWidth = Math.min(SCREEN_WIDTH - 48, 400) - 88;
    const width = interpolate(
      progressWidth.value,
      [0, 100],
      [0, actualWidth],
      Extrapolate.CLAMP
    );
    return { width };
  });

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
    opacity: checkmarkScale.value,
  }));

  const errorShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: errorShake.value }],
  }));

  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinnerRotation.value}deg` }],
  }));

  // 진행 상황에 따른 아이콘
  const renderStatusIcon = () => {
    if (status === 'completed') {
      return (
        <Animated.View style={[styles.iconContainer, checkmarkStyle]}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={72} color="#34C759" />
          </View>
        </Animated.View>
      );
    }

    if (status === 'error') {
      return (
        <Animated.View style={[styles.iconContainer, errorShakeStyle]}>
          <View style={styles.iconCircle}>
            <Ionicons name="close-circle" size={72} color={Colors.error} />
          </View>
        </Animated.View>
      );
    }

    // 분석 중
    return (
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Animated.View style={spinnerStyle}>
            <Ionicons name="sync-circle" size={72} color={Colors.primary} />
          </Animated.View>
        </View>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      {/* 배경 오버레이 */}
      <View style={styles.backdrop}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.3)"
        />

        {/* 모달 컨텐츠 */}
        <View style={styles.modalContainer} pointerEvents="box-none">
          <Animated.View
            entering={ZoomIn.duration(300).springify()}
            exiting={FadeOut.duration(200)}
            style={styles.modalCard}
          >
            {/* 블러 배경 */}
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={20}
              reducedTransparencyFallbackColor="white"
            />

            {/* 글래스 레이어 */}
            <View style={styles.glassLayer} />

            {/* 상단 흰색 라인 */}
            <View style={styles.topLine} />

            {/* 모달 내용 */}
            <View style={styles.contentContainer}>
              {/* 상태 아이콘 */}
              {renderStatusIcon()}

              {/* 타이틀 */}
              <Text style={styles.title}>
                {status === 'analyzing' && 'AI 분석 중'}
                {status === 'completed' && '분석 완료'}
                {status === 'error' && '분석 실패'}
              </Text>

              {/* 옷 이름 */}
              {clothingName && (
                <Text style={styles.clothingName}>"{clothingName}"</Text>
              )}

              {/* Progress Bar */}
              {status === 'analyzing' && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBarBg}>
                    <Animated.View
                      style={[styles.progressBarFill, progressStyle]}
                    />
                  </View>
                  <Text style={styles.progressText}>{Math.round(progress)}%</Text>
                </View>
              )}

              {/* 메시지 */}
              <Text style={styles.message}>{message}</Text>
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  modalCard: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  glassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    zIndex: 1,
  },
  contentContainer: {
    padding: 32,
    alignItems: 'center',
    zIndex: 20,
    position: 'relative',
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  clothingName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(139, 125, 255, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: -1,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default AIAnalysisModal;