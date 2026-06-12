// src/screens/Recommend/components/StylePreferenceModal.tsx
// 사용자 스타일 프리퍼런스를 입력받는 글래스모피즘 모달

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  ZoomIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { Spacing } from '../../../constants/dimensions';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface StylePreferenceModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (preference: string) => void;
  initialValue?: string;
}

const StylePreferenceModal: React.FC<StylePreferenceModalProps> = ({
  visible,
  onClose,
  onSave,
  initialValue = '',
}) => {
  const [preference, setPreference] = useState(initialValue);

  useEffect(() => {
    if (visible) {
      setPreference(initialValue);
    }
  }, [visible, initialValue]);

  const handleSave = () => {
    onSave(preference.trim());
    onClose();
  };

  const handleClear = () => {
    setPreference('');
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.backdrop}>
            {/* 전체 배경 블러 */}
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={5}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.4)"
            />

            <TouchableWithoutFeedback onPress={onClose}>
              <View style={StyleSheet.absoluteFill} />
            </TouchableWithoutFeedback>

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

                <TouchableWithoutFeedback>
                  <View style={styles.contentContainer}>
                    {/* 아이콘 영역 */}
                    <View style={styles.iconContainer}>
                      <View style={styles.iconCircle}>
                        <Ionicons name="color-palette-outline" size={40} color={Colors.primary} />
                      </View>
                    </View>

                    <Text style={styles.title}>스타일 선호도 설정</Text>
                    <Text style={styles.subtitle}>
                      원하는 스타일이나 분위기를 입력하면{'\n'}
                      AI가 더 정확한 코디를 추천해드려요
                    </Text>

                    {/* 입력 필드 */}
                    <View style={styles.inputContainer}>
                      <BlurView
                        style={StyleSheet.absoluteFill}
                        blurType="light"
                        blurAmount={10}
                        reducedTransparencyFallbackColor="white"
                      />
                      <View style={styles.inputGlassLayer} />
                      
                      <TextInput
                        style={styles.input}
                        placeholder="예: 캐주얼한 느낌, 깔끔한 오피스룩, 편안한 데일리룩..."
                        placeholderTextColor={Colors.textTertiary}
                        value={preference}
                        onChangeText={setPreference}
                        multiline
                        maxLength={100}
                        autoFocus={false}
                      />
                      
                      {preference.length > 0 && (
                        <TouchableOpacity
                          style={styles.clearButton}
                          onPress={handleClear}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="close-circle" size={20} color={Colors.textTertiary} />
                        </TouchableOpacity>
                      )}
                    </View>

                    <Text style={styles.characterCount}>
                      {preference.length} / 100
                    </Text>

                    {/* 버튼 영역 */}
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={[styles.button, styles.cancelButton]}
                        onPress={onClose}
                        activeOpacity={0.7}
                      >
                        <BlurView
                          style={StyleSheet.absoluteFill}
                          blurType="light"
                          blurAmount={10}
                          reducedTransparencyFallbackColor="white"
                        />
                        <View style={styles.buttonGlassLayer} />
                        <Text style={styles.cancelButtonText}>취소</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.button, styles.saveButton]}
                        onPress={handleSave}
                        activeOpacity={0.7}
                      >
                        <View style={styles.saveButtonGradient}>
                          <Text style={styles.saveButtonText}>저장</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </Animated.View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    zIndex: 20,
  },
  iconContainer: {
    marginBottom: 20,
    height: 80,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  inputContainer: {
    width: '100%',
    minHeight: 100,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  inputGlassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 40,
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    textAlignVertical: 'top',
    zIndex: 10,
  },
  clearButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
    zIndex: 20,
  },
  characterCount: {
    alignSelf: 'flex-end',
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textTertiary,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  buttonGlassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
    zIndex: 10,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonGradient: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default StylePreferenceModal;