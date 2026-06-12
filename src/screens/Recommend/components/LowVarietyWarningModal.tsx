// src/screens/Recommend/components/LowVarietyWarningModal.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Vibration,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

import { Colors } from '../../../constants/colors';
import { Spacing } from '../../../constants/dimensions';
import { Typography } from '../../../constants/typography';

interface LowVarietyWarningModalProps {
  visible: boolean;
  onCancel: () => void;
  onContinue: () => void;
}

const LowVarietyWarningModal: React.FC<LowVarietyWarningModalProps> = ({
  visible,
  onCancel,
  onContinue,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <Animated.View 
        style={styles.overlay}
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
      >
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          activeOpacity={1} 
          onPress={onCancel}
        />
        
        <Animated.View 
          style={styles.modalContainer}
          entering={ZoomIn.duration(300).delay(100)}
          exiting={FadeOut.duration(200)}
        >
          <View style={styles.modalContent}>
            <BlurView
              blurType="light"
              blurAmount={10}
              reducedTransparencyFallbackColor="white"
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.glassLayer} />
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0)']}
              style={styles.topHighlight}
            />
            
            {/* 아이콘 */}
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['rgba(255, 149, 0, 0.15)', 'rgba(255, 149, 0, 0.05)']}
                style={styles.iconBackground}
              >
                <Ionicons name="warning-outline" size={48} color="#FF9500" />
              </LinearGradient>
            </View>
            
            {/* 제목 */}
            <Text style={styles.title}>코디 자유도 알림</Text>
            
            {/* 설명 */}
            <Text style={styles.description}>
              일부 의류 카테고리가 3개 미만입니다.{'\n'}
              추천의 다양성이 제한될 수 있습니다.{'\n\n'}
              그래도 추천을 받으시겠습니까?
            </Text>
            
            {/* 버튼들 */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  Vibration.vibrate(30);
                  onCancel();
                }}
                activeOpacity={0.7}
              >
                <BlurView
                  blurType="light"
                  blurAmount={5}
                  reducedTransparencyFallbackColor="white"
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.buttonGlassLayer} />
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.continueButton]}
                onPress={() => {
                  Vibration.vibrate(50);
                  onContinue();
                }}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.primary + 'E0']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={styles.continueButtonText}>계속하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  
  modalContainer: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  
  modalContent: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  
  glassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.dockBackground,
    borderWidth: 1,
    borderColor: Colors.dockBorder,
  },
  
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  
  iconContainer: {
    marginBottom: Spacing.lg,
  },
  
  iconBackground: {
    width: 88,
    height: 88,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.2)',
    shadowColor: '#FF9500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  
  title: {
    ...Typography.h3,
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
    textShadowColor: 'rgba(139, 125, 255, 0.1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  
  description: {
    ...Typography.bodyMedium,
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.sm,
  },
  
  button: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  cancelButton: {
    borderWidth: 1,
    borderColor: Colors.dockBorder,
  },
  
  buttonGlassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  
  continueButton: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  
  cancelButtonText: {
    ...Typography.bodyMedium,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  
  continueButtonText: {
    ...Typography.bodyMedium,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default LowVarietyWarningModal;