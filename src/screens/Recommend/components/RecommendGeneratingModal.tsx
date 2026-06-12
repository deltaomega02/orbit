import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSpring,
  Easing,
  ZoomIn,
  FadeOut,
  interpolate,
  Extrapolate,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface RecommendGeneratingModalProps {
  visible: boolean;
  recommendationType: 'weather' | 'schedule' | 'ai';
  progress: number; // 0 ~ 100
}

const RecommendGeneratingModal: React.FC<RecommendGeneratingModalProps> = ({
  visible,
  recommendationType,
  progress,
}) => {
  // 애니메이션 값
  const spinnerRotation = useSharedValue(0);
  const progressWidth = useSharedValue(0);
  const checkmarkScale = useSharedValue(0);

  // 1. 스피너 회전 (로딩 중일 때만)
  useEffect(() => {
    if (visible && progress < 100) {
      spinnerRotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      spinnerRotation.value = 0;
    }
  }, [visible, progress]);

  // 2. 프로그레스 바 애니메이션
  useEffect(() => {
    progressWidth.value = withSpring(progress, {
      damping: 15,
      stiffness: 100,
    });
  }, [progress]);

  // 3. 완료 체크마크 팝업 애니메이션
  useEffect(() => {
    if (progress >= 100) {
      checkmarkScale.value = withSequence(
        withDelay(100, withSpring(1.2, { damping: 10 })),
        withSpring(1)
      );
    } else {
      checkmarkScale.value = 0;
    }
  }, [progress]);

  // 스타일 정의
  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinnerRotation.value}deg` }],
    opacity: progress >= 100 ? 0 : 1, // 완료되면 숨김
  }));

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
    opacity: checkmarkScale.value,
    position: 'absolute', // 스피너 위에 겹치기
  }));

  const progressBarStyle = useAnimatedStyle(() => {
    const totalWidth = Math.min(SCREEN_WIDTH - 48, 400) - 64; // 전체 너비
    const width = interpolate(
      progressWidth.value,
      [0, 100],
      [0, totalWidth],
      Extrapolate.CLAMP
    );
    return { width };
  });

  // 텍스트 및 아이콘 헬퍼 함수
  const getMessage = () => {
    if (progress >= 100) return '나에게 딱 맞는 코디를 찾았어요!';
    
    switch (recommendationType) {
      case 'weather':
        return '현재 날씨 데이터를 분석하여\n최적의 코디를 찾고 있습니다...';
      case 'schedule':
        return '오늘의 일정과 장소를 고려해\n스타일링을 매칭 중입니다...';
      case 'ai':
        return '날씨, 일정, 취향을 종합해\nAI가 완벽한 코디를 생성 중입니다...';
      default:
        return '추천 코디를 생성하고 있습니다...';
    }
  };

  const getIcon = () => {
    switch (recommendationType) {
      case 'weather': return 'partly-sunny';
      case 'schedule': return 'calendar';
      case 'ai': return 'sparkles';
    }
  };

  const getIconColor = () => {
    switch (recommendationType) {
      case 'weather': return '#FF9500';
      case 'schedule': return '#007AFF';
      case 'ai': return Colors.primary;
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        {/* 전체 배경 블러 */}
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={5}
          reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.3)"
        />

        <View style={styles.modalContainer} pointerEvents="box-none">
          <Animated.View
            entering={ZoomIn.duration(300).springify()}
            exiting={FadeOut.duration(200)}
            style={styles.modalCard}
          >
            {/* 카드 내부 블러 및 글래스 효과 */}
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={20}
              reducedTransparencyFallbackColor="white"
            />
            <View style={styles.glassLayer} />
            <View style={styles.topLine} />

            <View style={styles.contentContainer}>
              {/* 아이콘 영역 (스피너 <-> 체크마크 교체) */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  {/* 로딩 중일 때 아이콘 + 스피너 */}
                  <Animated.View style={spinnerStyle}>
                    <Ionicons name={getIcon() as any} size={40} color={getIconColor()} />
                  </Animated.View>
                  
                  {/* 완료 시 체크마크 */}
                  <Animated.View style={checkmarkStyle}>
                    <Ionicons name="checkmark-circle" size={64} color="#34C759" />
                  </Animated.View>
                </View>
              </View>

              <Text style={styles.title}>
                {progress >= 100 ? '분석 완료' : 'AI 코디 분석 중'}
              </Text>

              {/* 프로그레스 바 */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <Animated.View style={[styles.progressBarFill, progressBarStyle]} />
                </View>
                <Text style={styles.progressText}>{Math.min(100, Math.round(progress))}%</Text>
              </View>

              <Text style={styles.message}>{getMessage()}</Text>
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
    top: 0, left: 0, right: 0, bottom: 0,
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
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  glassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  topLine: {
    position: 'absolute',
    top: 0, left: 20, right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  contentContainer: {
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
    zIndex: 20,
  },
  iconContainer: {
    marginBottom: 24,
    height: 80, // 높이 고정하여 흔들림 방지
    justifyContent: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressBarBg: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default RecommendGeneratingModal;