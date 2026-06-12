// src/components/common/LogoutConfirmModal.tsx
// 로그아웃 확인을 위한 미니멀하고 고급스러운 글래스모피즘 모달 (RecommendGeneratingModal 스타일 적용)

import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  ZoomIn,
  FadeOut,
} from 'react-native-reanimated';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/dimensions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LogoutConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  visible,
  onConfirm,
  onCancel,
}) => {
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { 
        duration: 300,
        easing: Easing.out(Easing.cubic)
      });
    } else {
      opacity.value = withTiming(0, { 
        duration: 300,
        easing: Easing.in(Easing.cubic)
      });
    }
  }, [visible]);

  const animatedBackdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        {/* 전체 배경 블러 */}
        <Animated.View style={[StyleSheet.absoluteFill, animatedBackdropStyle]}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={5}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.4)"
          />
        </Animated.View>

        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onCancel}
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
            <View style={styles.topHighlight} />

            <View style={styles.contentContainer}>
              {/* 아이콘 영역 */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <LinearGradient
                    colors={['#FF3B30', '#FF6B5E']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <Ionicons name="log-out-outline" size={32} color="#FFFFFF" />
                </View>
              </View>

              {/* 텍스트 */}
              <Text style={styles.title}>로그아웃</Text>
              <Text style={styles.message}>
                정말 로그아웃 하시겠습니까?{'\n'}
                저장되지 않은 변경사항이 있을 수 있습니다.
              </Text>

              {/* 버튼 */}
              <View style={styles.buttonContainer}>
                {/* 취소 버튼 */}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onCancel}
                  activeOpacity={0.7}
                >
                  <View style={styles.cancelButtonGlass} />
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>

                {/* 로그아웃 버튼 */}
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={onConfirm}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#FF3B30', '#FF6B5E']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  />
                  <Text style={styles.confirmButtonText}>로그아웃</Text>
                </TouchableOpacity>
              </View>
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
    maxWidth: 380,
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
  
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  
  contentContainer: {
    paddingVertical: 40,
    paddingHorizontal: 32,
    alignItems: 'center',
    zIndex: 20,
  },
  
  // 아이콘
  iconContainer: {
    marginBottom: 24,
    height: 80,
    justifyContent: 'center',
  },
  
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  
  // 텍스트
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  
  message: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    letterSpacing: -0.1,
  },
  
  // 버튼
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.md,
  },
  
  cancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(120, 120, 128, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
  },
  
  cancelButtonGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  
  confirmButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});

export default LogoutConfirmModal;