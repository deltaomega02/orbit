// src/screens/Settings/components/BodyPhotoSelectModal.tsx
// 전신사진 등록 방법 선택 모달 (앨범 or 카메라)

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

interface BodyPhotoSelectModalProps {
  visible: boolean;
  onSelectGallery: () => void;
  onSelectCamera: () => void;
  onCancel: () => void;
}

export const BodyPhotoSelectModal: React.FC<BodyPhotoSelectModalProps> = ({
  visible,
  onSelectGallery,
  onSelectCamera,
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
              {/* 제목 */}
              <Text style={styles.title}>전신 사진 등록</Text>

              {/* 설명 */}
              <Text style={styles.description}>
                사진을 어떻게 등록하시겠습니까?
              </Text>

              {/* 버튼 */}
              <View style={styles.buttonContainer}>
                {/* 앨범 버튼 */}
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={onSelectGallery}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionButtonInner}>
                    <View style={styles.iconWrapper}>
                      <Ionicons name="images-outline" size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle}>앨범에서 선택</Text>
                      <Text style={styles.optionSubtitle}>갤러리에서 선택</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                  </View>
                </TouchableOpacity>

                {/* 카메라 버튼 */}
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={onSelectCamera}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionButtonInner}>
                    <View style={styles.iconWrapper}>
                      <Ionicons name="camera-outline" size={24} color={Colors.primary} />
                    </View>
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionTitle}>카메라로 촬영</Text>
                      <Text style={styles.optionSubtitle}>지금 바로 촬영</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
                  </View>
                </TouchableOpacity>
              </View>

              {/* 취소 버튼 */}
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onCancel}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  optionButton: {
    width: '100%',
    height: 72,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: 'rgba(139, 125, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  optionButtonInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 16,
    backgroundColor: '#FFFFFF',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 125, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  cancelButton: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: Colors.backgroundLight,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});