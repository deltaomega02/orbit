// src/screens/Closet/components/DeleteConfirmModal.tsx
// 옷 삭제 확인을 위한 글래스모피즘 모달 (ZoomIn 애니메이션)

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
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { Colors } from '../../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface DeleteConfirmModalProps {
  visible: boolean;
  clothingName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  visible,
  clothingName,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      {/* 배경 오버레이 */}
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCancel}>
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
              {/* 아이콘 */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons name="trash-outline" size={32} color={Colors.error} />
                </View>
              </View>

              {/* 제목 */}
              <Text style={styles.title}>옷 삭제</Text>

              {/* 설명 */}
              <Text style={styles.description}>
                정말로 <Text style={styles.clothingName}>"{clothingName}"</Text>을(를) 삭제하시겠습니까?
              </Text>
              <Text style={styles.warning}>이 작업은 되돌릴 수 없습니다.</Text>

              {/* 버튼 */}
              <View style={styles.buttonContainer}>
                {/* 취소 버튼 */}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onCancel}
                  activeOpacity={0.7}
                >
                  <View style={styles.cancelButtonInner}>
                    <Text style={styles.cancelButtonText}>취소</Text>
                  </View>
                </TouchableOpacity>

                {/* 삭제 버튼 */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={onConfirm}
                  activeOpacity={0.7}
                >
                  <View style={styles.deleteButtonInner}>
                    <Ionicons name="trash" size={18} color="#FFFFFF" />
                    <Text style={styles.deleteButtonText}>삭제</Text>
                  </View>
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.15)',
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
    marginBottom: 6,
  },
  clothingName: {
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  warning: {
    fontSize: 13,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 28,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.backgroundLight,
  },
  cancelButtonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  deleteButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.error,
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButtonInner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});