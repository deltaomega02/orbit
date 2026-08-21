// src/screens/Closet/ClothingPhotoScreen.tsx
// 의류 사진 촬영 전용 화면 - 미니멀 글래스모피즘 디자인

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  FadeIn,
  withSpring,
  withRepeat,
  withSequence,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

interface ClothingPhotoScreenProps {
  navigation: any;
  route: any;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GUIDE_SIZE = SCREEN_WIDTH * 0.85;

const ClothingPhotoScreen: React.FC<ClothingPhotoScreenProps> = ({ navigation, route }) => {
  const camera = useRef<Camera>(null);
  const device = useCameraDevice('back');
  const { hasPermission, requestPermission } = useCameraPermission();
  
  const [isReady, setIsReady] = useState(false);
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  
  // 애니메이션
  const pulseScale = useSharedValue(1);
  const captureScale = useSharedValue(1);
  const guideOpacity = useSharedValue(0);

  useEffect(() => {
    checkPermission();
  }, []);

  useEffect(() => {
    // 부드러운 펄스 애니메이션
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      false
    );
    
    guideOpacity.value = withTiming(1, { duration: 800 });
  }, []);

  const checkPermission = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert('카메라 권한 필요', '사진 촬영을 위해 카메라 권한이 필요합니다.', [
          { text: '확인', onPress: () => navigation.goBack() }
        ]);
      }
    }
  };

  const handleCapture = async () => {
    if (!camera.current || !isReady) return;
    
    try {
      captureScale.value = withSequence(
        withTiming(0.9, { duration: 100 }),
        withSpring(1)
      );
      
      const photo = await camera.current.takePhoto({
        flash: flash,
        enableShutterSound: true,
      });
      
      
      if (route.params?.onPhotoTaken) {
        route.params.onPhotoTaken(`file://${photo.path}`);
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Photo capture error:', error);
      Alert.alert('오류', '사진 촬영에 실패했습니다.');
    }
  };

  const animatedGuideStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: guideOpacity.value,
  }));

  const animatedCaptureStyle = useAnimatedStyle(() => ({
    transform: [{ scale: captureScale.value }],
  }));

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>카메라 권한을 확인하는 중...</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>카메라를 찾을 수 없습니다</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* 카메라 뷰 */}
      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
        onInitialized={() => setIsReady(true)}
      />

      {/* 어두운 오버레이 */}
      <View style={styles.overlay} />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {/* 상단 헤더 - 최소 블러 투명 글래스모피즘 */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.topBar}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={8}
            reducedTransparencyFallbackColor="transparent"
          />
          
          <View style={styles.topBarContent}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </TouchableOpacity>
            
            <Text style={styles.topTitle}>옷 사진 촬영</Text>
            
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => setFlash(flash === 'off' ? 'on' : 'off')}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={flash === 'on' ? 'flash' : 'flash-off'} 
                size={26} 
                color="#FFFFFF" 
              />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* 중앙 가이드 영역 */}
        <View style={styles.centerContainer}>
          {/* 가이드 박스 */}
          <Animated.View style={[styles.guideBox, animatedGuideStyle]}>
            {/* 미니멀한 모서리 마커 */}
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
            
            {/* 중앙 아이콘 */}
            <View style={styles.centerIcon}>
              <Ionicons name="shirt-outline" size={80} color="rgba(255,255,255,0.8)" />
            </View>
          </Animated.View>
          
          {/* 툴팁 - 최소 블러 투명 글래스모피즘 */}
          <Animated.View 
            entering={FadeIn.delay(300).duration(600)}
            style={styles.guideTooltip}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={6}
              reducedTransparencyFallbackColor="transparent"
            />
            <Text style={styles.guideTooltipText}>가이드 안에 의상을 맞춰주세요</Text>
          </Animated.View>
        </View>

        {/* 하단 촬영 버튼 - 배경 없음 */}
        <Animated.View entering={FadeIn.delay(200).duration(500)} style={styles.bottomContainer}>
          {/* 촬영 버튼 - 심플한 3단계 구조 */}
          <Animated.View style={animatedCaptureStyle}>
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleCapture}
              disabled={!isReady}
              activeOpacity={0.8}
            >
              <View style={styles.captureButtonRing} />
              <View style={styles.captureButtonCore} />
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  
  safeArea: {
    flex: 1,
  },
  
  permissionText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
  },
  
  // 상단 바 - 최소 블러 투명 글래스모피즘
  topBar: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  
  topBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  topTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.3,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  
  // 중앙 영역
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  
  // 가이드 박스 - 깔끔하게
  guideBox: {
    width: GUIDE_SIZE,
    height: GUIDE_SIZE * 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  corner: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderWidth: 2.5,
    borderColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },
  
  cornerTopRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },
  
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },
  
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },
  
  centerIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // 툴팁 - 최소 블러 투명 글래스모피즘
  guideTooltip: {
    marginTop: 28,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  
  guideTooltipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  
  // 하단 컨테이너 - 배경 없음
  bottomContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  
  // 촬영 버튼 - 심플하고 깔끔
  captureButton: {
    width: 84,
    height: 84,
    borderRadius: 42,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  captureButtonRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  
  captureButtonCore: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default ClothingPhotoScreen;