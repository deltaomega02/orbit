// src/screens/Closet/AddClothingScreen.tsx
// 의류 등록 전용 화면 - Gemini AI 분석 통합 (프리미엄 글래스모피즘 디자인)
// ⭐ v3.1: 앨범 선택 기능 추가 (카메라 + 앨범)

import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  Image,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  FadeInDown,
  FadeInUp,
  withSpring,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/dimensions';
import { API } from '../../api/client';
import { fetchClothes } from '../../store/slices/closetSlice';
import AIAnalysisModal from './components/AIAnalysisModal';
import { ClothingPhotoSelectModal } from './components/ClothingPhotoSelectModal';

interface AddClothingScreenProps {
  navigation: any;
  route: any;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 3개 카테고리로 간소화
const CATEGORY_STRUCTURE = [
  {
    main: 'TOP',
    label: '상의',
    icon: 'chevron-up-outline',
    iconType: 'Ionicons' as const,
    color: '#FF6B9D',
    subcategories: [
      { value: 'TOP_TSHIRT_SHORT', label: '반팔 티셔츠' },
      { value: 'TOP_TSHIRT_LONG', label: '긴팔 티셔츠' },
      { value: 'TOP_SHIRT', label: '셔츠/블라우스' },
      { value: 'TOP_KNIT', label: '니트/스웨터' },
      { value: 'TOP_HOOD', label: '후드/맨투맨' },
      { value: 'TOP_SLEEVELESS', label: '민소매' },
      { value: 'TOP_VEST', label: '조끼/베스트' },
    ],
  },
  {
    main: 'BOTTOM',
    label: '하의',
    icon: 'chevron-down-outline',
    iconType: 'Ionicons' as const,
    color: '#4ECDC4',
    subcategories: [
      { value: 'BOTTOM_DENIM', label: '청바지' },
      { value: 'BOTTOM_COTTON', label: '면바지' },
      { value: 'BOTTOM_SLACKS', label: '슬랙스/정장바지' },
      { value: 'BOTTOM_TRAINING', label: '트레이닝/조거' },
      { value: 'BOTTOM_SHORTS', label: '반바지' },
      { value: 'BOTTOM_SKIRT', label: '치마' },
      { value: 'BOTTOM_LEGGINGS', label: '레깅스' },
    ],
  },
  {
    main: 'OUTER',
    label: '아우터',
    icon: 'snow-outline',
    iconType: 'Ionicons' as const,
    color: '#8B7DFF',
    subcategories: [
      { value: 'OUTER_JACKET', label: '재킷' },
      { value: 'OUTER_CARDIGAN', label: '가디건' },
      { value: 'OUTER_COAT', label: '코트' },
      { value: 'OUTER_PADDING', label: '패딩/다운' },
      { value: 'OUTER_JUMPER', label: '점퍼/블루종' },
      { value: 'OUTER_FLEECE', label: '후리스/집업' },
      { value: 'OUTER_VEST', label: '조끼/베스트' },
    ],
  },
];

// Detail 작성 가이드 필드 (⭐ 모두 선택 항목 - 최소 1개 이상 입력 필요)
const DETAIL_FIELDS = [
  { key: 'material', label: '소재', placeholder: '예: 면 100%, 폴리에스터 혼방 등', required: false },
  { key: 'fit', label: '핏/실루엣', placeholder: '예: 오버핏, 슬림핏, 루즈핏 등', required: false },
  { key: 'length', label: '기장', placeholder: '예: 크롭, 미디, 롱, 무릎 위 등', required: false },
  { key: 'pattern', label: '패턴/무늬', placeholder: '예: 무지, 스트라이프, 체크, 프린트 등', required: false },
  { key: 'neckline', label: '넥라인/칼라', placeholder: '예: 라운드넥, V넥, 터틀넥 등', required: false },
  { key: 'season', label: '시즌감', placeholder: '예: 봄/가을, 여름, 겨울용 등', required: false },
  { key: 'style', label: '스타일', placeholder: '예: 캐주얼, 포멀, 스트릿, 빈티지 등', required: false },
];

const AddClothingScreen: React.FC<AddClothingScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();

  // 상태 관리
  const [mainCategory, setMainCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [name, setName] = useState('');
  const [color, setColor] = useState('');
  const [photoUri, setPhotoUri] = useState('');
  
  // ⭐ 사진 선택 모달 상태
  const [photoSelectModalVisible, setPhotoSelectModalVisible] = useState(false);
  
  // Detail 필드 (사진 없을 때만 사용)
  const [detailFields, setDetailFields] = useState<Record<string, string>>({
    material: '',
    fit: '',
    length: '',
    pattern: '',
    neckline: '',
    season: '',
    style: '',
  });

  // ⭐ TextInput refs for auto-focus (엔터 시 다음 항목으로 이동)
  const nameInputRef = useRef<TextInput>(null);
  const colorInputRef = useRef<TextInput>(null);
  const detailInputRefs = useRef<Record<string, TextInput | null>>({});

  // ⭐ AI 분석 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStatus, setAiStatus] = useState<'analyzing' | 'completed' | 'error'>('analyzing');
  const [aiMessage, setAiMessage] = useState('');

  const saveButtonScale = useSharedValue(1);

  // 선택된 메인 카테고리 정보
  const selectedMainCategory = useMemo(
    () => CATEGORY_STRUCTURE.find(cat => cat.main === mainCategory),
    [mainCategory]
  );

  // Detail 작성 진행도 계산
  // ⭐ Detail 작성 진행도 계산 (모든 필드가 선택 항목)
  const detailProgress = useMemo(() => {
    if (photoUri) return 100; // 사진 있으면 100%
    
    const totalFields = DETAIL_FIELDS.length;
    const filledFields = DETAIL_FIELDS.filter(f => detailFields[f.key]?.trim()).length;
    
    return Math.round((filledFields / totalFields) * 100);
  }, [detailFields, photoUri]);

  // 진행도에 따른 메시지
  const getProgressMessage = () => {
    if (photoUri) {
      return '✓ 사진 기반 등록 - 최상의 정확도로 코디네이션이 가능합니다';
    }
    if (detailProgress >= 90) {
      return '✓ 완벽합니다! 정확한 코디네이션이 가능합니다';
    }
    if (detailProgress >= 70) {
      return '✓ 좋습니다! 대부분의 정보가 입력되었습니다';
    }
    if (detailProgress >= 50) {
      return '⚠ 조금만 더 채우면 더 정확한 추천을 받을 수 있어요';
    }
    if (detailProgress > 0) {
      return '⚠ 정보가 많을수록 더 정확한 코디 추천이 가능합니다';
    }
    return '⚠ 상세 설명이 부족하면 코디 추천 정확도가 떨어질 수 있습니다';
  };

  const getProgressColor = () => {
    if (photoUri || detailProgress >= 90) return Colors.success;
    if (detailProgress >= 70) return Colors.info;
    if (detailProgress >= 50) return Colors.warning;
    return Colors.error;
  };

  // ⭐ 사진 버튼 클릭 → 모달 열기
  const handlePhotoPress = () => {
    setPhotoSelectModalVisible(true);
  };

  // ⭐ 앨범에서 선택
  const handleSelectFromGallery = async () => {
    setPhotoSelectModalVisible(false);
    
    try {
      // 권한 요청
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '앨범 접근 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('앨범 접근 오류:', error);
      Alert.alert('오류', '앨범에서 사진을 가져오는데 실패했습니다.');
    }
  };

  // ⭐ 카메라로 촬영
  const handleTakePhoto = () => {
    setPhotoSelectModalVisible(false);
    
    navigation.navigate('ClothingPhoto', {
      onPhotoTaken: (photoPath: string) => {
        setPhotoUri(photoPath);
      }
    });
  };

  // ⭐ AI 분석 함수
  const analyzeWithAI = async (imageUri: string): Promise<string> => {
    try {
      setAiStatus('analyzing');
      setAiProgress(0);
      setAiMessage('AI가 옷의 디테일을 분석하고 있습니다...');

      // FormData 생성
      const formData = new FormData();
      
      // 이미지 파일 추가
      const imageFile = {
        uri: imageUri,
        type: 'image/jpeg',
        name: `clothing_${Date.now()}.jpg`,
      };
      formData.append('image', imageFile as any);
      formData.append('main_category', mainCategory);
      formData.append('sub_category', subCategory);
      formData.append('name', name);
      formData.append('color', color);

      // 진행 상황 시뮬레이션
      const progressInterval = setInterval(() => {
        setAiProgress(prev => {
          if (prev >= 90) return prev;
          return prev + 5;
        });
      }, 500);

      setAiMessage('Gemini 2.5 Pro가 이미지를 처리하고 있습니다...');
      
      // AI 분석 API 호출
      const response = await API.clothes.analyzeWithAI(formData);
      clearInterval(progressInterval);

      if (response.data.status === 'completed') {
        setAiProgress(100);
        setAiStatus('completed');
        setAiMessage('분석이 완료되었습니다!');
        return response.data.detail || '';
      } else {
        throw new Error(response.data.message || 'AI 분석 실패');
      }

    } catch (error: any) {
      console.error('[AI] 분석 오류:', error);
      setAiStatus('error');
      setAiMessage(error.message || 'AI 분석 중 오류가 발생했습니다');
      throw error;
    }
  };

  // ⭐ 저장 함수
  const handleSave = async () => {
    // 유효성 검사
    if (!mainCategory || !subCategory) {
      Alert.alert('알림', '의류 카테고리를 선택해주세요.');
      return;
    }
    if (!name.trim()) {
      Alert.alert('알림', '의류 이름을 입력해주세요.');
      return;
    }
    if (!color.trim()) {
      Alert.alert('알림', '색상을 입력해주세요.');
      return;
    }
    
    // ⭐ 사진 없을 때: 상세설명 중 하나라도 입력되어 있으면 등록 가능
    if (!photoUri) {
      const filledFields = DETAIL_FIELDS.filter(f => detailFields[f.key]?.trim());
      
      // 아무 상세설명도 없으면 경고
      if (filledFields.length === 0) {
        Alert.alert(
          '정보 부족',
          '사진이 없는 경우, 상세 설명을 최소 1개 이상 입력해주세요.\n\n사진을 등록하시면 AI가 자동으로 분석합니다.',
          [
            { text: '사진 등록하기', onPress: handlePhotoPress },
            { text: '직접 입력하기', style: 'cancel' }
          ]
        );
        return;
      }
    }

    try {
      let finalDetail = '';

      // 1. 사진이 있는 경우 → AI 분석
      if (photoUri) {
        setIsAnalyzing(true);
        try {
          finalDetail = await analyzeWithAI(photoUri);
          
          // 분석 완료 후 2초 대기
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (aiError) {
          // AI 분석 실패 시 사용자에게 선택권 제공
          await new Promise((resolve, reject) => {
            Alert.alert(
              'AI 분석 실패',
              'AI 분석에 실패했습니다. 그래도 저장하시겠습니까?\n(나중에 정보를 추가할 수 있습니다)',
              [
                {
                  text: '취소',
                  style: 'cancel',
                  onPress: () => {
                    setIsAnalyzing(false);
                    reject(new Error('사용자가 취소함'));
                  }
                },
                {
                  text: '저장',
                  onPress: () => {
                    finalDetail = `기본 정보\n이름: ${name}\n색상: ${color}\n\n※ AI 분석을 완료하지 못했습니다.`;
                    resolve(true);
                  }
                }
              ]
            );
          });
        }
      } 
      // 2. 사진이 없는 경우 → 수동 입력 사용
      else {
        setIsAnalyzing(true);
        setAiStatus('analyzing');
        setAiProgress(30);
        setAiMessage('의류 정보를 저장하고 있습니다...');
        
        const detailLines = Object.entries(detailFields)
          .filter(([_, value]) => value.trim())
          .map(([key, value]) => {
            const field = DETAIL_FIELDS.find(f => f.key === key);
            return `${field?.label}: ${value}`;
          });
        finalDetail = detailLines.join('\n');
      }

      // 3. 서버에 저장
      setAiMessage('서버에 저장 중...');
      setAiProgress(70);

      const saveFormData = new FormData();
      saveFormData.append('main_category', mainCategory);
      saveFormData.append('sub_category', subCategory);
      saveFormData.append('name', name);
      saveFormData.append('color', color);
      saveFormData.append('detail', finalDetail);
      
      if (photoUri) {
        const imageFile = {
          uri: photoUri,
          type: 'image/jpeg',
          name: `clothing_${Date.now()}.jpg`,
        };
        saveFormData.append('image', imageFile as any);
      }

      await API.clothes.create(saveFormData);

      setAiProgress(100);
      setAiMessage('저장 완료!');

      // 4. 옷장 데이터 새로고침
      await dispatch(fetchClothes() as any);

      // 5. 완료 후 옷장으로 이동
      setTimeout(() => {
        setIsAnalyzing(false);
        navigation.navigate('Main', {
          screen: 'Closet',
          params: { refresh: true }
        });
      }, 1500);

    } catch (error: any) {
      console.error('저장 오류:', error);
      setIsAnalyzing(false);
      
      if (error.message !== '사용자가 취소함') {
        Alert.alert('저장 실패', '옷 등록에 실패했습니다. 다시 시도해주세요.');
      }
    }
  };

  const animatedSaveStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveButtonScale.value }],
  }));

  const isFormValid = mainCategory && subCategory && name.trim() && color.trim();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.backgroundGradient} />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* 헤더 */}
        <Animated.View 
          entering={FadeInDown.duration(400).springify()}
          style={styles.headerContainer}
        >
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="white"
          />
          <View style={styles.headerGlassLayer} />
          
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <View style={styles.headerIconCircle}>
                <Ionicons name="add-circle-outline" size={24} color={Colors.primary} />
              </View>
              <Text style={styles.headerTitle}>새 옷 추가</Text>
            </View>
            
            <View style={{ width: 40 }} />
          </View>
        </Animated.View>

        {/* 메인 컨텐츠 */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoid}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
        >
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets={true}
          >
            {/* 사진 추가 카드 */}
            <Animated.View 
              entering={FadeInUp.delay(100).duration(500).springify()}
              style={styles.card}
            >
              <BlurView
                style={StyleSheet.absoluteFill}
                blurType="light"
                blurAmount={15}
                reducedTransparencyFallbackColor="white"
              />
              <View style={styles.cardGlassLayer} />
              
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Ionicons name="camera" size={20} color={Colors.primary} />
                  <Text style={styles.cardTitle}>사진</Text>
                  <Text style={styles.optional}>(권장)</Text>
                </View>
                
                {/* ⭐ 사진 버튼 - handlePhotoPress로 변경 */}
                <TouchableOpacity 
                  style={styles.photoButton}
                  onPress={handlePhotoPress}
                  activeOpacity={0.8}
                >
                  {photoUri ? (
                    <>
                      <Image source={{ uri: photoUri }} style={styles.photoPreview} />
                      <View style={styles.photoSelectedBadge}>
                        <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                      </View>
                    </>
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <View style={styles.cameraIconWrapper}>
                        <Ionicons name="camera-outline" size={48} color={Colors.primary} />
                      </View>
                      <Text style={styles.photoText}>탭하여 사진 등록</Text>
                      <Text style={styles.photoSubtext}>앨범에서 선택하거나 직접 촬영</Text>
                      <Text style={styles.photoSubtext2}>🎯 AI 자동 분석으로 최고 정확도</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {photoUri && (
                  <View style={styles.photoInfoBox}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                    <Text style={styles.photoInfoText}>
                      AI가 사진을 분석하여 소재, 핏, 스타일 등을 자동으로 파악합니다
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>

            {/* 메인 카테고리 카드 */}
            <Animated.View 
              entering={FadeInUp.delay(200).duration(500).springify()}
              style={styles.card}
            >
              <BlurView
                style={StyleSheet.absoluteFill}
                blurType="light"
                blurAmount={15}
                reducedTransparencyFallbackColor="white"
              />
              <View style={styles.cardGlassLayer} />
              
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Ionicons name="pricetag" size={20} color={Colors.primary} />
                  <Text style={styles.cardTitle}>카테고리</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                
                <View style={styles.categoryGrid}>
                  {CATEGORY_STRUCTURE.map((cat) => (
                    <TouchableOpacity
                      key={cat.main}
                      style={styles.categoryContainer}
                      onPress={() => {
                        setMainCategory(cat.main);
                        setSubCategory('');
                      }}
                      activeOpacity={0.7}
                    >
                      <View
                        style={[
                          styles.categoryIconWrapper,
                          mainCategory === cat.main && styles.categoryIconWrapperActive,
                        ]}
                      >
                        <Ionicons
                          name={cat.icon as any}
                          size={32}
                          color={mainCategory === cat.main ? cat.color : Colors.textTertiary}
                        />
                        {mainCategory === cat.main && (
                          <View style={[styles.checkBadge, { backgroundColor: cat.color }]}>
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.categoryLabel,
                          mainCategory === cat.main && { color: cat.color, fontWeight: '700' },
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Animated.View>

            {/* 서브카테고리 */}
            {mainCategory && selectedMainCategory && (
              <Animated.View 
                entering={FadeInUp.delay(100).duration(400).springify()}
                style={styles.card}
              >
                <BlurView
                  style={StyleSheet.absoluteFill}
                  blurType="light"
                  blurAmount={15}
                  reducedTransparencyFallbackColor="white"
                />
                <View style={styles.cardGlassLayer} />
                
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="list" size={20} color={selectedMainCategory.color} />
                    <Text style={styles.cardTitle}>{selectedMainCategory.label} 종류</Text>
                    <Text style={styles.required}>*</Text>
                  </View>
                  
                  <View style={styles.subCategoryList}>
                    {selectedMainCategory.subcategories.map((sub) => (
                      <TouchableOpacity
                        key={sub.value}
                        style={[
                          styles.subCategoryItem,
                          subCategory === sub.value && styles.subCategoryItemActive,
                        ]}
                        onPress={() => setSubCategory(sub.value)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.subCategoryLabel,
                            subCategory === sub.value && {
                              color: selectedMainCategory.color,
                              fontWeight: '700',
                            },
                          ]}
                        >
                          {sub.label}
                        </Text>
                        {subCategory === sub.value && (
                          <View style={styles.subCategoryCheckWrapper}>
                            <Ionicons
                              name="checkmark-circle"
                              size={22}
                              color={selectedMainCategory.color}
                            />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </Animated.View>
            )}

            {/* 기본 정보 카드 */}
            <Animated.View 
              entering={FadeInUp.delay(300).duration(500).springify()}
              style={styles.card}
            >
              <BlurView
                style={StyleSheet.absoluteFill}
                blurType="light"
                blurAmount={15}
                reducedTransparencyFallbackColor="white"
              />
              <View style={styles.cardGlassLayer} />
              
              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Ionicons name="create" size={20} color={Colors.primary} />
                  <Text style={styles.cardTitle}>기본 정보</Text>
                </View>
                
                <View 
                  style={styles.inputGroup}
                >
                  <Text style={styles.inputLabel}>이름 *</Text>
                  <View style={[styles.inputWrapper, name && styles.inputWrapperFilled]}>
                    <Ionicons name="shirt-outline" size={20} color={Colors.textSecondary} />
                    <TextInput
                      ref={nameInputRef}
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="예: 스트라이프 셔츠"
                      placeholderTextColor={Colors.textTertiary}
                      returnKeyType="next"
                      blurOnSubmit={false}
                      onSubmitEditing={() => colorInputRef.current?.focus()}
                    />
                  </View>
                </View>

                <View 
                  style={styles.inputGroup}
                >
                  <Text style={styles.inputLabel}>색상 *</Text>
                  <View style={[styles.inputWrapper, color && styles.inputWrapperFilled]}>
                    <Ionicons name="color-palette-outline" size={20} color={Colors.textSecondary} />
                    <TextInput
                      ref={colorInputRef}
                      style={styles.input}
                      value={color}
                      onChangeText={setColor}
                      placeholder="예: 네이비, 화이트"
                      placeholderTextColor={Colors.textTertiary}
                      returnKeyType={photoUri ? "done" : "next"}
                      blurOnSubmit={photoUri ? true : false}
                      onSubmitEditing={() => {
                        if (!photoUri) {
                          detailInputRefs.current['material']?.focus();
                        }
                      }}
                    />
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* 상세 설명 (사진 없을 때만) */}
            {!photoUri && (
              <Animated.View 
                entering={FadeInUp.delay(400).duration(500).springify()}
                style={styles.card}
              >
                <BlurView
                  style={StyleSheet.absoluteFill}
                  blurType="light"
                  blurAmount={15}
                  reducedTransparencyFallbackColor="white"
                />
                <View style={styles.cardGlassLayer} />
                
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="document-text" size={20} color={Colors.primary} />
                    <Text style={styles.cardTitle}>상세 설명</Text>
                  </View>

                  {/* 진행도 표시 */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={styles.progressLabel}>정보 입력 현황</Text>
                      <Text style={[styles.progressPercent, { color: getProgressColor() }]}>
                        {detailProgress}%
                      </Text>
                    </View>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${detailProgress}%`,
                            backgroundColor: getProgressColor(),
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressMessage, { color: getProgressColor() }]}>
                      {getProgressMessage()}
                    </Text>
                  </View>
                  
                  {DETAIL_FIELDS.map((field, index) => (
                    <View 
                      key={field.key} 
                      style={styles.inputGroup}
                    >
                      <Text style={styles.inputLabel}>
                        {field.label} {field.required && '*'}
                      </Text>
                      <View
                        style={[
                          styles.inputWrapper,
                          detailFields[field.key] && styles.inputWrapperFilled,
                        ]}
                      >
                        <TextInput
                          ref={(ref) => {
                            detailInputRefs.current[field.key] = ref;
                          }}
                          style={styles.input}
                          value={detailFields[field.key]}
                          onChangeText={(text) =>
                            setDetailFields((prev) => ({ ...prev, [field.key]: text }))
                          }
                          placeholder={field.placeholder}
                          placeholderTextColor={Colors.textTertiary}
                          returnKeyType={index === DETAIL_FIELDS.length - 1 ? "done" : "next"}
                          blurOnSubmit={index === DETAIL_FIELDS.length - 1}
                          onSubmitEditing={() => {
                            if (index < DETAIL_FIELDS.length - 1) {
                              const nextField = DETAIL_FIELDS[index + 1];
                              detailInputRefs.current[nextField.key]?.focus();
                            }
                          }}
                        />
                      </View>
                    </View>
                  ))}

                  {/* 사진 등록 권장 */}
                  <View style={styles.recommendPhotoBox}>
                    <Ionicons name="bulb-outline" size={18} color={Colors.info} />
                    <Text style={styles.recommendPhotoText}>
                      사진을 등록하시면 AI가 자동으로 분석하여 더 정확한 코디 추천을 받을 수 있습니다
                    </Text>
                  </View>
                </View>
              </Animated.View>
            )}

            {/* 하단 여백 */}
            <View style={{ height: 120 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* 하단 저장 버튼 */}
        <View style={styles.bottomBar}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="white"
          />
          <View style={styles.bottomBarGlassLayer} />
          
          <Animated.View style={animatedSaveStyle}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                !isFormValid && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={!isFormValid}
              activeOpacity={0.8}
              onPressIn={() => {
                if (isFormValid) {
                  saveButtonScale.value = withSpring(0.95);
                }
              }}
              onPressOut={() => {
                saveButtonScale.value = withSpring(1);
              }}
            >
              <Ionicons
                name={photoUri ? 'sparkles' : 'checkmark-circle'}
                size={22}
                color={isFormValid ? '#FFFFFF' : Colors.textTertiary}
              />
              <Text
                style={[
                  styles.saveButtonText,
                  !isFormValid && styles.saveButtonTextDisabled,
                ]}
              >
                {photoUri ? 'AI 분석 후 저장' : '저장하기'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>

      {/* AI 분석 모달 */}
      <AIAnalysisModal
        visible={isAnalyzing}
        progress={aiProgress}
        status={aiStatus}
        message={aiMessage}
      />

      {/* ⭐ 사진 선택 모달 */}
      <ClothingPhotoSelectModal
        visible={photoSelectModalVisible}
        onSelectGallery={handleSelectFromGallery}
        onSelectCamera={handleTakePhoto}
        onCancel={() => setPhotoSelectModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F0F0F5',
  },
  
  safeArea: {
    flex: 1,
  },
  
  // 헤더
  headerContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
  },
  
  headerGlassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  
  headerIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 125, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  
  // 키보드
  keyboardAvoid: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    padding: 16,
    paddingTop: 12,
  },
  
  // 카드
  card: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 3,
  },
  
  cardGlassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  
  cardContent: {
    padding: 20,
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  
  required: {
    fontSize: 14,
    color: Colors.error,
    fontWeight: '600',
  },
  
  optional: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  
  // 사진 버튼
  photoButton: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 2,
    borderColor: 'rgba(139, 125, 255, 0.2)',
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  
  cameraIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 125, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  photoPreview: {
    width: '100%',
    height: '100%',
  },

  photoSelectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  
  photoText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  
  photoSubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },

  photoSubtext2: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 2,
    fontWeight: '600',
  },

  photoInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(52, 199, 89, 0.1)',
    borderRadius: 10,
  },

  photoInfoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  
  // 메인 카테고리 그리드
  categoryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
  },
  
  categoryContainer: {
    flex: 1,
    aspectRatio: 0.85,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  
  categoryIconWrapper: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    position: 'relative',
  },
  
  categoryIconWrapperActive: {
    backgroundColor: 'rgba(240, 240, 245, 0.95)',
    borderWidth: 2,
    borderColor: 'rgba(220, 220, 225, 1)',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  checkBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 4,
  },
  
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 8,
  },

  // 서브 카테고리 리스트
  subCategoryList: {
    gap: 8,
  },

  subCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },

  subCategoryItemActive: {
    backgroundColor: 'rgba(240, 240, 245, 0.95)',
    borderWidth: 2,
    borderColor: 'rgba(220, 220, 225, 1)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  subCategoryLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },

  subCategoryCheckWrapper: {
    transform: [{ scale: 1.1 }],
  },
  
  // 입력 그룹
  inputGroup: {
    marginBottom: 16,
  },
  
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  inputWrapperFilled: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
  },

  // 진행도 섹션
  progressSection: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 12,
  },

  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },

  progressPercent: {
    fontSize: 18,
    fontWeight: '700',
  },

  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },

  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  progressMessage: {
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },

  // 사진 등록 권장 박스
  recommendPhotoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 16,
    padding: 14,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },

  recommendPhotoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  
  // 하단 바
  bottomBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
  },
  
  bottomBarGlassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  
  // 저장 버튼
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    margin: 8,
    elevation: 4,
  },
  
  saveButtonDisabled: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    elevation: 0,
  },
  
  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  
  saveButtonTextDisabled: {
    color: Colors.textTertiary,
  },
});

export default AddClothingScreen;