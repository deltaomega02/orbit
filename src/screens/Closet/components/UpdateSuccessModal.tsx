// src/screens/Closet/components/UpdateSuccessModal.tsx
// 옷 수정 완료 확인 모달 (불투명 배경)

import React, { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';
import { Colors } from '../../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UpdateSuccessModalProps {
  visible: boolean;
  clothingName: string;
  onClose: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

const UpdateSuccessModal: React.FC<UpdateSuccessModalProps> = ({
  visible,
  clothingName,
  onClose,
  autoClose = false,
  autoCloseDelay = 2000,
}) => {
  // 자동 닫기
  useEffect(() => {
    if (visible && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [visible, autoClose, autoCloseDelay, onClose]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* 배경 오버레이 - 불투명 */}
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* 모달 컨텐츠 */}
        <View style={styles.modalContainer} pointerEvents="box-none">
          <Animated.View
            entering={ZoomIn.duration(300).springify()}
            exiting={FadeOut.duration(200)}
            style={styles.modalCard}
          >
            {/* 모달 내용 */}
            <View style={styles.contentContainer}>
              {/* 아이콘 */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
                </View>
              </View>

              {/* 제목 */}
              <Text style={styles.title}>수정 완료</Text>

              {/* 설명 */}
              <Text style={styles.description}>
                <Text style={styles.clothingName}>"{clothingName}"</Text>이(가) 성공적으로 수정되었습니다.
              </Text>

              {/* 확인 버튼 */}
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={onClose}
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 28,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
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
  clothingName: {
    fontWeight: '600',
    color: Colors.textPrimary,
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

export default UpdateSuccessModal;