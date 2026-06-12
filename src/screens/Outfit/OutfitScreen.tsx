// src/screens/Outfit/OutfitScreen.tsx
// 코디 히스토리 - 메인 컴포넌트
// ⭐ 수정: items 배열 구조에 맞게 옷 정보 추출
// ⭐ expo-image로 캐시 적용
// ⭐ v5.3: 하트 버튼 즐겨찾기 API 연동

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Pressable,
    Dimensions,
    PanResponder,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native'; // ⭐ 추가
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    interpolate,
    withSequence,
} from 'react-native-reanimated';
import { Image } from 'expo-image';

import { Colors } from '../../constants/colors';
import { styles } from './OutfitScreen.styles';
import { OutfitMainDisplay } from './components/OutfitMainDisplay';
import { OutfitGridModal } from './components/OutfitGridModal';
import { API } from '../../api/client';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const THUMBNAIL_SIZE = 56;
const THUMBNAIL_SPACING = 8;
const MAIN_IMAGE_HEIGHT = SCREEN_HEIGHT * 0.58;

// 타입 정의
interface OutfitRecord {
    id: string;
    date: string;
    month: string;
    day: string;
    imageUri?: string | null;
    occasion: string;
    weather?: string;
    items: string[];
    rating?: number;
    aiScore: number;
    isLiked: boolean;
}

const OutfitScreen: React.FC = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isGridVisible, setIsGridVisible] = useState(false);
    const [isThumbnailVisible, setIsThumbnailVisible] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const thumbnailScrollRef = useRef<ScrollView>(null);
    const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // 애니메이션 값들
    const mainImageScale = useSharedValue(1);
    const mainImageHeight = useSharedValue(1);
    const progressPosition = useSharedValue(0);
    const gridOpacity = useSharedValue(0);
    const backdropOpacity = useSharedValue(0);
    const thumbnailScale = useSharedValue(1);
    const thumbnailTranslateY = useSharedValue(0);

    // 서버 데이터 상태 관리
    const [outfitHistory, setOutfitHistory] = useState<OutfitRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // ⭐ [추가] 즐겨찾기 토글 중 상태 (중복 클릭 방지)
    const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

    // ⭐ [수정] 화면에 포커스될 때마다 서버에서 코디 기록 새로 불러오기
    useFocusEffect(
        useCallback(() => {
            fetchOutfitHistory();
        }, [])
    );

    const fetchOutfitHistory = async () => {
        setIsLoading(true);
        try {
            console.log('📄 코디 히스토리 불러오기 시작');
            const response = await API.coordinations.list();
            
            let rawList: any[] = [];
            if (Array.isArray(response.data)) {
                rawList = response.data;
            } else if (response.data && Array.isArray(response.data.results)) {
                rawList = response.data.results;
            } else if (response.data && Array.isArray(response.data.coordinations)) {
                rawList = response.data.coordinations;
            }

            console.log(`📊 받아온 코디 개수: ${rawList.length}개`);
            
            if (rawList.length > 0) {
                // 서버 데이터를 OutfitRecord 형식으로 변환
                const mappedHistory: OutfitRecord[] = rawList.map((item: any, index: number) => {
                    const dateObj = new Date(item.created_at);
                    const year = dateObj.getFullYear();
                    const monthNum = dateObj.getMonth() + 1;
                    const dayNum = dateObj.getDate();

                    // items 배열에서 옷 이름 추출
                    const clothingItems: string[] = [];
                    
                    if (item.items && Array.isArray(item.items)) {
                        item.items.forEach((clothesItem: any) => {
                            const detail = clothesItem.clothes_detail;
                            if (detail && detail.name) {
                                clothingItems.push(detail.name);
                            }
                        });
                    }

                    return {
                        id: item.id?.toString() || Math.random().toString(),
                        date: `${year}.${monthNum.toString().padStart(2, '0')}.${dayNum.toString().padStart(2, '0')}`,
                        month: dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
                        day: dayNum.toString(),
                        // 서버 응답의 이미지 URL 필드
                        imageUri: item.image_url || item.image || null, 
                        occasion: item.name || item.outfit_title || '데일리 코디',
                        weather: '', // 서버에 weather 필드가 있다면 사용
                        items: clothingItems.length > 0 ? clothingItems : ['아이템 정보 없음'],
                        rating: item.rating || 0,
                        aiScore: item.score || 85,
                        isLiked: item.is_favorite || false,
                    };
                });

                // 최신순 정렬
                mappedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setOutfitHistory(mappedHistory);
                console.log('✅ 코디 히스토리 로드 완료');
            }
        } catch (error) {
            console.error('❌ 코디 히스토리 불러오기 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // ⭐ [수정] 좋아요 상태 토글 함수 - 서버 API 호출
    const toggleLikeStatus = async (outfitId: string, isCurrentlyLiked: boolean) => {
        // 이미 토글 중이면 무시 (중복 클릭 방지)
        if (isTogglingFavorite) {
            return;
        }

        setIsTogglingFavorite(true);

        // Optimistic UI: 먼저 로컬 상태 업데이트
        const previousState = isCurrentlyLiked;
        setOutfitHistory(prevHistory => 
            prevHistory.map(outfit => 
                outfit.id === outfitId ? { ...outfit, isLiked: !isCurrentlyLiked } : outfit
            )
        );

        try {
            console.log('💖 즐겨찾기 토글 API 호출:', outfitId);
            const response = await API.coordinations.toggleFavorite(parseInt(outfitId));
            
            // 서버 응답으로 상태 확정
            if (response.data.is_favorite !== undefined) {
                setOutfitHistory(prevHistory => 
                    prevHistory.map(outfit => 
                        outfit.id === outfitId 
                            ? { ...outfit, isLiked: response.data.is_favorite } 
                            : outfit
                    )
                );
                console.log('✅ 즐겨찾기 상태 서버 저장 완료:', response.data.is_favorite);
            }
        } catch (error) {
            // 에러 시 이전 상태로 롤백
            console.error('❌ 즐겨찾기 토글 실패:', error);
            setOutfitHistory(prevHistory => 
                prevHistory.map(outfit => 
                    outfit.id === outfitId ? { ...outfit, isLiked: previousState } : outfit
                )
            );
        } finally {
            setIsTogglingFavorite(false);
        }
    };

    // Pull-to-Refresh 핸들러
    const onRefresh = async () => {
        setRefreshing(true);
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
                const mappedHistory: OutfitRecord[] = rawList.map((item: any) => {
                    const dateObj = new Date(item.created_at);
                    const year = dateObj.getFullYear();
                    const monthNum = dateObj.getMonth() + 1;
                    const dayNum = dateObj.getDate();

                    // items 배열에서 옷 이름 추출
                    const clothingItems: string[] = [];
                    
                    if (item.items && Array.isArray(item.items)) {
                        item.items.forEach((clothesItem: any) => {
                            const detail = clothesItem.clothes_detail;
                            if (detail && detail.name) {
                                clothingItems.push(detail.name);
                            }
                        });
                    }

                    return {
                        id: item.id?.toString() || Math.random().toString(),
                        date: `${year}.${monthNum.toString().padStart(2, '0')}.${dayNum.toString().padStart(2, '0')}`,
                        month: dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
                        day: dayNum.toString(),
                        imageUri: item.image_url || item.image || null, 
                        occasion: item.name || item.outfit_title || '데일리 코디',
                        weather: '',
                        items: clothingItems.length > 0 ? clothingItems : ['아이템 정보 없음'],
                        rating: item.rating || 0,
                        aiScore: item.score || 85,
                        isLiked: item.is_favorite || false,
                    };
                });

                mappedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setOutfitHistory(mappedHistory);
            }
        } catch (error) {
            console.error('❌ 새로고침 실패:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const currentOutfit = outfitHistory[currentIndex];

    // Progress Position 업데이트
    useEffect(() => {
        if (outfitHistory.length === 0) return;
        
        const totalWidth = SCREEN_WIDTH - 40;
        const progress = outfitHistory.length > 1 
            ? currentIndex / (outfitHistory.length - 1) 
            : 0;
        const newPosition = progress * totalWidth;
        
        progressPosition.value = withTiming(newPosition, { duration: 200 });
        
        if (isThumbnailVisible && thumbnailScrollRef.current) {
            const thumbnailWidth = THUMBNAIL_SIZE + THUMBNAIL_SPACING;
            const scrollX = currentIndex * thumbnailWidth - (SCREEN_WIDTH / 2) + (THUMBNAIL_SIZE / 2);
            
            setTimeout(() => {
                thumbnailScrollRef.current?.scrollTo({
                    x: Math.max(0, scrollX),
                    animated: true,
                });
            }, 50);
        }
    }, [currentIndex, outfitHistory.length, isThumbnailVisible]);

    // 썸네일 표시/숨김
    const showThumbnails = useCallback(() => {
        if (isThumbnailVisible) return;
        
        setIsThumbnailVisible(true);
        thumbnailScale.value = withSequence(
            withTiming(1.05, { duration: 100 }),
            withSpring(1, { damping: 8 })
        );
        thumbnailTranslateY.value = withSpring(-66, { damping: 12 });
        mainImageHeight.value = withTiming(0.85, { duration: 300 });
    }, [isThumbnailVisible]);

    const hideThumbnails = useCallback(() => {
        if (!isThumbnailVisible) return;
        
        thumbnailTranslateY.value = withTiming(0, { duration: 300 });
        mainImageHeight.value = withTiming(1, { duration: 300 });
        
        setTimeout(() => {
            setIsThumbnailVisible(false);
        }, 300);
    }, [isThumbnailVisible]);

    const selectThumbnail = (index: number) => {
        setCurrentIndex(index);
        hideThumbnails();
    };

    // 네비게이션
    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const goToNext = () => {
        if (currentIndex < outfitHistory.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const skipBackward = () => {
        setCurrentIndex(Math.max(0, currentIndex - 5));
    };

    const skipForward = () => {
        setCurrentIndex(Math.min(outfitHistory.length - 1, currentIndex + 5));
    };

    // 그리드 모달
    const openGrid = () => {
        setIsGridVisible(true);
        backdropOpacity.value = withTiming(1, { duration: 300 });
        gridOpacity.value = withTiming(1, { duration: 300 });
    };

    const closeGrid = () => {
        backdropOpacity.value = withTiming(0, { duration: 200 });
        gridOpacity.value = withTiming(0, { duration: 200 });
        
        setTimeout(() => {
            setIsGridVisible(false);
        }, 200);
    };

    const selectFromGrid = (index: number) => {
        setCurrentIndex(index);
        closeGrid();
    };


    // 프로그레스바 터치/드래그 핸들러
    const panResponder = useMemo(
        () =>
          PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onMoveShouldSetPanResponder: () => true,
          
          onPanResponderGrant: (evt) => {
            setIsDragging(false);
            
            longPressTimerRef.current = setTimeout(() => {
              if (!isDragging) {
                showThumbnails();
              }
            }, 200);
            
            const locationX = evt.nativeEvent.locationX;
            const totalWidth = SCREEN_WIDTH - 40;
            const progress = locationX / totalWidth;
            const rawIndex = progress * (outfitHistory.length - 1);
            const newIndex = Math.round(rawIndex);
            
            setCurrentIndex(Math.max(0, Math.min(newIndex, outfitHistory.length - 1)));
          },
          
          onPanResponderMove: (evt, gestureState) => {
            if (!isDragging && (Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5)) {
              setIsDragging(true);
              
              if (longPressTimerRef.current && !isThumbnailVisible) {
                clearTimeout(longPressTimerRef.current);
                longPressTimerRef.current = null;
              }
              
              if (!isThumbnailVisible) {
                return;
              }
            }
            
            if (isDragging && isThumbnailVisible) {
              const locationX = evt.nativeEvent.locationX;
              const totalWidth = SCREEN_WIDTH - 40;
              const progress = Math.max(0, Math.min(locationX / totalWidth, 1));
              const rawIndex = progress * (outfitHistory.length - 1);
              const newIndex = Math.round(rawIndex);
              
              setCurrentIndex(Math.max(0, Math.min(newIndex, outfitHistory.length - 1)));
            }
          },
          
          onPanResponderRelease: () => {
            if (longPressTimerRef.current) {
              clearTimeout(longPressTimerRef.current);
              longPressTimerRef.current = null;
            }
            
            if (isThumbnailVisible && isDragging) {
              hideThumbnails();
            }
            
            setIsDragging(false);
          },
          
          onPanResponderTerminate: () => {
            if (longPressTimerRef.current) {
              clearTimeout(longPressTimerRef.current);
              longPressTimerRef.current = null;
            }
            setIsDragging(false);
          },
        }),
        [isDragging, isThumbnailVisible, outfitHistory.length]
    );


    // 애니메이션 스타일
    const animatedMainImageStyle = useAnimatedStyle(() => {
        const currentHeight = MAIN_IMAGE_HEIGHT * mainImageHeight.value;
        
        return {
            height: currentHeight,
            transform: [
                { scale: mainImageScale.value },
            ],
        };
    });

    const animatedProgressStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: progressPosition.value }],
    }));

    const animatedProgressFilledStyle = useAnimatedStyle(() => ({
        width: progressPosition.value + 5,
    }));

    const animatedThumbnailStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: thumbnailScale.value },
            { translateY: thumbnailTranslateY.value },
        ],
        opacity: interpolate(thumbnailTranslateY.value, [0, -66], [0, 1]),
    }));

    const animatedBackdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
    }));

    const animatedGridStyle = useAnimatedStyle(() => ({
        opacity: gridOpacity.value,
        transform: [
            {
                translateY: interpolate(gridOpacity.value, [0, 1], [50, 0]),
            },
        ],
    }));

    // 로딩 화면
    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={{ marginTop: 16, color: Colors.textSecondary }}>코디 기록을 불러오는 중...</Text>
            </View>
        );
    }

    // 데이터가 없을 때
    if (outfitHistory.length === 0) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Ionicons name="shirt-outline" size={64} color={Colors.textTertiary} />
                <Text style={{ marginTop: 16, color: Colors.textSecondary, fontSize: 16 }}>
                    아직 저장된 코디가 없습니다.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Daily Look</Text>
                </View>

                {/* Main Content Area - 스크롤 가능 */}
                <ScrollView 
                    style={styles.contentArea}
                    contentContainerStyle={{ flexGrow: 1 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Colors.primary]}
                            tintColor={Colors.primary}
                            title="새로고침..."
                            titleColor={Colors.textSecondary}
                        />
                    }
                >
                    {/* Main Image Display */}
                    <OutfitMainDisplay
                        outfit={currentOutfit}
                        animatedStyle={animatedMainImageStyle}
                        // ⭐ [연결] 자식 컴포넌트의 클릭 이벤트를 부모의 상태 변경 함수에 연결
                        onToggleLike={toggleLikeStatus} 
                    />
                </ScrollView>

                {/* Fixed Bottom Controls Area */}
                <View style={styles.fixedBottomArea}>
                    {/* Progress Bar - PanResponder로 탭/드래그 가능 */}
                    <View 
                        style={styles.progressContainer}
                        onStartShouldSetResponder={() => true}
                        {...panResponder.panHandlers}
                    >
                        {/* Thumbnail Strip */}
                        {isThumbnailVisible && (
                            <Pressable 
                                onLongPress={openGrid}
                                style={styles.thumbnailContainer}
                                pointerEvents="box-none"
                            >
                                <Animated.View style={animatedThumbnailStyle}>
                                    <ScrollView
                                        ref={thumbnailScrollRef}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        contentContainerStyle={styles.thumbnailScroll}
                                    >
                                        {outfitHistory.map((item, index) => (
                                            <TouchableOpacity
                                                key={item.id}
                                                onPress={() => selectThumbnail(index)}
                                                style={[
                                                    styles.thumbnail,
                                                    index === currentIndex && styles.thumbnailActive,
                                                ]}
                                            >
                                                {item.imageUri ? (
                                                    <Image
                                                        source={{ uri: item.imageUri }}
                                                        style={styles.thumbnailImage}
                                                        contentFit="cover"
                                                        cachePolicy="memory-disk"
                                                    />
                                                ) : (
                                                    <View style={{ flex: 1, backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' }}>
                                                        <Ionicons name="shirt-outline" size={20} color="#9CA3AF" />
                                                    </View>
                                                )}
                                                {index === currentIndex && (
                                                    <View style={styles.thumbnailActiveBorder} />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </Animated.View>
                            </Pressable>
                        )}

                        <View style={styles.progressTrack} pointerEvents="box-none">
                            <Animated.View
                                style={[styles.progressFilled, animatedProgressFilledStyle]}
                                pointerEvents="none"
                            />
                            
                            <Animated.View
                                style={[styles.progressIndicator, animatedProgressStyle]}
                                pointerEvents="none"
                            >
                                <View style={styles.progressDot} />
                            </Animated.View>
                        </View>
                    </View>

                    {/* Playback Controls */}
                    <View style={styles.controls}>
                        <TouchableOpacity onPress={skipBackward} style={styles.skipButton}>
                            <Ionicons name="play-skip-back" size={20} color={Colors.textPrimary} />
                            <Ionicons name="play-skip-back" size={20} color={Colors.textPrimary} style={{ marginLeft: -8 }} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={goToPrevious} style={styles.controlButton}>
                            <Ionicons name="chevron-back" size={28} color={Colors.textPrimary} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.gridButton} onPress={openGrid}>
                            <Ionicons name="grid" size={24} color={Colors.textPrimary} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={goToNext} style={styles.controlButton}>
                            <Ionicons name="chevron-forward" size={28} color={Colors.textPrimary} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={skipForward} style={styles.skipButton}>
                            <Ionicons name="play-skip-forward" size={20} color={Colors.textPrimary} />
                            <Ionicons name="play-skip-forward" size={20} color={Colors.textPrimary} style={{ marginLeft: -8 }} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Grid Modal */}
                <OutfitGridModal
                    visible={isGridVisible}
                    outfits={outfitHistory}
                    currentIndex={currentIndex}
                    onClose={closeGrid}
                    onSelectOutfit={selectFromGrid}
                    backdropStyle={animatedBackdropStyle}
                    gridStyle={animatedGridStyle}
                />
            </SafeAreaView>
        </View>
    );
};

export default OutfitScreen;