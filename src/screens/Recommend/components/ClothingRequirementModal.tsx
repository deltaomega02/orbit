import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  ZoomIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ClothingRequirementModalProps {
  visible: boolean;
  onClose: () => void;
}

const ClothingRequirementModal: React.FC<ClothingRequirementModalProps> = ({
  visible,
  onClose,
}) => {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
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
            {/* 카드 배경 및 글래스 효과 */}
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={20}
              reducedTransparencyFallbackColor="white"
            />
            <View style={styles.glassLayer} />
            <View style={styles.topLine} />

            <View style={styles.contentContainer}>
              {/* 아이콘 영역 */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons name="shirt" size={40} color={Colors.primary} />
                  <View style={styles.alertBadge}>
                    <Ionicons name="alert" size={16} color="#FFF" />
                  </View>
                </View>
              </View>

              {/* 타이틀 & 메시지 */}
              <Text style={styles.title}>옷을 추가해 주세요!</Text>
              <Text style={styles.message}>
                원활한 코디 추천을 위해서는{'\n'}
                종류별로 3개 이상의 옷을{'\n'}
                등록해야 합니다!
              </Text>

              {/* 확인 버튼 */}
              <TouchableOpacity
                style={styles.confirmButton}
                activeOpacity={0.8}
                onPress={onClose}
              >
                <LinearGradient
                  colors={[Colors.primary, '#6C63FF']} // 살짝 그라데이션
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>확인</Text>
                </LinearGradient>
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
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  modalCard: {
    width: SCREEN_WIDTH - 60, // 조금 더 컴팩트하게
    maxWidth: 360,
    borderRadius: 28,
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
    borderRadius: 28,
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
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  alertBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B6B', // 경고 색상
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  confirmButton: {
    width: '100%',
    height: 50,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ClothingRequirementModal;