// src/screens/Settings/components/SaveSuccessModal.tsx
// 저장 완료 확인 모달

import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';
import { Colors } from '../../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SaveSuccessModalProps {
  visible: boolean;
  onConfirm: () => void;
}

export const SaveSuccessModal: React.FC<SaveSuccessModalProps> = ({
  visible,
  onConfirm,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onConfirm}
    >
      {/* 배경 오버레이 */}
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onConfirm}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.3)"
          />
        </Pressable>

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
              {/* 성공 아이콘 */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons name="checkmark-circle" size={64} color={Colors.primary} />
                </View>
              </View>

              {/* 제목 */}
              <Text style={styles.title}>저장 완료</Text>

              {/* 설명 */}
              <Text style={styles.description}>
                사용자 정보가 성공적으로 저장되었습니다.
              </Text>

              {/* 확인 버튼 */}
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={onConfirm}
                activeOpacity={0.7}
              >
                <View style={styles.confirmButtonInner}>
                  <Text style={styles.confirmButtonText}>확인</Text>
                </View>
              </TouchableOpacity>
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
    padding: 28,
    alignItems: 'center',
    zIndex: 20,
    position: 'relative',
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 125, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  confirmButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});