// src/navigation/AppNavigator.tsx
// 앱의 최상위 네비게이터. 로그인 상태에 따라 로그인/온보딩/메인 화면 출력

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator } from 'react-native';

import MainScreenWrapper from './MainScreenWrapper';
import OnboardingScreen from '../screens/Onboarding';
import CameraScreen from '../screens/Camera';
import AddClothingScreen from '../screens/Closet/AddClothingScreen';
import ClothingPhotoScreen from '../screens/Closet/ClothingPhotoScreen';
import LoginScreen from '../screens/Auth/LoginScreen';   
import { RecommendScreen } from '../screens/Recommend/RecommendScreen';
// 👇 [추가] VirtualTryOnScreen 불러오기
import VirtualTryOnScreen from '../screens/VirtualTryOn/VirtualTryOnScreen'; 

import { RootStackParamList } from './types';
import { Colors } from '../constants/colors';
import { Config } from '../constants/config';
import { AuthService } from '../services/auth/AuthServices'; 

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);       
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    checkAppStatus();
  }, []);

  const checkAppStatus = async () => {
    try {
      console.log('[AppNavigator] Checking app status...');

      // 1. 로그인 상태 확인
      const loggedIn = await AuthService.isLoggedIn();
      console.log('[AppNavigator] Is logged in:', loggedIn);
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        const userInfo = await AuthService.getUserInfo();
        const loginType = await AuthService.getLoginType();
        console.log('[AppNavigator] User:', userInfo?.user.name);
        console.log('[AppNavigator] Login type:', loginType);
      }

      // 2. 온보딩 상태 확인
      const onboardingComplete = await AsyncStorage.getItem(
        Config.STORAGE_KEYS.ONBOARDING
      );
      console.log('[AppNavigator] Onboarding complete:', onboardingComplete);
      setIsOnboarded(onboardingComplete === 'true');

    } catch (error) {
      console.error('[AppNavigator] Error checking app status:', error);
      setIsLoggedIn(false);
      setIsOnboarded(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 로딩 화면
  if (isLoading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: Colors.background 
      }}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // 초기 화면 결정
  const getInitialRouteName = () => {
    if (!isLoggedIn) {
      return 'Login';        // 로그인 안 됨 → 로그인 화면
    }
    if (!isOnboarded) {
      return 'Onboarding';   // 로그인 됨 + 온보딩 안 함 → 온보딩
    }
    return 'Main';           // 로그인 됨 + 온보딩 완료 → 메인
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={getInitialRouteName()}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: Colors.background },
        }}
      >
        {/* 로그인 화면 */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen}
          options={{
            gestureEnabled: false,
          }}
        />

        {/* 온보딩 화면 */}
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingScreen}
          options={{
            gestureEnabled: false,
          }}
        />

        {/* 메인 화면 (MainScreenWrapper - WelcomeModal 포함) */}
        <Stack.Screen 
          name="Main" 
          component={MainScreenWrapper}
          options={{
            gestureEnabled: false,
          }}
        />

        {/* 카메라 화면 (모달) */}
        <Stack.Screen 
          name="Camera" 
          component={CameraScreen}
          options={{
            presentation: 'modal',
            gestureEnabled: true,
          }}
        />

        {/* 옷 추가 화면 */}
        <Stack.Screen 
          name="AddClothing" 
          component={AddClothingScreen}
          options={{
            presentation: 'card',
            gestureDirection: 'horizontal',
          }}
        />

        {/* 옷 사진 촬영 화면 */}
        <Stack.Screen 
          name="ClothingPhoto" 
          component={ClothingPhotoScreen}
          options={{
            presentation: 'modal',
            animationEnabled: true,
          }}
        />

        {/* AI 추천 화면 */}
        <Stack.Screen 
          name="Recommend" 
          component={RecommendScreen}
          options={{
            presentation: 'card',
            gestureDirection: 'vertical',
          }}
        />

        {/* 👇 [추가] 입어보기 화면 등록 */}
        <Stack.Screen 
          name="VirtualTryOn" 
          component={VirtualTryOnScreen}
          options={{
            presentation: 'card', // 옆에서 들어오는 카드 형태
            gestureDirection: 'horizontal',
            headerShown: false,
          }}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;