// src/screens/Camera/CameraScreen.tsx
// 카메라 화면 - 메인 컴포넌트

import React, { useState, useRef } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
} from 'react-native-vision-camera';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import {
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { Colors } from '../../constants/colors';
import { styles } from './CameraScreen.styles';
import { PermissionView } from './components/PermissionView';
import { CameraView } from './components/CameraView';
import { PhotoReview } from './components/PhotoReview';

interface CameraScreenProps {
  route: {
    params: {
      mode: 'clothes' | 'body' | 'outfit';
    };
  };
}

const CameraScreen: React.FC<CameraScreenProps> = ({ route }) => {
  const navigation = useNavigation();
  const cameraRef = useRef<Camera>(null);
  const { hasPermission, requestPermission } = useCameraPermission();
  const isFocused = useIsFocused();

  // State
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Animation values
  const shutterAnimation = useSharedValue(1);
  const shutterOpacity = useSharedValue(0);
  const guidePulse = useSharedValue(1);

  const device = useCameraDevice('back');
  const { mode } = route.params;

  // 모드별 설정
  const getModeConfig = () => {
    switch (mode) {
      case 'clothes':
        return {
          title: 'Capture Item',
          subtitle: 'AI Background Removal',
          icon: 'shirt-outline',
          tip: 'Plain background works best',
        };
      case 'body':
        return {
          title: 'Full Body',
          subtitle: 'Virtual Try-On Ready',
          icon: 'body-outline',
          tip: 'Stand 2 meters from camera',
        };
      case 'outfit':
        return {
          title: "Today's Look",
          subtitle: 'Save Your Style',
          icon: 'camera-outline',
          tip: 'Natural lighting recommended',
        };
      default:
        return {
          title: 'Camera',
          subtitle: '',
          icon: 'camera-outline',
          tip: '',
        };
    }
  };

  const modeConfig = getModeConfig();

  // 사진 촬영
  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      setIsCapturing(true);

      // 셔터 애니메이션
      shutterAnimation.value = withSequence(
        withTiming(0.92, { duration: 100 }),
        withSpring(1, { damping: 12, stiffness: 150 })
      );

      // 플래시 효과
      shutterOpacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0, { duration: 200 })
      );

      try {
        const photo = await cameraRef.current.takePhoto({
          enableShutterSound: false,
        });
        setCapturedImage('file://' + photo.path);
        setIsCapturing(false);
      } catch (error) {
        console.error('Error taking picture:', error);
        setIsCapturing(false);
      }
    }
  };

  // 재촬영
  const retakePicture = () => {
    setCapturedImage(null);
  };

  // 사진 확정
  const confirmPicture = () => {
    navigation.goBack();
  };

  // 카메라 닫기
  const handleClose = () => {
    navigation.goBack();
  };

  // 권한 요청 화면
  if (!hasPermission) {
    return <PermissionView onRequestPermission={requestPermission} />;
  }

  // 카메라 초기화 중
  if (device == null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Initializing camera...</Text>
      </View>
    );
  }

  // 촬영 후 사진 리뷰 화면
  if (capturedImage) {
    return (
      <PhotoReview
        imageUri={capturedImage}
        mode={mode}
        modeConfig={modeConfig}
        onRetake={retakePicture}
        onConfirm={confirmPicture}
      />
    );
  }

  // 메인 카메라 화면
  return (
    <CameraView
      cameraRef={cameraRef}
      device={device}
      isActive={isFocused}
      mode={mode}
      modeConfig={modeConfig}
      isCapturing={isCapturing}
      shutterAnimation={shutterAnimation}
      shutterOpacity={shutterOpacity}
      guidePulse={guidePulse}
      onClose={handleClose}
      onTakePicture={takePicture}
    />
  );
};

export default CameraScreen;