// src/screens/VirtualTryOn/VirtualTryOnScreen.tsx
// ⭐ v5.8: Settings와 동일한 방식으로 전신사진 API 호출 + 페이드인 효과

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  LayoutAnimation, 
  Platform, 
  UIManager,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { useSelector } from 'react-redux';

import { styles } from './VirtualTryOnScreen.styles';
import { Colors } from '../../constants/colors';
import { API } from '../../api/client';
import type { RootState } from '../../store';

// Android에서 LayoutAnimation 활성화 설정
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ⭐ 재치있는 로딩 메시지 배열
const LOADING_MESSAGES = [
  'Your style universe is loading... ✨',
  '완벽한 조합을 큐레이팅하는 중',
  'AI 스타일리스트가 고민 중... 🎨',
  '당신에게 어울리는 룩을 디자인 중',
  '디테일을 다듬는 중... 거의 완성!',
  '스타일 시뮬레이션 마무리 중 💫',
  '당신만의 특별한 룩, 준비 완료 직전!',
  'Ready to shine! ⭐'
];

// 색상 이름을 hex 코드로 변환하는 함수
const getColorHex = (colorName: string): string => {
  if (!colorName) {
    console.warn('⚠️ colorName is empty or undefined');
    return '#CCCCCC';
  }

  if (colorName.startsWith('#')) {
    return colorName;
  }

  const firstColor = colorName.split('/')[0].trim();
  
  const colorMap: { [key: string]: string } = {
    '빨강': '#FF0000', '빨간색': '#FF0000', '레드': '#FF0000',
    '주황': '#FF8C00', '주황색': '#FF8C00', '오렌지': '#FF8C00',
    '노랑': '#FFD700', '노란색': '#FFD700', '옐로우': '#FFD700',
    '초록': '#32CD32', '초록색': '#32CD32', '그린': '#32CD32',
    '파랑': '#0000FF', '파란색': '#0000FF', '블루': '#0000FF',
    '남색': '#000080', '네이비': '#000080',
    '보라': '#800080', '보라색': '#800080', '퍼플': '#800080',
    '분홍': '#FFC0CB', '분홍색': '#FFC0CB', '핑크': '#FFC0CB',
    '검정': '#000000', '검은색': '#000000', '검정색': '#000000', '블랙': '#000000',
    '흰색': '#FFFFFF', '하얀색': '#FFFFFF', '화이트': '#FFFFFF',
    '회색': '#808080', '회색빛': '#808080', '그레이': '#808080',
    '베이지': '#F5F5DC', '베이지색': '#F5F5DC',
    '갈색': '#8B4513', '브라운': '#8B4513', '밤색': '#8B4513',
    '샌드': '#C2B280', '샌드색': '#C2B280',
    '카키': '#C3B091', '올리브': '#808000',
    '크림': '#FFFACD', '크림색': '#FFFACD',
    '아이보리': '#FFFFF0',
    '차콜': '#36454F', '차콜색': '#36454F',
    '연청': '#6495ED', '연청색': '#6495ED',
    '청': '#1E3A8A', '진청': '#1E3A8A', '데님': '#1E3A8A',
    '하늘색': '#87CEEB', '스카이블루': '#87CEEB',
    '민트': '#98FF98', '와인': '#722F37', '버건디': '#800020',
    '카멜': '#C19A6B', '머스타드': '#FFDB58', '라벤더': '#E6E6FA',
    
    // 영어
    'red': '#FF0000', 'orange': '#FF8C00', 'yellow': '#FFD700',
    'green': '#32CD32', 'blue': '#0000FF', 'navy': '#000080',
    'purple': '#800080', 'pink': '#FFC0CB', 'black': '#000000',
    'white': '#FFFFFF', 'gray': '#808080', 'beige': '#F5F5DC',
    'brown': '#8B4513', 'khaki': '#C3B091', 'olive': '#808000',
    'mint': '#98FF98', 'skyblue': '#87CEEB', 'denim': '#1E3A8A',
    'cream': '#FFFACD', 'ivory': '#FFFFF0', 'charcoal': '#36454F',
    'sand': '#C2B280', 'wine': '#722F37', 'camel': '#C19A6B',
  };

  const normalizedColor = firstColor.toLowerCase().trim();
  const hexColor = colorMap[normalizedColor];
  
  if (!hexColor) return '#CCCCCC';
  return hexColor;
};

interface OutfitItem {
  name: string;
  color: string;
}

interface VirtualTryOnData {
  id: string;
  coordinationName: string;
  coordinationDescription: string;
  generatedImageUri?: string;
  isGenerating?: boolean;
  coordinationId?: number;
  occasion?: string;
  items?: OutfitItem[];
  isFavorite?: boolean;
}

interface VirtualTryOnScreenProps {
  navigation: any;
  route: {
    params: {
      tryOnData: VirtualTryOnData;
    };
  };
}

const VirtualTryOnScreen: React.FC<VirtualTryOnScreenProps> = ({
  navigation,
  route,
}) => {
  const { tryOnData } = route.params;

  // ⭐ Redux에서 전신사진 URL 가져오기 (백업용)
  const userBodyPhotoUrl = useSelector((state: RootState) => state.user.bodyPhotoUrl);

  // 아이템 리스트 펼침/접힘 상태 관리
  const [isItemsExpanded, setIsItemsExpanded] = useState(false);
  
  // 이미지 로딩 상태 관리
  const [imageUrl, setImageUrl] = useState<string | undefined>(tryOnData.generatedImageUri);
  const [isLoading, setIsLoading] = useState(!tryOnData.generatedImageUri);
  const [error, setError] = useState<string | null>(null);
  
  // ⭐ 전신사진 URL (Settings와 동일한 방식으로 직접 가져오기)
  const [bodyPhotoUrl, setBodyPhotoUrl] = useState<string | null>(userBodyPhotoUrl);
  
  // ⭐ 로딩 프로그레스 및 메시지 관리
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);

  // ⭐ 하트(즐겨찾기) 상태 관리
  const [isLiked, setIsLiked] = useState(tryOnData.isFavorite ?? false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // 초기 로딩 시 전신사진 URL 확인
  useEffect(() => {
    const loadBodyPhoto = async () => {
      try {
        const response = await API.user.getProfile();
        const userData = response.data;
        
        if (userData.body_photo_url) {
          setBodyPhotoUrl(userData.body_photo_url);
        } else {
          setBodyPhotoUrl(null);
        }
      } catch (error) {
        setBodyPhotoUrl(userBodyPhotoUrl);
      }
    };
    
    loadBodyPhoto();
  }, []);

  // ⭐ 프로그레스 바 애니메이션 (20-40초 동안 0%→95%)
  useEffect(() => {
    if (!isLoading) return;

    const totalDuration = 30000; // 평균 30초
    const updateInterval = 100; // 100ms마다 업데이트
    const totalSteps = totalDuration / updateInterval;
    const progressIncrement = 100 / totalSteps;

    const progressTimer = setInterval(() => {
      setProgress(prev => {
        const newProgress = Math.min(prev + progressIncrement, 95);
        
        // 프로그레스에 따라 메시지 변경
        const messageIndex = Math.floor((newProgress / 100) * LOADING_MESSAGES.length);
        setLoadingMessage(LOADING_MESSAGES[Math.min(messageIndex, LOADING_MESSAGES.length - 1)]);
        
        return newProgress;
      });
    }, updateInterval);

    return () => clearInterval(progressTimer);
  }, [isLoading]);

  // 이미지가 없으면 polling으로 확인
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;
    
    if (!imageUrl && tryOnData.coordinationId) {
      setIsLoading(true);
      
      // 5초마다 이미지 생성 상태 확인
      pollInterval = setInterval(async () => {
        try {
          const response = await API.coordinations.get(tryOnData.coordinationId!);
          
          const imageUrlFromServer = response.data.virtual_tryon_image_url 
            || response.data.virtual_tryon_image 
            || response.data.image_url;
          
          if (imageUrlFromServer) {
            setImageUrl(imageUrlFromServer);
            setProgress(100);
            
            setTimeout(() => {
              setIsLoading(false);
            }, 500);
            
            clearInterval(pollInterval);
            clearTimeout(timeoutId);
          }
          
          if (response.data.is_favorite !== undefined) {
            setIsLiked(response.data.is_favorite);
          }
        } catch (err: any) {
          // 에러 무시
        }
      }, 5000);
      
      // 2분 후 타임아웃
      timeoutId = setTimeout(() => {
        if (!imageUrl) {
          setError('이미지 생성 시간이 초과되었습니다.\n잠시 후 다시 시도해주세요.');
          setIsLoading(false);
          clearInterval(pollInterval);
        }
      }, 120000);
    }
    
    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [imageUrl, tryOnData.coordinationId]);

  // 펼침/접힘 핸들러
  const toggleItems = () => {
    LayoutAnimation.configureNext({
      duration: 300,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.scaleY,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
    setIsItemsExpanded(!isItemsExpanded);
  };

  // ⭐ 즐겨찾기 토글 핸들러
  const handleToggleFavorite = async () => {
    if (!tryOnData.coordinationId || isTogglingFavorite) return;
    
    const previousState = isLiked;
    setIsTogglingFavorite(true);
    
    setIsLiked(!previousState);
    
    try {
      const response = await API.coordinations.toggleFavorite(tryOnData.coordinationId);
      
      if (response.data.is_favorite !== undefined) {
        setIsLiked(response.data.is_favorite);
      }
    } catch (error) {
      setIsLiked(previousState);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  // ⭐ 카드 내부 렌더링 함수 (페이드인 효과 적용)
  const renderCardContent = () => {
    if (isLoading) {
      const overlayOpacity = Math.max(0, (100 - progress) / 100);
      
      return (
        <View style={styles.loadingContainer}>
          {/* ⭐ Layer 1: 뿌연 전신사진 실루엣 (맨 뒤) */}
          {bodyPhotoUrl ? (
            <View style={styles.bodyPhotoBackground}>
              <Image
                source={{ uri: bodyPhotoUrl }}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              {/* 블러 효과로 실루엣만 보이게 */}
              <BlurView
                style={StyleSheet.absoluteFill}
                blurType="light"
                blurAmount={40}
                reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.8)"
              />
            </View>
          ) : (
            <View style={[styles.bodyPhotoBackground, { backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center', padding: 30 }]}>
              <Ionicons name="person-outline" size={80} color="#ccc" />
              <Text style={{ color: '#999', marginTop: 12, fontSize: 15, textAlign: 'center' }}>
                전신사진이 등록되지 않았어요
              </Text>
              <TouchableOpacity
                style={{
                  marginTop: 16,
                  paddingHorizontal: 20,
                  paddingVertical: 10,
                  backgroundColor: Colors.primary,
                  borderRadius: 12,
                }}
                onPress={() => {
                  navigation.navigate('Settings' as never);
                }}
              >
                <Text style={{ color: '#FFF', fontSize: 14, fontWeight: '600' }}>
                  Settings에서 등록하기
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {/* ⭐ Layer 2: 흰색 오버레이 (점점 투명해짐) */}
          <View 
            style={[
              styles.fadeOverlay,
              { opacity: overlayOpacity }
            ]}
            pointerEvents="none"
          />
          
          {/* ⭐ Layer 3: 프로그레스 바 및 메시지 (항상 보임) */}
          <View style={styles.loadingContentWrapper}>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View 
                  style={[
                    styles.progressBarFill,
                    { width: `${progress}%` }
                  ]}
                />
              </View>
            </View>
            
            <Text style={styles.loadingText}>
              {loadingMessage}
            </Text>
            
            <Ionicons 
              name="shirt-outline" 
              size={40} 
              color={Colors.primary} 
              style={{ marginTop: 12, opacity: 0.6 }}
            />
          </View>
        </View>
      );
    }
    
    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.textTertiary} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    if (imageUrl) {
      return (
        <>
          <Image
            source={{ uri: imageUrl }}
            style={styles.cardImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.3)']}
            style={styles.imageGradient}
          />
        </>
      );
    }
    
    return null;
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* 헤더 */}
        <Animated.View 
          style={styles.header}
          entering={FadeInDown.duration(600).delay(100)}
        >
          <View style={styles.headerContent}>
            {/* 뒤로 가기 버튼 */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons 
                name="chevron-back" 
                size={28} 
                color={Colors.textPrimary} 
              />
            </TouchableOpacity>

            {/* 코디네이션 제목 */}
            <View style={styles.headerTitleContainer}>
              <Text 
                style={styles.headerTitle}
                numberOfLines={2} 
                ellipsizeMode="tail"
                textBreakStrategy="highQuality"
              >
                {tryOnData.coordinationName}
              </Text>
            </View>
          </View>

          {/* 우측 상단 하트 버튼 */}
          <TouchableOpacity 
            style={{
              position: 'absolute',
              right: 10,
              padding: 10,
              zIndex: 10,
              opacity: isTogglingFavorite ? 0.5 : 1,
            }}
            onPress={handleToggleFavorite}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
            disabled={isTogglingFavorite || !tryOnData.coordinationId}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={28} 
              color={isLiked ? "#FF3040" : Colors.textPrimary} 
            />
          </TouchableOpacity>

        </Animated.View>

        {/* 메인 컨텐츠 */}
        <ScrollView
          style={styles.mainContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <Animated.View 
            style={styles.contentWrapper}
            entering={FadeIn.duration(600).delay(200)}
          >
            {/* 메인 카드 */}
            <View style={styles.cardContainer}>
              <View style={styles.card}>
                {/* 조건부 렌더링 */}
                {renderCardContent()}

                {/* 상단 오버레이 (뱃지) */}
                {!isLoading && !error && tryOnData.occasion && (
                  <View style={styles.topOverlay}>
                    <View style={styles.glassCard}>
                      <BlurView
                        style={styles.blurView}
                        blurType="light"
                        blurAmount={10}
                        reducedTransparencyFallbackColor="transparent"
                      />
                      <View style={styles.glassLayer}>
                        <View style={styles.occasionBadge}>
                          <View style={styles.occasionDot} />
                          <Text style={styles.occasionText}>
                            {tryOnData.occasion}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {/* 하단 오버레이 (아이템 리스트) */}
                {!isLoading && !error && tryOnData.items && tryOnData.items.length > 0 && (
                  <View 
                    style={[
                      styles.bottomOverlay,
                      { alignItems: isItemsExpanded ? 'stretch' : 'flex-end' }
                    ]}
                  >
                    {!isItemsExpanded ? (
                      <TouchableOpacity 
                        style={styles.expandButtonContainer}
                        onPress={toggleItems}
                        activeOpacity={0.8}
                      >
                        <BlurView
                          style={styles.blurView}
                          blurType="light"
                          blurAmount={10}
                          reducedTransparencyFallbackColor="transparent"
                        />
                        <View style={styles.expandButtonContent}>
                          <Ionicons 
                            name="add" 
                            size={28} 
                            color={Colors.textPrimary} 
                          />
                        </View>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.glassPanel}>
                        <BlurView
                          style={styles.blurView}
                          blurType="light"
                          blurAmount={10}
                          reducedTransparencyFallbackColor="transparent"
                        />
                        <View style={styles.glassContent}>
                          {tryOnData.items.map((item, index) => (
                            <View key={index} style={styles.itemRow}>
                              <View 
                                style={[
                                  styles.colorIndicator,
                                  { backgroundColor: getColorHex(item.color) }
                                ]} 
                              />
                              <Text style={styles.itemName}>{item.name}</Text>
                            </View>
                          ))}
                          
                          <View style={styles.itemRow}>
                            <View style={styles.colorIndicatorPlaceholder} />
                            <View style={{ flex: 1 }} />
                            <TouchableOpacity 
                              onPress={toggleItems}
                              activeOpacity={0.8}
                              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                              <Ionicons 
                                name="remove" 
                                size={24} 
                                color={Colors.textPrimary} 
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>

            {/* 하단 Detail 패널 */}
            <View style={styles.detailPanel}>
              <BlurView
                style={styles.blurView}
                blurType="light"
                blurAmount={10}
                reducedTransparencyFallbackColor="transparent"
              />
              <View style={styles.detailContent}>
                <View style={styles.descriptionHeader}>
                  <Ionicons 
                    name="sparkles" 
                    size={18} 
                    color={Colors.accent} 
                  />
                  <Text style={styles.descriptionLabel}>
                    Coordination Details
                  </Text>
                </View>
                
                <Text style={styles.descriptionText}>
                  {tryOnData.coordinationDescription}
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default VirtualTryOnScreen;