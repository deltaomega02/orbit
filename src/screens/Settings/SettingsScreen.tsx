// src/screens/Settings/SettingsScreen.tsx
// Settings - 사용자 정보 관리 메인 컴포넌트

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';

import { Colors } from '../../constants/colors';
import { styles } from './SettingsScreen.styles';
import { BodyPhotoUpload } from './components/BodyPhotoUpload';
import { BodyMetricsForm } from './components/BodyMetricsForm';
import { BodyPhotoSelectModal } from './components/BodyPhotoSelectModal';
import { SaveSuccessModal } from './components/SaveSuccessModal'
import { RootStackParamList } from '../../navigation/types';
import { AuthService } from '../../services/auth/AuthServices';
import { API } from '../../api/client';
import LogoutConfirmModal from '../../components/common/LogoutConfirmModal';
import { store } from '../../store';

type SettingsScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type SettingsScreenRouteProp = RouteProp<RootStackParamList, 'Settings'>;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const route = useRoute<SettingsScreenRouteProp>();

  // 상태
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bodyPhotoUri, setBodyPhotoUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [photoSelectModalVisible, setPhotoSelectModalVisible] = useState(false);
  const [saveSuccessModalVisible, setSaveSuccessModalVisible] = useState(false);

  // 애니메이션 값
  const photoScale = useSharedValue(1);
  const photoRotate = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const floatingY = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  

  // 초기 데이터 로드
  useEffect(() => {
    loadUserProfile();
  }, []);


  // 초기 애니메이션
  useEffect(() => {
    floatingY.value = withSequence(
      withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
    );

    const floatingInterval = setInterval(() => {
      floatingY.value = withSequence(
        withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      );
    }, 4000);

    pulseScale.value = withSequence(
      withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
    );

    const pulseInterval = setInterval(() => {
      pulseScale.value = withSequence(
        withTiming(1.02, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) })
      );
    }, 3000);

    return () => {
      clearInterval(floatingInterval);
      clearInterval(pulseInterval);
    };
  }, []);

  // 사용자 프로필 로드
  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await API.user.getProfile();
      const userData = response.data;


      // 성별
      if (userData.sex) {
        setGender(userData.sex === 'M' ? 'male' : 'female');
      }

      // 신장
      if (userData.height) {
        setHeight(userData.height.toString());
      }

      // 체중
      if (userData.weight) {
        setWeight(userData.weight.toString());
      }

      // 전신 사진
      if (userData.body_photo_url) {
        setBodyPhotoUri(userData.body_photo_url);
      }

      setHasChanges(false);
    } catch (error) {
      console.error('[Settings] 프로필 로드 실패:', error);
      Alert.alert('오류', '사용자 정보를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 저장 핸들러
  const handleSave = async () => {
    try {
      // 유효성 검사
      if (!height || !weight) {
        Alert.alert('알림', '신장과 체중을 모두 입력해주세요.');
        return;
      }

      const heightNum = parseFloat(height);
      const weightNum = parseFloat(weight);

      if (isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
        Alert.alert('알림', '올바른 신장을 입력해주세요. (100-250cm)');
        return;
      }

      if (isNaN(weightNum) || weightNum < 30 || weightNum > 200) {
        Alert.alert('알림', '올바른 체중을 입력해주세요. (30-200kg)');
        return;
      }

      setIsSaving(true);

      // 전신 사진이 새로 촬영된 로컬 파일인 경우 FormData 사용
      if (bodyPhotoUri && bodyPhotoUri.startsWith('file://')) {
        const formData = new FormData();
        formData.append('sex', gender === 'male' ? 'M' : 'F');
        formData.append('height', heightNum.toString());
        formData.append('weight', weightNum.toString());

        const fileName = bodyPhotoUri.split('/').pop() || 'body_photo.jpg';
        formData.append('body_photo', {
          uri: bodyPhotoUri,
          name: fileName,
          type: 'image/jpeg',
        } as any);

        const response = await API.user.updateProfileWithPhoto(formData);
      } else {
        // 사진 없이 JSON으로 저장
        const response = await API.user.updateProfile({
          sex: gender === 'male' ? 'M' : 'F',
          height: heightNum,
          weight: weightNum,
        });
      }

      // ⭐ Alert 대신 모달 표시
      setSaveSuccessModalVisible(true);
      setHasChanges(false);

    } catch (error: any) {
      console.error('[Settings] 저장 실패:', error);
      const errorMessage = error.response?.data?.error || '저장에 실패했습니다.';
      Alert.alert('오류', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  // ⭐ 저장 성공 모달 확인 핸들러
  const handleSaveSuccessConfirm = () => {
    setSaveSuccessModalVisible(false);
    loadUserProfile();
  };

  // 사진 업로드 핸들러 - 모달 표시
  const handlePhotoUpload = () => {
    photoScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 10, stiffness: 150 })
    );

    photoRotate.value = withSequence(
      withTiming(2, { duration: 100 }),
      withSpring(0, { damping: 10, stiffness: 150 })
    );

    glowOpacity.value = withSequence(
      withTiming(0.5, { duration: 200 }),
      withTiming(0, { duration: 600 })
    );

    setTimeout(() => {
      setPhotoSelectModalVisible(true);
    }, 300);
  };

  // 앨범에서 선택
  const handleSelectFromGallery = async () => {
    setPhotoSelectModalVisible(false);
    
    try {
      // 앨범에서 이미지 선택
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setBodyPhotoUri(result.assets[0].uri);
        setHasChanges(true);
      }
    } catch (error) {
      console.error('[Settings] 앨범 선택 오류:', error);
      Alert.alert('오류', '사진을 불러오는데 실패했습니다.');
    }
  };

  // 카메라로 촬영
  const handleTakePhoto = async () => {
    setPhotoSelectModalVisible(false);
    
    try {
      // 카메라 권한 확인
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
        return;
      }

      // 카메라로 촬영
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setBodyPhotoUri(result.assets[0].uri);
        setHasChanges(true);
      }
    } catch (error) {
      console.error('[Settings] 카메라 촬영 오류:', error);
      Alert.alert('오류', '사진 촬영에 실패했습니다.');
    }
  };

  // 모달 닫기
  const handleCancelPhotoSelect = () => {
    setPhotoSelectModalVisible(false);
  };

  // 입력 변경 핸들러들
  const handleHeightChange = (value: string) => {
    setHeight(value);
    setHasChanges(true);
  };

  const handleWeightChange = (value: string) => {
    setWeight(value);
    setHasChanges(true);
  };

  const handleGenderChange = (value: 'male' | 'female') => {
    setGender(value);
    setHasChanges(true);
  };

  // 로그아웃 핸들러 - 모달 표시
  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  // 로그아웃 확인
  const confirmLogout = async () => {
    try {
      setLogoutModalVisible(false);
      setIsLoading(true);


      // ⭐ 1. 게스트 계정이면 서버에서 삭제
      const loginType = await AsyncStorage.getItem('loginType');
      const token = await AsyncStorage.getItem('auth_token');
      
      if (loginType === 'guest' && token) {
        try {
          await axios.delete('http://YOUR_SERVER_IP:8000/api/accounts/auth/guest/', {
            headers: {
              Authorization: `Token ${token}`,
            },
          });
        } catch (deleteError: any) {
          console.error('⚠️ 게스트 계정 삭제 실패:', deleteError.response?.data || deleteError.message);
          // 삭제 실패해도 로그아웃은 계속 진행
        }
      }

      // 2. AuthService를 통한 로그아웃 처리 (AsyncStorage 초기화)
      await AuthService.logout();

      // 3. ⭐ Redux Store 전체 초기화 (의류, 의상 등 모든 데이터 제거)
      store.dispatch({ type: 'RESET_ALL' });

      // 4. 네비게이션 스택 초기화하고 로그인 화면으로 이동
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });


    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('오류', '로그아웃 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃 취소
  const cancelLogout = () => {
    setLogoutModalVisible(false);
  };

  // 애니메이션 스타일
  const animatedPhotoStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: photoScale.value },
      { rotate: `${photoRotate.value}deg` },
      { translateY: floatingY.value },
    ],
  }));

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#F2F2F7', '#F8F8FC', '#FFFFFF']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.contentContainer}>
            {/* Header with Save Button */}
            <Animated.View style={styles.header} entering={FadeIn.duration(600)}>
              <Text style={styles.headerTitle}>Settings</Text>
              {hasChanges && !isLoading && (
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={isSaving}
                  style={{
                    position: 'absolute',
                    right: 24,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 12,
                    backgroundColor: Colors.primary,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={18} color="#FFF" />
                      <Text style={{ color: '#FFF', fontSize: 15, fontWeight: '600' }}>
                        저장
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </Animated.View>

            {/* Main Container */}
            {isLoading ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{ marginTop: 12, color: Colors.textSecondary }}>
                  로딩 중...
                </Text>
              </View>
            ) : (
              <Animated.View
                style={styles.mainContainer}
                entering={FadeInUp.duration(800).delay(100).springify()}
              >
                {/* Top Panel - Body Info */}
                <View style={styles.topPanel}>
                  <BlurView
                    style={StyleSheet.absoluteFill}
                    blurType="light"
                    blurAmount={30}
                    reducedTransparencyFallbackColor="white"
                  />

                  <View style={styles.glassLayer} />

                  <View style={styles.topPanelContent}>
                    <BodyPhotoUpload
                      onPress={handlePhotoUpload}
                      photoStyle={animatedPhotoStyle}
                      glowStyle={animatedGlowStyle}
                      pulseStyle={animatedPulseStyle}
                      photoUri={bodyPhotoUri}
                    />

                    <BodyMetricsForm
                      height={height}
                      weight={weight}
                      gender={gender}
                      onHeightChange={handleHeightChange}
                      onWeightChange={handleWeightChange}
                      onGenderChange={handleGenderChange}
                    />
                  </View>
                </View>

                {/* Bottom Panel - Settings */}
                <Animated.View
                  style={styles.bottomPanel}
                  entering={FadeInUp.duration(600).delay(300)}
                >
                  <BlurView
                    style={StyleSheet.absoluteFill}
                    blurType="light"
                    blurAmount={25}
                    reducedTransparencyFallbackColor="white"
                  />

                  <View style={styles.glassLayer} />

                  <View style={styles.settingsContent}>
                    {/* Logout */}
                    <TouchableOpacity 
                      style={styles.settingRow}
                      onPress={handleLogout}
                      disabled={isLoading}
                    >
                      <View style={styles.settingIcon}>
                        <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
                          <Ionicons
                            name="log-out-outline"
                            size={18}
                            color="#FF3B30"
                          />
                        </View>
                      </View>
                      <Text style={[styles.settingText, { color: '#FF3B30' }]}>
                        {isLoading ? '로그아웃 중...' : '로그아웃'}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#FF3B30"
                        style={{ opacity: 0.6 }}
                      />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              </Animated.View>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* 로그아웃 확인 모달 */}
      <LogoutConfirmModal
        visible={logoutModalVisible}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />

      {/* 전신사진 선택 모달 */}
      <BodyPhotoSelectModal
        visible={photoSelectModalVisible}
        onSelectGallery={handleSelectFromGallery}
        onSelectCamera={handleTakePhoto}
        onCancel={handleCancelPhotoSelect}
      />

      {/* ⭐ 저장 성공 모달 */}
      <SaveSuccessModal
        visible={saveSuccessModalVisible}
        onConfirm={handleSaveSuccessConfirm}
      />
    </View>
  );
};

export default SettingsScreen;