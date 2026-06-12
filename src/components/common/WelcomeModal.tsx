// src/components/common/WelcomeModal.tsx
// 로그인 성공 시 표시되는 미니멀하고 고급스러운 환영 모달

import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/dimensions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface WelcomeModalProps {
  visible: boolean;
  username: string;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({
  visible,
  username,
  onClose,
  autoClose = true,
  autoCloseDelay = 2500,
}) => {
  const opacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      // 부드럽게 페이드인
      opacity.value = withTiming(1, { 
        duration: 400,
        easing: Easing.out(Easing.cubic)
      });
      
      contentOpacity.value = withDelay(
        100,
        withTiming(1, { 
          duration: 500,
          easing: Easing.out(Easing.cubic)
        })
      );

      // 자동 닫기
      if (autoClose) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);

        return () => clearTimeout(timer);
      }
    }
  }, [visible]);

  const handleClose = () => {
    'worklet';
    contentOpacity.value = withTiming(0, { 
      duration: 300,
      easing: Easing.in(Easing.cubic)
    });
    
    opacity.value = withTiming(0, { 
      duration: 400,
      easing: Easing.in(Easing.cubic)
    }, () => {
      runOnJS(onClose)();
    });
  };

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value * 0.4,
  }));

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [
      { 
        translateY: (1 - contentOpacity.value) * 10 
      }
    ],
  }));

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* 백드롭 */}
        <Animated.View style={[styles.backdrop, animatedBackdropStyle]} />

        {/* 모달 콘텐츠 */}
        <Animated.View style={[styles.modalContainer, animatedContentStyle]}>
          <View style={styles.modalContent}>
            {/* iOS 블러 효과 */}
            {Platform.OS === 'ios' && (
              <BlurView
                style={StyleSheet.absoluteFill}
                blurType="light"
                blurAmount={50}
                reducedTransparencyFallbackColor="white"
              />
            )}

            {/* 글래스 배경 */}
            <View style={styles.glassBackground} />
            
            {/* 보더 */}
            <View style={styles.borderLayer} />

            {/* 콘텐츠 */}
            <View style={styles.content}>
              {/* 체크 아이콘 */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <Ionicons name="checkmark" size={28} color="#FFFFFF" />
                </View>
              </View>

              {/* 텍스트 */}
              <Text style={styles.welcomeText}>환영합니다</Text>
              <Text style={styles.username}>{username}님</Text>
              <Text style={styles.subtitle}>
                ORBIT에서 당신만의 스타일을 발견하세요
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  
  modalContainer: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 340,
  },
  
  modalContent: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: Platform.OS === 'ios'
      ? 'rgba(255, 255, 255, 0.1)'
      : 'rgba(255, 255, 255, 0.95)',
    
    // 그림자 - 더 부드럽게
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 16,
  },
  
  glassBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Platform.OS === 'ios'
      ? 'rgba(255, 255, 255, 0.02)'
      : 'transparent',
  },
  
  borderLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'transparent',
  },
  
  content: {
    padding: Spacing.xxl * 1.5,
    alignItems: 'center',
  },
  
  // 아이콘
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    
    // 그림자
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  
  // 텍스트
  welcomeText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    letterSpacing: -0.2,
  },
  
  username: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.md,
    letterSpacing: -0.5,
  },
  
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    opacity: 0.8,
    letterSpacing: -0.1,
  },
});

export default WelcomeModal;