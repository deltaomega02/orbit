// src/navigation/MainScreenWrapper.tsx
// 메인 화면 래퍼 - 로그인 후 WelcomeModal 표시 및 부드러운 블러 처리

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

import TabNavigator from './TabNavigator';
import WelcomeModal from '../components/common/WelcomeModal';

const MainScreenWrapper: React.FC = () => {
  const [showWelcome, setShowWelcome] = useState(false);
  const [userName, setUserName] = useState('');
  const blurOpacity = useSharedValue(0);

  useEffect(() => {
    checkFirstLogin();
  }, []);

  /**
   * 첫 로그인인지 확인하고 WelcomeModal 표시
   */
  const checkFirstLogin = async () => {
    try {
      const isFirstLogin = await AsyncStorage.getItem('isFirstLogin');
      
      if (isFirstLogin === 'true') {
        // 사용자 정보 가져오기
        const userInfoStr = await AsyncStorage.getItem('userInfo');
        if (userInfoStr) {
          const userInfo = JSON.parse(userInfoStr);
          const name = userInfo.user?.name || userInfo.user?.givenName || 'User';
          setUserName(name);
        }

        // 부드럽게 블러 적용
        blurOpacity.value = withDelay(
          50,
          withTiming(1, { 
            duration: 400,
            easing: Easing.out(Easing.cubic)
          })
        );
        
        // WelcomeModal 표시
        setShowWelcome(true);

        // 플래그 제거
        await AsyncStorage.removeItem('isFirstLogin');
      }
    } catch (error) {
      console.error('[MainScreenWrapper] Error checking first login:', error);
    }
  };

  /**
   * WelcomeModal 닫기 핸들러
   */
  const handleWelcomeClose = () => {
    // 부드럽게 블러 해제
    blurOpacity.value = withTiming(0, { 
      duration: 500,
      easing: Easing.in(Easing.cubic)
    }, (finished) => {
      if (finished) {
        runOnJS(setShowWelcome)(false);
      }
    });
  };

  const animatedBlurStyle = useAnimatedStyle(() => ({
    opacity: blurOpacity.value,
  }));

  return (
    <View style={styles.container}>
      {/* 메인 화면 */}
      <TabNavigator />

      {/* 블러 오버레이 - 부드럽게 */}
      {showWelcome && (
        <Animated.View 
          style={[StyleSheet.absoluteFill, animatedBlurStyle]}
          pointerEvents="none"
        >
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={15}
            reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.6)"
          />
        </Animated.View>
      )}

      {/* WelcomeModal */}
      <WelcomeModal
        visible={showWelcome}
        username={userName}
        onClose={handleWelcomeClose}
        autoClose={true}
        autoCloseDelay={2500}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default MainScreenWrapper;