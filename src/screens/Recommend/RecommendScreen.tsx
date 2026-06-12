// src/screens/Recommend/RecommendScreen.tsx
// 개선된 버전: 추천 생성 후 즉시 백그라운드에서 이미지 생성, 입어보기 클릭 시 바로 VirtualTryOn 화면으로 이동
// ⭐ 스타일 프리퍼런스 기능 추가 (날씨 카드 아래 배치)
// ⭐ 의류 1개 이상이면 작동, 3개 미만이면 다양성 경고 모달 표시

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Vibration,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from '@react-native-community/blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeInDown, 
  FadeInUp,
  Layout,
  SlideInRight,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { Image } from 'expo-image';

import { styles } from './RecommendScreen.styles';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/dimensions';
import { useWeatherAndSchedule } from '../../hooks/useWeatherAndSchedule';
import weatherService from '../../services/weather/weatherService';
import { API, OutfitRecommendationRequest } from '../../api/client';
import { selectAllClothes, fetchClothes } from '../../store/slices/closetSlice';

// 모달 컴포넌트
import RecommendGeneratingModal from './components/RecommendGeneratingModal';
import ClothingRequirementModal from './components/ClothingRequirementModal';
import StylePreferenceModal from './components/StylePreferenceModal';
import LowVarietyWarningModal from './components/LowVarietyWarningModal';

// 캐시 관리
import {
  loadStylePreference,
  saveStylePreference,
  clearStylePreference,
} from '../../utils/cacheManager';

type RecommendationType = 'weather' | 'schedule' | 'ai';

interface RecommendationCard {
  id: string;
  type: RecommendationType;
  title: string;
  subtitle: string;
  items: {
    top?: { id: number; name: string; color: string; };
    bottom?: { id: number; name: string; color: string; };
    outer?: { id: number; name: string; color: string; };
  };
  reason: string;
  styleTips: string;
  timestamp: Date;
  isExpanded: boolean;
}

// ★ 이미지 생성 상태 인터페이스
interface ImageGenerationStatus {
  isGenerating: boolean;
  imageUrl?: string;
  error?: string;
}

const MAX_RETRIES = 3;

interface RecommendScreenProps {
  navigation: any;
}

export const RecommendScreen: React.FC<RecommendScreenProps> = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const dispatch = useDispatch();

  // 게스트 여부 확인
  const [isGuest, setIsGuest] = useState(false);
  // 서버 기록 로딩 상태
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  useEffect(() => {
    const checkGuestStatus = async () => {
      try {
        const userInfoString = await AsyncStorage.getItem('userInfo');
        if (userInfoString) {
          const userInfo = JSON.parse(userInfoString);
          const email = userInfo?.user?.email || '';
          if (email.endsWith('@orbit.guest')) {
            setIsGuest(true);
          }
        }
      } catch (error) {
        console.error('❌ 게스트 확인 실패:', error);
      }
    };
    checkGuestStatus();
  }, []);

  const buttonCount = isGuest ? 2 : 3;
  const actionButtonWidth = (width - (Spacing.lg * 2) - (Spacing.sm * (buttonCount - 1))) / buttonCount;

  const { weather, events, isLoading, isRefreshing } = useWeatherAndSchedule();
  const allClothes = useSelector(selectAllClothes);

  // 추천 목록 상태
  const [recommendations, setRecommendations] = useState<RecommendationCard[]>([]);

  // ★ 이미지 생성 상태 관리 (coordination ID를 키로 사용)
  const [imageGenerationStatus, setImageGenerationStatus] = useState<Map<string, ImageGenerationStatus>>(new Map());

  const [modalVisible, setModalVisible] = useState(false);
  const [generatingType, setGeneratingType] = useState<RecommendationType>('weather');
  const [requirementModalVisible, setRequirementModalVisible] = useState(false);
  
  // ⭐ 스타일 프리퍼런스 모달
  const [stylePreferenceModalVisible, setStylePreferenceModalVisible] = useState(false);
  const [stylePreference, setStylePreference] = useState<string>('');
  
  // ⭐ 코디 다양성 경고 모달
  const [lowVarietyWarningVisible, setLowVarietyWarningVisible] = useState(false);
  const [pendingRecommendation, setPendingRecommendation] = useState<(() => void) | null>(null);
  
  const [progress, setProgress] = useState(0);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  // ⭐ 스타일 프리퍼런스 로드
  useEffect(() => {
    const loadPreference = async () => {
      const savedPreference = await loadStylePreference();
      if (savedPreference) {
        setStylePreference(savedPreference);
        console.log('✅ 스타일 프리퍼런스 로드됨:', savedPreference);
      }
    };
    loadPreference();
  }, []);

  // 옷장 데이터 불러오기
  useEffect(() => {
    if (!isGuest && allClothes.length === 0) {
      dispatch(fetchClothes() as any);
    }
  }, [dispatch, allClothes.length, isGuest]);

  // ⭐ [핵심] 화면 진입 시 서버에서 코디 목록 불러오기
  useEffect(() => {
    fetchHistoryFromServer();
  }, []);

  const fetchHistoryFromServer = async () => {
    setIsLoadingHistory(true);
    try {
      console.log('📄 서버 요청 시작: API.coordinations.list()');
      
      const response = await API.coordinations.list();
      
      // 1. 데이터 꺼내기
      let rawList: any[] = [];
      if (Array.isArray(response.data)) {
        rawList = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        rawList = response.data.results;
      } else if (response.data && Array.isArray(response.data.coordinations)) {
        rawList = response.data.coordinations;
      }

      if (rawList.length > 0) {
        // [추가] 1. 이미지 상태 맵 미리 생성 (캐싱용)
        const initialImageStatus = new Map<string, ImageGenerationStatus>();

        // 오늘 날짜 계산
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const serverHistory = rawList
          .filter((item: any) => {
            if (!item.created_at) return false;
            const createdDate = new Date(item.created_at);
            return createdDate >= today && createdDate < tomorrow;
          })
          .map((item: any) => {
            // [복원] 기존 상세 파싱 로직 유지
            let topItem, bottomItem, outerItem;
            
            if (item.items && Array.isArray(item.items)) {
              item.items.forEach((clothesItem: any) => {
                const detail = clothesItem.clothes_detail;
                if (!detail) return;
                
                const mainCategory = detail.mainCategory || detail.main_category;
                const colorInfo = detail.color || detail.main_color || detail.mainColor || '정보 없음';
                
                if (mainCategory === 'TOP') {
                  topItem = {
                    id: detail.id || 0,
                    name: detail.name || detail.category || '상의',
                    color: colorInfo
                  };
                } else if (mainCategory === 'BOTTOM') {
                  bottomItem = {
                    id: detail.id || 0,
                    name: detail.name || detail.category || '하의',
                    color: colorInfo
                  };
                } else if (mainCategory === 'OUTER') {
                  outerItem = {
                    id: detail.id || 0,
                    name: detail.name || detail.category || '아우터',
                    color: colorInfo
                  };
                }
              });
            }

            // [복원] detail 필드 파싱 로직
            let reason = '';
            let styleTips = '';
            
            if (item.detail) {
              const parts = item.detail.split('추천 이유:');
              if (parts.length > 1) {
                const [description, rest] = parts;
                reason = description.trim();
                
                const tipsParts = rest.split('스타일 팁:');
                if (tipsParts.length > 1) {
                  styleTips = tipsParts[1].trim();
                }
              } else {
                reason = item.detail;
              }
            }

            // [추가] 2. 서버 데이터에 이미지가 있다면 상태 맵에 저장
            const serverImageUrl = item.virtual_tryon_image_url || item.virtual_tryon_image || item.image_url;
            const idStr = item.id?.toString();
            
            if (idStr && serverImageUrl) {
              initialImageStatus.set(idStr, {
                isGenerating: false,
                imageUrl: serverImageUrl
              });
            }

            return {
              id: idStr || Math.random().toString(),
              type: 'ai',
              title: item.name || item.outfit_title || item.title || '저장된 코디',
              subtitle: item.occasion || item.description || '지난 추천',
              items: {
                top: topItem,
                bottom: bottomItem,
                outer: outerItem,
              },
              reason: reason || item.reason || item.outfit_description || '',
              styleTips: styleTips || item.style_tips || item.styling_tips || '',
              timestamp: item.created_at ? new Date(item.created_at) : new Date(),
              isExpanded: false,
            };
          });

        // [추가] 3. 이미지 상태 일괄 업데이트
        if (initialImageStatus.size > 0) {
          setImageGenerationStatus(prev => {
            const newMap = new Map(prev);
            initialImageStatus.forEach((value, key) => {
              newMap.set(key, value);
            });
            return newMap;
          });
        }

        serverHistory.sort((a: any, b: any) => b.timestamp.getTime() - a.timestamp.getTime());
        setRecommendations(serverHistory);
      }
    } catch (error: any) {
      console.error('❌ 기록 불러오기 실패:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // ★ 백그라운드에서 이미지 생성 시작
  const startImageGeneration = async (coordinationId: string, card: RecommendationCard) => {
    console.log('🎨 이미지 생성 시작:', coordinationId);
    
    // 이미지 생성 상태 업데이트
    setImageGenerationStatus(prev => {
      const newMap = new Map(prev);
      newMap.set(coordinationId, { isGenerating: true });
      return newMap;
    });
    
    try {
      const response = await API.coordinations.generateVirtualTryOn(parseInt(coordinationId, 10));
      
      if (response.data.success && response.data.image_url) {
        console.log('✅ 이미지 생성 완료:', response.data.image_url);
        
        // ★ 이미지를 캐시에 미리 저장 (expo-image는 자동 캐싱)
        console.log('💾 이미지 자동 캐싱');
        
        setImageGenerationStatus(prev => {
          const newMap = new Map(prev);
          newMap.set(coordinationId, {
            isGenerating: false,
            imageUrl: response.data.image_url,
          });
          return newMap;
        });
      } else {
        throw new Error('이미지 생성 실패');
      }
    } catch (error: any) {
      console.error('❌ 이미지 생성 에러:', error);
      
      setImageGenerationStatus(prev => {
        const newMap = new Map(prev);
        newMap.set(coordinationId, {
          isGenerating: false,
          error: error.message || '이미지 생성 중 오류가 발생했습니다',
        });
        return newMap;
      });
    }
  };

  // ⭐ 옷 개수 체크 - 1개 이상이면 작동, 3개 미만이면 경고
  const checkClothesRequirements = (proceedCallback: () => void): boolean => {
    const topCount = allClothes.filter(c => c.mainCategory === 'TOP').length;
    const bottomCount = allClothes.filter(c => c.mainCategory === 'BOTTOM').length;
    const outerCount = allClothes.filter(c => c.mainCategory === 'OUTER').length;

    // 1개 미만이면 완전 차단
    if (topCount < 1 || bottomCount < 1 || outerCount < 1) {
      setRequirementModalVisible(true);
      Vibration.vibrate(50);
      return false;
    }
    
    // 3개 미만이면 경고 표시
    if (topCount < 3 || bottomCount < 3 || outerCount < 3) {
      setPendingRecommendation(() => proceedCallback);
      setLowVarietyWarningVisible(true);
      Vibration.vibrate(50);
      return false;
    }
    
    return true;
  };

  // ⭐ 경고 모달 핸들러
  const handleLowVarietyCancel = () => {
    setLowVarietyWarningVisible(false);
    setPendingRecommendation(null);
  };

  const handleLowVarietyContinue = () => {
    setLowVarietyWarningVisible(false);
    if (pendingRecommendation) {
      pendingRecommendation();
      setPendingRecommendation(null);
    }
  };

  // 진행바 시뮬레이션
  const startProgress = () => {
    setProgress(0);
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        const increment = Math.random() * 1 + 0.5;
        return Math.min(prev + increment, 90);
      });
    }, 250);
  };

  const finishProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    setProgress(100);
  };

  const resetProgress = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }
    setProgress(0);
  };

  // ===== API 호출 함수들 =====

  const generateWeatherRecommendation = async () => {
    const proceed = checkClothesRequirements(() => {
      proceedWithWeatherRecommendation();
    });
    
    if (!proceed) return;
    
    proceedWithWeatherRecommendation();
  };

  const proceedWithWeatherRecommendation = async () => {
    if (!weather) {
      Alert.alert('알림', '날씨 정보를 불러오는 중입니다.');
      return;
    }
    
    setGeneratingType('weather');
    setModalVisible(true);
    startProgress();
    Vibration.vibrate(50);
    
    try {
      const requestData: OutfitRecommendationRequest = {
        recommendation_type: 'weather',
        weather_data: {
          temp: weather.temp,
          feels_like: weather.feelsLike,
          description: weather.description,
          humidity: weather.humidity || 0,
          wind_speed: weather.windSpeed || 0,
        },
        ...(stylePreference ? { style_preference: stylePreference } : {}),
      };
      
      let retryCount = 0;
      let success = false;

      while (!success && retryCount < MAX_RETRIES) {
        try {
          const response = await API.outfit.recommend(requestData);
          
          if (!response.data.success && response.data.error === 'duplicate' && response.data.retry) {
            retryCount++;
            if (retryCount >= MAX_RETRIES) throw new Error('추천 조합 실패');
            await new Promise(r => setTimeout(r, 1000));
            continue;
          }
          
          if (response.data.success && response.data.recommendation) {
            const rec = response.data.recommendation;
            const coordinationId = response.data.coordination_id?.toString() || Date.now().toString();
            
            const newCard: RecommendationCard = {
              id: coordinationId,
              type: 'weather',
              title: rec.outfit_title,
              subtitle: `${weather.temp}°C, ${weather.description}`,
              items: {
                top: rec.top || undefined,
                bottom: rec.bottom || undefined,
                outer: rec.outer || undefined,
              },
              reason: rec.reason,
              styleTips: rec.style_tips,
              timestamp: new Date(),
              isExpanded: false,
            };
            
            setRecommendations(prev => [newCard, ...prev]);
            success = true;
            finishProgress();
            
            startImageGeneration(coordinationId, newCard);
            
            setTimeout(() => {
              setModalVisible(false);
            }, 1200);
          } else {
            throw new Error(response.data.error || '오류');
          }
        } catch (e) { throw e; }
      }
    } catch (error: any) {
      resetProgress();
      setModalVisible(false);
      Alert.alert('추천 실패', error.message);
    }
  };

  const generateScheduleRecommendation = async () => {
    const proceed = checkClothesRequirements(() => {
      proceedWithScheduleRecommendation();
    });
    
    if (!proceed) return;
    
    proceedWithScheduleRecommendation();
  };

  const proceedWithScheduleRecommendation = async () => {
    if (!events || events.length === 0) {
      Alert.alert('일정 없음', '오늘 예정된 일정이 없습니다.');
      return;
    }
    
    setGeneratingType('schedule');
    setModalVisible(true);
    startProgress();
    Vibration.vibrate(50);
    
    try {
      const requestData: OutfitRecommendationRequest = {
        recommendation_type: 'schedule',
        calendar_events: events.map(event => ({
          title: event.summary,
          start_time: event.start,
          end_time: event.end,
          description: event.location || '',
        })),
        ...(stylePreference ? { style_preference: stylePreference } : {}),
      };
      
      let retryCount = 0;
      let success = false;

      while (!success && retryCount < MAX_RETRIES) {
        try {
          const response = await API.outfit.recommend(requestData);
          
          if (!response.data.success && response.data.error === 'duplicate' && response.data.retry) {
            retryCount++;
            if (retryCount >= MAX_RETRIES) throw new Error('추천 조합 실패');
            await new Promise(r => setTimeout(r, 1000));
            continue;
          }
          
          if (response.data.success && response.data.recommendation) {
            const rec = response.data.recommendation;
            const coordinationId = response.data.coordination_id?.toString() || Date.now().toString();
            
            const newCard: RecommendationCard = {
              id: coordinationId,
              type: 'schedule',
              title: rec.outfit_title,
              subtitle: events[0].summary,
              items: {
                top: rec.top || undefined,
                bottom: rec.bottom || undefined,
                outer: rec.outer || undefined,
              },
              reason: rec.reason,
              styleTips: rec.style_tips,
              timestamp: new Date(),
              isExpanded: false,
            };
            
            setRecommendations(prev => [newCard, ...prev]);
            success = true;
            finishProgress();
            
            startImageGeneration(coordinationId, newCard);
            
            setTimeout(() => {
              setModalVisible(false);
            }, 1200);
          } else { 
            throw new Error('오류'); 
          }
        } catch (e) { throw e; }
      }
    } catch (error: any) {
      resetProgress();
      setModalVisible(false);
      Alert.alert('추천 실패', error.message);
    }
  };

  const generateAIRecommendation = async () => {
    const proceed = checkClothesRequirements(() => {
      proceedWithAIRecommendation();
    });
    
    if (!proceed) return;
    
    proceedWithAIRecommendation();
  };

  const proceedWithAIRecommendation = async () => {
    setGeneratingType('ai');
    setModalVisible(true);
    startProgress();
    Vibration.vibrate(50);
    
    try {
      const requestData: OutfitRecommendationRequest = {
        recommendation_type: 'ai',
        weather_data: weather ? {
          temp: weather.temp,
          feels_like: weather.feelsLike,
          description: weather.description,
          humidity: weather.humidity || 0,
          wind_speed: weather.windSpeed || 0,
        } : undefined,
        calendar_events: !isGuest && events && events.length > 0 ? events.map(event => ({
          title: event.title || event.summary,
          start_time: event.startTime,
          end_time: event.endTime,
          description: event.location || '',
        })) : undefined,
        ...(stylePreference ? { style_preference: stylePreference } : {}),
      };
      
      let retryCount = 0;
      let success = false;

      while (!success && retryCount < MAX_RETRIES) {
        try {
          const response = await API.outfit.recommend(requestData);
          
          if (!response.data.success && response.data.error === 'duplicate' && response.data.retry) {
            retryCount++;
            if (retryCount >= MAX_RETRIES) throw new Error('추천 조합 실패');
            await new Promise(r => setTimeout(r, 1000));
            continue;
          }
          
          if (response.data.success && response.data.recommendation) {
            const rec = response.data.recommendation;
            const coordinationId = response.data.coordination_id?.toString() || Date.now().toString();
            
            const newCard: RecommendationCard = {
              id: coordinationId,
              type: 'ai',
              title: rec.outfit_title,
              subtitle: 'AI 맞춤 추천',
              items: {
                top: rec.top || undefined,
                bottom: rec.bottom || undefined,
                outer: rec.outer || undefined,
              },
              reason: rec.reason,
              styleTips: rec.style_tips,
              timestamp: new Date(),
              isExpanded: false,
            };
            
            setRecommendations(prev => [newCard, ...prev]);
            success = true;
            finishProgress();
            
            startImageGeneration(coordinationId, newCard);
            
            setTimeout(() => {
              setModalVisible(false);
            }, 1200);
          } else { 
            throw new Error('오류'); 
          }
        } catch (e) { throw e; }
      }
    } catch (error: any) {
      resetProgress();
      setModalVisible(false);
      Alert.alert('추천 실패', error.message);
    }
  };

  // ⭐ 스타일 프리퍼런스 저장 핸들러
  const handleSaveStylePreference = async (preference: string) => {
    const success = await saveStylePreference(preference);
    if (success) {
      setStylePreference(preference);
      console.log('✅ 스타일 프리퍼런스 저장됨:', preference);
    } else {
      Alert.alert('저장 실패', '스타일 선호도를 저장하는 중 오류가 발생했습니다.');
    }
  };

  // ⭐ 스타일 프리퍼런스 삭제 핸들러
  const handleClearStylePreference = async () => {
    const success = await clearStylePreference();
    if (success) {
      setStylePreference('');
      console.log('🗑️ 스타일 프리퍼런스 삭제됨');
    }
  };

  const toggleCard = (id: string) => {
    Vibration.vibrate(30);
    setRecommendations(prev => 
      prev.map(card => 
        card.id === id ? { ...card, isExpanded: !card.isExpanded } : card
      )
    );
  };

  const tryOnOutfit = async (card: RecommendationCard) => {
    const coordinationId = parseInt(card.id, 10);
    
    if (!coordinationId || isNaN(coordinationId)) {
      Alert.alert('오류', '코디네이션 ID가 없습니다.');
      return;
    }
    
    Vibration.vibrate(50);
    
    const imageStatus = imageGenerationStatus.get(card.id);
    
    const items = [];
    if (card.items?.outer) {
      items.push({ name: card.items.outer.name, color: card.items.outer.color });
    }
    if (card.items?.top) {
      items.push({ name: card.items.top.name, color: card.items.top.color });
    }
    if (card.items?.bottom) {
      items.push({ name: card.items.bottom.name, color: card.items.bottom.color });
    }
    
    let isFavorite = false;
    try {
      const response = await API.coordinations.get(coordinationId);
      if (response.data && response.data.is_favorite !== undefined) {
        isFavorite = response.data.is_favorite;
      }
    } catch (error) {
      console.log('즐겨찾기 상태 조회 실패, 기본값 false 사용');
    }
    
    navigation.navigate('VirtualTryOn', { 
      tryOnData: {
        id: card.id,
        coordinationName: card.title,
        coordinationDescription: card.reason + '\n\n' + card.styleTips,
        generatedImageUri: imageStatus?.imageUrl,
        isGenerating: imageStatus?.isGenerating || false,
        coordinationId: coordinationId,
        occasion: card.subtitle,
        items: items.length > 0 ? items : undefined,
        isFavorite: isFavorite,
      }
    });
  };

  const getTypeIcon = (type: RecommendationType): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'weather': return 'partly-sunny';
      case 'schedule': return 'calendar';
      case 'ai': return 'sparkles';
      default: return 'sparkles';
    }
  };

  const getTypeColor = (type: RecommendationType) => {
    switch (type) {
      case 'weather': return '#FF9500';
      case 'schedule': return '#007AFF';
      case 'ai': return Colors.primary;
      default: return Colors.primary;
    }
  };

  const renderClothingItem = (label: string, item?: { name: string; color: string }) => {
    if (!item) return null;
    return (
      <View style={styles.itemRow}>
        <View style={styles.itemRowContent}>
          <View style={styles.itemLabelBox}>
            <Text style={styles.itemLabel}>{label}</Text>
          </View>
          <View style={styles.itemNameBox}>
            <Text style={styles.itemName} numberOfLines={2}>
              {item.name} ({item.color})
            </Text>
          </View>
        </View>
      </View>
    );
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
            <View style={styles.logoContainer}>
              <Text style={styles.orbitText}>ORBIT</Text>
              <Text style={styles.tagline}>AI Stylist</Text>
            </View>
            {(isRefreshing || isLoadingHistory) && !modalVisible && (
              <View style={{ position: 'absolute', right: 20, top: 20 }}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            )}
          </View>
        </Animated.View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          {/* ===== 날씨 & 일정 위젯 ===== */}
          <Animated.View 
            style={styles.weatherScheduleContainer}
            entering={FadeInDown.duration(600).delay(200)}
          >
            <View style={styles.weatherScheduleCard}>
              <BlurView
                blurType="light"
                blurAmount={3}
                reducedTransparencyFallbackColor="white"
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.glassLayer} />
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0)']}
                style={styles.topHighlight}
              />
              <View style={styles.contentContainer}>
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                    <Text style={styles.loadingText}>정보를 불러오는 중...</Text>
                  </View>
                ) : (
                  <View style={styles.infoRow}>
                    <View style={styles.infoSection}>
                      {weather ? (
                        <View style={styles.infoContent}>
                          <View style={styles.infoIconContainer}>
                            <View style={styles.iconGlow}>
                              <Ionicons
                                name={weatherService.getWeatherIonicon(weather.icon) as any}
                                size={40}
                                color={Colors.primary}
                              />
                            </View>
                          </View>
                          <View style={styles.infoTextGroup}>
                            <Text style={styles.infoTitle}>{weather.temp}°C</Text>
                            <Text style={styles.infoSubtitle}>{weather.description}</Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.infoContent}>
                          <View style={styles.infoIconContainer}>
                            <Ionicons name="cloud-offline-outline" size={40} color={Colors.textTertiary} />
                          </View>
                          <Text style={styles.infoError}>날씨 정보 없음</Text>
                        </View>
                      )}
                    </View>

                    {!isGuest && (
                      <>
                        <View style={styles.divider} />
                        <View style={styles.infoSection}>
                          <View style={styles.infoContent}>
                            <View style={styles.infoIconContainer}>
                              <View style={styles.iconGlow}>
                                <Ionicons name="calendar" size={40} color={Colors.primary} />
                              </View>
                            </View>
                            <View style={styles.infoTextGroup}>
                              <Text style={styles.infoTitle}>
                                {events.length > 0 ? `일정 ${events.length}개` : '일정 없음'}
                              </Text>
                              {events.length > 0 && (
                                <Text style={styles.infoSubtitle} numberOfLines={1}>
                                  {events[0].title || events[0].summary}
                                </Text>
                              )}
                            </View>
                          </View>
                        </View>
                      </>
                    )}
                  </View>
                )}
              </View>
            </View>
          </Animated.View>

          {/* ⭐ 스타일 프리퍼런스 버튼 (날씨 카드 아래 배치) */}
          <Animated.View
            style={styles.stylePreferenceContainer}
            entering={FadeInDown.duration(600).delay(250)}
          >
            <TouchableOpacity
              style={styles.stylePreferenceButton}
              onPress={() => setStylePreferenceModalVisible(true)}
              activeOpacity={0.7}
            >
              <BlurView
                blurType="light"
                blurAmount={3}
                reducedTransparencyFallbackColor="white"
                style={StyleSheet.absoluteFill}
              />
              <View style={styles.glassLayer} />
              <LinearGradient
                colors={stylePreference 
                  ? [`${Colors.primary}30`, `${Colors.primary}10`]
                  : ['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0)']}
                style={styles.buttonHighlight}
              />
              <View style={styles.stylePreferenceContent}>
                <View style={[styles.iconGlow, { 
                  backgroundColor: stylePreference ? `${Colors.primary}20` : 'rgba(0,0,0,0.05)',
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                }]}>
                  <Ionicons 
                    name="color-palette-outline" 
                    size={22} 
                    color={stylePreference ? Colors.primary : Colors.textSecondary} 
                  />
                </View>
                <View style={styles.stylePreferenceTextContainer}>
                  <Text style={styles.stylePreferenceTitle}>
                    {stylePreference ? '스타일 선호도 설정됨' : '나만의 스타일 설정'}
                  </Text>
                  <Text style={styles.stylePreferenceSubtitle} numberOfLines={1}>
                    {stylePreference || '원하는 스타일을 입력하면 추천에 반영됩니다'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* ===== 액션 버튼들 ===== */}
          <Animated.View 
            style={styles.actionsContainer}
            entering={FadeInDown.duration(600).delay(300)}
          >
            <TouchableOpacity
              style={[styles.actionButton, { width: actionButtonWidth }]}
              onPress={generateWeatherRecommendation}
              disabled={modalVisible || !weather}
              activeOpacity={0.7}
            >
               <BlurView blurType="light" blurAmount={3} style={StyleSheet.absoluteFill} />
              <View style={styles.glassLayer} />
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0)']}
                style={styles.buttonHighlight}
              />
              <View style={styles.buttonContent}>
                <View style={styles.buttonIconContainer}>
                  <View style={[styles.iconGlow, { opacity: !weather ? 0.3 : 1 }]}>
                    <Ionicons 
                      name="partly-sunny" size={32} 
                      color={!weather ? Colors.textTertiary : '#FF9500'}
                    />
                  </View>
                </View>
                <Text style={[styles.actionButtonText, !weather && styles.actionButtonTextDisabled]}>
                  날씨 기반
                </Text>
              </View>
            </TouchableOpacity>

            {!isGuest && (
              <TouchableOpacity
                style={[styles.actionButton, { width: actionButtonWidth }]}
                onPress={generateScheduleRecommendation}
                disabled={modalVisible || events.length === 0}
                activeOpacity={0.7}
              >
                <BlurView blurType="light" blurAmount={3} style={StyleSheet.absoluteFill} />
                <View style={styles.glassLayer} />
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0)']}
                  style={styles.buttonHighlight}
                />
                <View style={styles.buttonContent}>
                  <View style={styles.buttonIconContainer}>
                    <View style={[styles.iconGlow, { opacity: events.length === 0 ? 0.3 : 1 }]}>
                      <Ionicons 
                        name="calendar" size={32} 
                        color={events.length === 0 ? Colors.textTertiary : '#007AFF'}
                      />
                    </View>
                  </View>
                  <Text style={[styles.actionButtonText, events.length === 0 && styles.actionButtonTextDisabled]}>
                    일정 기반
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[styles.actionButton, { width: actionButtonWidth }]}
              onPress={generateAIRecommendation}
              disabled={modalVisible}
              activeOpacity={0.7}
            >
              <BlurView blurType="light" blurAmount={3} style={StyleSheet.absoluteFill} />
              <View style={styles.glassLayer} />
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0)']}
                style={styles.buttonHighlight}
              />
              <View style={styles.buttonContent}>
                <View style={styles.buttonIconContainer}>
                  <View style={styles.iconGlow}>
                    <Ionicons name="sparkles" size={32} color={Colors.primary} />
                  </View>
                </View>
                <Text style={styles.actionButtonText}>AI 추천</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* 추천 카드 리스트 */}
          {recommendations.length > 0 && (
            <Animated.View layout={Layout.duration(300)}>
              <Text style={styles.sectionTitle}>
                오늘의 추천 ({recommendations.length})
              </Text>

              {recommendations.map((card, index) => (
                <Animated.View
                  key={card.id}
                  entering={SlideInRight.duration(400).delay(index * 50)}
                  layout={Layout.springify()}
                  style={styles.cardWrapper}
                >
                   <View style={styles.recommendCard}>
                    <BlurView
                      blurType="light"
                      blurAmount={3}
                      reducedTransparencyFallbackColor="white"
                      style={StyleSheet.absoluteFill}
                    />
                    <View style={styles.glassLayer} /> 
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0)']}
                      style={styles.cardHighlight}
                    />
                    
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => toggleCard(card.id)}
                    >
                      <View style={styles.cardHeaderContainer}>
                        <View style={styles.cardHeaderLeft}>
                          <LinearGradient
                            colors={[`${getTypeColor(card.type)}20`, `${getTypeColor(card.type)}10`]}
                            style={styles.typeIconBg}
                          >
                            <Ionicons 
                              name={getTypeIcon(card.type)} 
                              size={22} 
                              color={getTypeColor(card.type)} 
                            />
                          </LinearGradient>
                        </View>
                        <View style={styles.cardHeaderCenter}>
                          <Text style={styles.cardTitle}>{card.title}</Text>
                          <Text style={styles.cardSubtitle}>{card.subtitle}</Text>
                        </View>
                        <View style={styles.cardHeaderRight}>
                          <Ionicons 
                            name={card.isExpanded ? 'chevron-up' : 'chevron-down'} 
                            size={24} 
                            color={Colors.textSecondary} 
                          />
                        </View>
                      </View>
                    </TouchableOpacity>

                    {card.isExpanded && (
                      <Animated.View 
                        entering={FadeInDown.duration(300)} 
                        style={styles.cardExpandedContent}
                      >
                        <View style={styles.reasonContainer}>
                          <Ionicons name="bulb-outline" size={16} color={Colors.textSecondary} />
                          <Text style={styles.reasonText}>{card.reason}</Text>
                        </View>

                        <View style={styles.itemsColumn}>
                          {card.items.outer && renderClothingItem('OUTER', card.items.outer)}
                          {card.items.top && renderClothingItem('TOP', card.items.top)}
                          {card.items.bottom && renderClothingItem('BOTTOM', card.items.bottom)}
                        </View>

                        {card.styleTips && (
                          <View style={styles.reasonContainer}>
                            <Ionicons name="sparkles-outline" size={16} color={Colors.primary} />
                            <Text style={styles.reasonText}>{card.styleTips}</Text>
                          </View>
                        )}

                        <TouchableOpacity 
                          style={styles.applyButton} 
                          onPress={() => tryOnOutfit(card)} 
                          activeOpacity={0.7}
                        >
                          <LinearGradient 
                            colors={[Colors.primary, Colors.primary + 'E0']} 
                            start={{x:0,y:0}} 
                            end={{x:1,y:1}} 
                            style={styles.applyButtonGradient}
                          >
                            <Ionicons name="eye-outline" size={20} color="#FFF" />
                            <Text style={styles.applyButtonText}>입어보기</Text>
                          </LinearGradient>
                        </TouchableOpacity>
                      </Animated.View>
                    )}
                  </View>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {/* 빈 상태 */}
          {recommendations.length === 0 && !modalVisible && !isLoadingHistory && (
            <Animated.View 
              style={styles.emptyContainer}
              entering={FadeInUp.duration(600).delay(400)}
            >
              <View style={styles.emptyIconWrapper}>
                <View
                  colors={[`${Colors.primary}20`, `${Colors.primary}10`]}
                  style={styles.emptyIconBg}
                >
                  <Ionicons name="shirt-outline" size={64} color={Colors.textTertiary} />
                </View>
              </View>
              <Text style={styles.emptyTitle}>
                {isGuest ? '새로운 추천을 받아보세요' : '오늘의 추천 코디가 없습니다'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {isGuest 
                  ? '날씨 또는 AI 기반 추천 중 하나를 선택하세요' 
                  : '버튼을 눌러 추천을 받거나, 지난 기록이 없습니다'}
              </Text>
            </Animated.View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      <RecommendGeneratingModal
        visible={modalVisible}
        recommendationType={generatingType}
        progress={progress}
      />

      <ClothingRequirementModal
        visible={requirementModalVisible}
        onClose={() => setRequirementModalVisible(false)}
      />

      <StylePreferenceModal
        visible={stylePreferenceModalVisible}
        onClose={() => setStylePreferenceModalVisible(false)}
        onSave={handleSaveStylePreference}
        initialValue={stylePreference}
      />

      {/* ⭐ 코디 다양성 경고 모달 */}
      <LowVarietyWarningModal
        visible={lowVarietyWarningVisible}
        onCancel={handleLowVarietyCancel}
        onContinue={handleLowVarietyContinue}
      />
    </View>
  );
};

export default RecommendScreen;