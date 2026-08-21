// src/screens/Auth/LoginScreen.tsx
// 미니멀하고 깔끔한 로그인 화면
// ⭐ v3.0: AuthService.createGuestAccount() 연동 + 서버 토큰 발급

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import axios from 'axios';

import { RootStackParamList } from '../../navigation/types';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/dimensions';
import { AuthService } from '../../services/auth/AuthServices';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const API_BASE_URL = 'http://YOUR_SERVER_IP:8000/api/accounts';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface LoginScreenProps {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [guestModalVisible, setGuestModalVisible] = useState(false);
  
  // 애니메이션 값들
  const contentOpacity = useSharedValue(0);

  // Google Sign-In 설정
  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId: '1012500755271-5ko4k21dmno7ekr5a1kb9hcqki0orud2.apps.googleusercontent.com',
      offlineAccess: true,
      scopes: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ],
    });
  }, []);

  // 초기 애니메이션
  useEffect(() => {
    contentOpacity.value = withDelay(
      200,
      withTiming(1, { 
        duration: 800,
        easing: Easing.out(Easing.cubic)
      })
    );
  }, []);

  // 애니메이션 스타일
  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [
      { translateY: (1 - contentOpacity.value) * 20 }
    ],
  }));

  /**
   * Google 로그인 처리
   */
  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);

      await GoogleSignin.hasPlayServices();
      const signInResult: any = await GoogleSignin.signIn();
      
      const userInfo = signInResult.data?.user;
      const email = userInfo?.email;
      const name = userInfo?.name || userInfo?.givenName || 'User';
      const googleId = userInfo?.id;
      
      if (!email) {
        Alert.alert('오류', '이메일 정보를 가져올 수 없습니다.');
        return;
      }

      // 서버에 전송
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/google/`, {
          email: email,
          name: name,
          google_id: googleId || '',
        });
        
        if (response.data.success) {
          
          // ⭐ 토큰 저장 추가
          if (response.data.token) {
            await AsyncStorage.setItem('auth_token', response.data.token);
          }
        }
      } catch (serverError: any) {
      }

      // 로컬 저장
      await AsyncStorage.setItem('userInfo', JSON.stringify({
        user: userInfo
      }));
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('loginType', 'google');
      await AsyncStorage.setItem('isFirstLogin', 'true');

      // 캘린더 토큰 저장
      const tokens = await GoogleSignin.getTokens();
      await AsyncStorage.setItem('calendarToken', tokens.accessToken);

      navigation.replace('Main', undefined);

    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        Alert.alert('로그인 취소', '로그인이 취소되었습니다.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('오류', 'Google Play Services가 필요합니다.');
      } else {
        Alert.alert('로그인 실패', '다시 시도해주세요.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * ⭐⭐⭐ 게스트 모드 진입 - AuthService 사용 + 서버 토큰 받기
   */
  const confirmGuestLogin = async () => {
    try {
      setGuestModalVisible(false);
      setLoading(true);


      // ⭐ 1. AuthService로 게스트 계정 생성 (로컬)
      const guestUserInfo = await AuthService.createGuestAccount();
      
      const guestEmail = guestUserInfo.user.email;
      const guestId = guestUserInfo.user.id;
      

      // ⭐ 2. 서버에 게스트 계정 등록 및 토큰 받기
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/google/`, {
          email: guestEmail,
          name: `Guest_${guestId}`,  // ⭐ 유니크한 이름 사용
          google_id: guestId || '',
        });

        if (response.data.success && response.data.token) {
          // ⭐ 3. 게스트 토큰 저장
          await AsyncStorage.setItem('auth_token', response.data.token);
        } else {
          console.warn('⚠️ 게스트 토큰을 받지 못함');
        }
      } catch (serverError: any) {
        console.error('❌ 게스트 서버 등록 실패');
        console.error('   - 상태 코드:', serverError.response?.status);
        console.error('   - 에러 데이터:', JSON.stringify(serverError.response?.data, null, 2));
        console.error('   - 에러 메시지:', serverError.message);
        console.error('   - 요청 데이터:', JSON.stringify({
          email: guestEmail,
          name: 'Guest User',
          google_id: guestId,
        }, null, 2));
      }

      // 4. isFirstLogin 설정
      await AsyncStorage.setItem('isFirstLogin', 'true');

      navigation.replace('Main', undefined);

    } catch (error) {
      console.error('❌ Guest Login Error:', error);
      Alert.alert('오류', '게스트 로그인 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* 배경 그라데이션 */}
      <LinearGradient
        colors={['#F5F5F7', '#FFFFFF', '#F5F5F7']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={[styles.content, animatedContentStyle]}>
          {/* 로고 & 타이틀 - 컴팩트하게 */}
          <View style={styles.headerSection}>
            <Text style={styles.appName}>ORBIT</Text>
            <Text style={styles.tagline}>Your Style Universe</Text>
          </View>

          {/* 메인 카드 - 글래스모피즘 */}
          <View style={styles.cardContainer}>
            <View style={styles.card}>
              {/* 블러 효과 - 모든 플랫폼 */}
              <BlurView
                style={StyleSheet.absoluteFill}
                blurType="light"
                blurAmount={30}
                reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.7)"
              />
              
              {/* 글래스 레이어 */}
              <View style={styles.glassLayer} />
              
              {/* 상단 하이라이트 */}
              <View style={styles.topHighlight} />
              
              {/* 보더 */}
              <View style={styles.borderLayer} />

              {/* 콘텐츠 */}
              <View style={styles.cardContent}>
                <Text style={styles.welcomeTitle}>환영합니다</Text>
                <Text style={styles.welcomeSubtitle}>
                  AI가 추천하는 당신만의{'\n'}
                  스타일을 만나보세요
                </Text>

                {/* Google 로그인 버튼 */}
                <TouchableOpacity
                  style={styles.googleButton}
                  onPress={handleGoogleSignIn}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <View style={styles.googleButtonContent}>
                    {loading ? (
                      <ActivityIndicator color={Colors.primary} size="small" />
                    ) : (
                      <>
                        <View style={styles.googleIcon}>
                          <Ionicons name="logo-google" size={20} color="#EA4335" />
                        </View>
                        <Text style={styles.googleButtonText}>Google로 계속하기</Text>
                      </>
                    )}
                  </View>
                </TouchableOpacity>

                {/* 구분선 */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>또는</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* 게스트 버튼 */}
                <TouchableOpacity
                  onPress={() => setGuestModalVisible(true)}
                  disabled={loading}
                  style={styles.guestButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="person-outline" size={18} color={Colors.textSecondary} />
                  <Text style={styles.guestButtonText}>게스트로 둘러보기</Text>
                </TouchableOpacity>

                {/* 기능 소개 */}
                <View style={styles.featuresContainer}>
                  <View style={styles.featureItem}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.primary} />
                    <Text style={styles.featureText}>캘린더 연동</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="sparkles-outline" size={14} color={Colors.primary} />
                    <Text style={styles.featureText}>AI 추천</Text>
                  </View>
                  <View style={styles.featureItem}>
                    <Ionicons name="partly-sunny-outline" size={14} color={Colors.primary} />
                    <Text style={styles.featureText}>날씨 기반</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>

      {/* 게스트 모드 모달 */}
      <Modal
        visible={guestModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGuestModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={styles.modalContent}
            entering={FadeInUp.duration(300)}
          >
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="light"
              blurAmount={40}
              reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.8)"
            />
            
            <View style={styles.modalBackground} />
            <View style={styles.modalBorder} />

            <View style={styles.modalBody}>
              {/* 경고 아이콘 */}
              <View style={styles.warningIcon}>
                <LinearGradient
                  colors={['#FF9500', '#FF7A00']}
                  style={styles.warningGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Ionicons name="alert-circle-outline" size={28} color="#FFF" />
                </LinearGradient>
              </View>

              <Text style={styles.modalTitle}>게스트 모드</Text>
              <Text style={styles.modalDescription}>
                일부 기능이 제한됩니다
              </Text>

              {/* 제한 사항 */}
              <View style={styles.limitationsList}>
                <View style={styles.limitationItem}>
                  <Ionicons name="close-circle" size={16} color="#FF3B30" />
                  <Text style={styles.limitationText}>캘린더 연동 불가</Text>
                </View>
                <View style={styles.limitationItem}>
                  <Ionicons name="close-circle" size={16} color="#FF3B30" />
                  <Text style={styles.limitationText}>데이터 백업 불가</Text>
                </View>
                <View style={styles.limitationItem}>
                  <Ionicons name="close-circle" size={16} color="#FF3B30" />
                  <Text style={styles.limitationText}>AI 추천 제한</Text>
                </View>
              </View>

              {/* 버튼 */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => setGuestModalVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.modalCancelText}>돌아가기</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={confirmGuestLogin}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={[Colors.primary, Colors.primaryDark]}
                    style={StyleSheet.absoluteFill}
                  />
                  <Text style={styles.modalConfirmText}>계속하기</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  
  safeArea: {
    flex: 1,
  },
  
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  
  // 헤더 섹션 - 더 컴팩트하게
  headerSection: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  
  appName: {
    fontSize: 44,
    fontWeight: '900',
    color: Colors.textPrimary,
    letterSpacing: -1.5,
    marginBottom: Spacing.xs,
  },
  
  tagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
    opacity: 0.7,
    fontWeight: '500',
  },
  
  // 카드 - 글래스모피즘
  cardContainer: {
    marginBottom: Spacing.xxl,
  },
  
  card: {
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
  },
  
  // 글래스 레이어 - TabNavigator와 동일
  glassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 28,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  
  // 상단 하이라이트
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 30,
    right: 30,
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  
  borderLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 28,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'transparent',
  },
  
  cardContent: {
    padding: Spacing.xxl + Spacing.sm,
  },
  
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  
  welcomeSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.xxl,
    opacity: 0.8,
  },
  
  // Google 버튼
  googleButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: Spacing.md,
  },
  
  googleButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  
  googleIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  
  // 구분선
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  
  dividerText: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginHorizontal: Spacing.md,
    fontWeight: '500',
  },
  
  // 게스트 버튼
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: 50,
    borderRadius: 16,
    backgroundColor: 'rgba(120, 120, 128, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.04)',
    marginBottom: Spacing.lg,
  },
  
  guestButtonText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  
  // 기능 소개
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  
  featureText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
    opacity: 0.8,
  },
  
  // 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  
  modalContent: {
    width: SCREEN_WIDTH * 0.85,
    maxWidth: 340,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  modalBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'transparent',
  },
  
  modalBody: {
    padding: Spacing.xxl,
    alignItems: 'center',
  },
  
  warningIcon: {
    marginBottom: Spacing.lg,
  },
  
  warningGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF9500',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    letterSpacing: -0.3,
  },
  
  modalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
    opacity: 0.85,
  },
  
  limitationsList: {
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  
  limitationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  
  limitationText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.md,
  },
  
  modalCancelButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(120, 120, 128, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  
  modalConfirmButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  
  modalConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});

export default LoginScreen;