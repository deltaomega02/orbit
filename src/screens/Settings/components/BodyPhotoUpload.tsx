// src/screens/Settings/components/BodyPhotoUpload.tsx

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Colors } from '../../../constants/colors';
import { styles } from '../SettingsScreen.styles';

interface BodyPhotoUploadProps {
  onPress: () => void;
  photoStyle: any;
  glowStyle: any;
  pulseStyle: any;
  photoUri?: string | null;
}

export const BodyPhotoUpload: React.FC<BodyPhotoUploadProps> = ({
  onPress,
  photoStyle,
  glowStyle,
  pulseStyle,
  photoUri,
}) => {
  return (
    <Animated.View style={[styles.photoSection, pulseStyle]}>
      <Pressable style={styles.photoTouchable} onPress={onPress}>
        <Animated.View style={[styles.photoCircle, photoStyle]}>
          <Animated.View style={[styles.photoGlow, glowStyle]}>
            <LinearGradient
              colors={[Colors.primary + '40', 'transparent']}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>

          {/* 사진이 있으면 표시, 없으면 placeholder */}
          {photoUri ? (
            <>
              <Image
                source={{ uri: photoUri }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                transition={300}
              />
              {/* 어두운 오버레이 */}
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: 'rgba(0, 0, 0, 0.3)',
                }}
              />
              {/* 편집 아이콘 */}
              <View style={styles.photoContent}>
                <View style={styles.cameraIcon}>
                  <Ionicons name="camera" size={36} color="#FFF" />
                </View>
                <Text style={[styles.photoText, { color: '#FFF' }]}>
                  사진 변경
                </Text>
              </View>
            </>
          ) : (
            <>
              <BlurView
                style={StyleSheet.absoluteFill}
                blurType="light"
                blurAmount={10}
                reducedTransparencyFallbackColor="transparent"
              />

              <View style={styles.photoContent}>
                <View style={styles.cameraIcon}>
                  <Ionicons name="scan" size={48} color={Colors.textSecondary} />
                </View>
                <Text style={styles.photoText}>Full Body</Text>
                <Text style={styles.photoSubtext}>Virtual Try-On</Text>
              </View>
            </>
          )}
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};