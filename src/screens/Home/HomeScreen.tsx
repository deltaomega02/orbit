// src/screens/Home/HomeScreen.tsx
// 홈 화면 - 메인 컴포넌트 
// ★ v2.0: 레이아웃 수정 - 로고 표시, 인디케이터 위치 조정
// ★ v2.1: EmptyCard 컴포넌트 추가 - 코디가 없을 때 카드 표시

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Vibration, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, {
  FadeInDown,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { styles } from './HomeScreen.styles';
import { OutfitCard } from './components/OutfitCard';
import { EmptyCard } from './components/EmptyCard';
import { API } from '../../api/client';
import { Colors } from '../../constants/colors';

// 타입 정의
interface OutfitItem {
  name: string;
  color: string;
}

interface Outfit {
  id: string;
  title: string;
  imageUri: string;
  occasion: string;
  items: OutfitItem[];
}

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // State
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOutfitIndex, setSelectedOutfitIndex] = useState(0);
  const [leftPressed, setLeftPressed] = useState(false);
  const [rightPressed, setRightPressed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Animated values
  const cardScale = useSharedValue(1);
  const leftButtonScale = useSharedValue(1);
  const rightButtonScale = useSharedValue(1);
  
  // 수정: 카드 높이와 패딩 조정
  const headerTranslateY = useSharedValue(0);
  const headerOpacity = useSharedValue(1);
  const cardHeight = useSharedValue(0.6);
  const mainContentPaddingTop = useSharedValue(8); // ★ 상단 패딩 추가
  const mainContentPaddingBottom = useSharedValue(200);

  // ★ 서버에서 코디 데이터 불러오기 (오늘 → 어제 → 그제 순)
  const fetchOutfits = async () => {
    setIsLoading(true);
    try {
      const response = await API.coordinations.list();
      
      let rawList: any[] = [];
      if (Array.isArray(response.data)) {
        rawList = response.data;
      } else if (response.data && Array.isArray(response.data.results)) {
        rawList = response.data.results;
      } else if (response.data && Array.isArray(response.data.coordinations)) {
        rawList = response.data.coordinations;
      }

      if (rawList.length > 0) {
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let foundOutfits: any[] = [];
        let daysAgo = 0;
        
        // 오늘부터 시작해서 7일 전까지 하루씩 거슬러 올라가며 찾기
        while (foundOutfits.length === 0 && daysAgo < 7) {
          const targetDate = new Date(today);
          targetDate.setDate(targetDate.getDate() - daysAgo);
          
          const nextDate = new Date(targetDate);
          nextDate.setDate(nextDate.getDate() + 1);
          
          
          foundOutfits = rawList.filter((item: any) => {
            if (!item.created_at) return false;
            const createdDate = new Date(item.created_at);
            return createdDate >= targetDate && createdDate < nextDate;
          });
          
          if (foundOutfits.length > 0) {
            break;
          }
          
          daysAgo++;
        }
        
        if (foundOutfits.length > 0) {
          // 데이터 변환
          const mappedOutfits = foundOutfits.map((item: any) => {
            // items 배열에서 옷 정보 추출
            const clothingItems: OutfitItem[] = [];
            
            if (item.items && Array.isArray(item.items)) {
              item.items.forEach((clothesItem: any) => {
                const detail = clothesItem.clothes_detail;
                if (detail && detail.name) {
                  clothingItems.push({
                    name: detail.name,
                    color: detail.color || detail.main_color || detail.mainColor || '#CCCCCC'
                  });
                }
              });
            }

            return {
              id: item.id?.toString() || Math.random().toString(),
              title: item.name || item.outfit_title || '데일리 코디',
              imageUri: item.image_url || item.image || 'https://via.placeholder.com/400x800',
              occasion: item.occasion || 'DAILY',
              items: clothingItems.length > 0 ? clothingItems : [
                { name: '아이템 정보 없음', color: '#CCCCCC' }
              ],
              createdAt: new Date(item.created_at),
            };
          }).sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime()) // 최신순
            .slice(0, 3); // ★ 최신 3개만 선택
          
          setOutfits(mappedOutfits);
        } else {
          setOutfits([]);
        }
      } else {
        setOutfits([]);
      }
    } catch (error) {
      console.error('❌ 코디 불러오기 실패:', error);
      setOutfits([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 화면 진입 시 데이터 불러오기 (최초 1회만)
  useEffect(() => {
    fetchOutfits();
  }, []);

  // 다른 화면에서 돌아올 때 처리
  useFocusEffect(
    React.useCallback(() => {
      // 화면에 올 때마다 실행되는 코드
      // (데이터 새로고침은 제거 - 깜빡임 방지)
      
      return () => {
        // 화면을 떠날 때 확장 상태면 초기화
        if (isExpanded) {
          setIsExpanded(false);
          headerTranslateY.value = withTiming(0, { duration: 400 });
          headerOpacity.value = withTiming(1, { duration: 300 });
          cardHeight.value = withTiming(0.6, { duration: 400 });
          mainContentPaddingTop.value = withTiming(8, { duration: 400 }); // ★ paddingTop 초기화
          mainContentPaddingBottom.value = withTiming(220, { duration: 400 });
        }
      };
    }, [isExpanded])
  );

  // 확장 상태를 navigation params로 전달
  useEffect(() => {
    navigation.setParams({ isHomeExpanded: isExpanded } as any);
  }, [isExpanded, navigation]);

  // Current outfit
  const currentOutfit = outfits[selectedOutfitIndex];

  // Long press handler
  const handleLongPress = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);

    // 햅틱 피드백 (짧은 진동)
    Vibration.vibrate(50);

    if (newExpandedState) {
      // 확장 모드 - 위로도 확장
      headerTranslateY.value = withTiming(-100, { duration: 400 });
      headerOpacity.value = withTiming(0, { duration: 300 });
      cardHeight.value = withTiming(0.70, { duration: 400 });
      mainContentPaddingBottom.value = withTiming(140, { duration: 400 }); // ⭐ 180 → 140
    } else {
      // 일반 모드
      headerTranslateY.value = withTiming(0, { duration: 400 });
      headerOpacity.value = withTiming(1, { duration: 300 });
      cardHeight.value = withTiming(0.55, { duration: 400 });
      mainContentPaddingBottom.value = withTiming(220, { duration: 400 });
    }
  };

  // Event handlers
  const handleNavigateLeft = () => {
    if (outfits.length === 0) return;
    
    setLeftPressed(true);
    leftButtonScale.value = withSpring(0.92);
    
    setTimeout(() => {
      setLeftPressed(false);
      leftButtonScale.value = withSpring(1);
      setSelectedOutfitIndex((prev) => 
        prev > 0 ? prev - 1 : outfits.length - 1
      );
    }, 0);
  };

  const handleNavigateRight = () => {
    if (outfits.length === 0) return;
    
    setRightPressed(true);
    rightButtonScale.value = withSpring(0.92);
    
    setTimeout(() => {
      setRightPressed(false);
      rightButtonScale.value = withSpring(1);
      setSelectedOutfitIndex((prev) => 
        prev < outfits.length - 1 ? prev + 1 : 0
      );
    }, 0);
  };

  const handleDotPress = (index: number) => {
    setSelectedOutfitIndex(index);
  };

  // ★ EmptyCard 클릭 핸들러 - AddClothes(Recommend) 탭으로 이동
  const handleEmptyCardPress = () => {
    // @ts-ignore - navigation type issue
    navigation.navigate('AddClothes');
  };

  // Animated styles
  const animatedHeaderStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerTranslateY.value }],
    opacity: headerOpacity.value,
  }));

  const animatedMainContentStyle = useAnimatedStyle(() => ({
    paddingTop: mainContentPaddingTop.value, // ★ 상단 패딩 애니메이션
    paddingBottom: mainContentPaddingBottom.value,
  }));

  // 로딩 화면
  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 16, color: Colors.textSecondary }}>코디를 불러오는 중...</Text>
      </View>
    );
  }

  // ★ 코디가 없을 때 - EmptyCard 표시
  if (outfits.length === 0) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <Animated.View 
            style={[styles.header, animatedHeaderStyle]}
            entering={FadeInDown.duration(600).delay(100)}
          >
            <View style={styles.logoContainer}>
              <Text style={styles.orbitText}>ORBIT</Text>
              <Text style={styles.tagline}>Your Style Universe</Text>
            </View>
          </Animated.View>
          
          <Animated.View style={[styles.mainContent, animatedMainContentStyle]}>
            <EmptyCard onPress={handleEmptyCardPress} />
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Orbit 브랜드 헤더 */}
        <Animated.View 
          style={[styles.header, animatedHeaderStyle]}
          entering={FadeInDown.duration(600).delay(100)}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.orbitText}>ORBIT</Text>
            <Text style={styles.tagline}>Your Style Universe</Text>
          </View>
        </Animated.View>
        
        {/* Main Content */}
        <Animated.View style={[styles.mainContent, animatedMainContentStyle]}>
          {/* Outfit Card */}
          <OutfitCard
            outfit={currentOutfit}
            onNavigateLeft={handleNavigateLeft}
            onNavigateRight={handleNavigateRight}
            onLongPress={handleLongPress}
            leftPressed={leftPressed}
            rightPressed={rightPressed}
            cardScale={cardScale}
            leftButtonScale={leftButtonScale}
            rightButtonScale={rightButtonScale}
            cardHeight={cardHeight}
            isExpanded={isExpanded}
          />

          {/* 페이지 Dots  */}
          <View style={styles.dotsContainer}>
            {outfits.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleDotPress(index)}
                style={[
                  styles.dot,
                  index === selectedOutfitIndex && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
};

export default HomeScreen;