// src/screens/Closet/ClosetScreen.tsx
// My Closet - 서버 API 연동 버전
// ⭐ v2.6: 카테고리 필터링 기능 로컬 구현 (즉시 반응)

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from '@react-native-community/blur';
import Animated, {
  useSharedValue,
  withSpring,
  withTiming,
  FadeIn,
  FadeInDown,
  FadeInUp,
  withSequence,
  withDelay,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { Image } from 'expo-image';
import * as Network from 'expo-network';

import { Colors } from '../../constants/colors';
import { styles } from './ClosetScreen.styles';
import { ClothingGridItem } from './components/ClothingGridItem';
import { ClothingListItem } from './components/ClothingListItem';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { ClothingDetailModal } from './components/ClothingDetailModal';


// Redux actions & selectors
import {
  fetchClothes,
  selectClosetLoading,
  selectClosetError,
  selectAllClothes,
  deleteClothes,
  updateClothes,
} from '../../store/slices/closetSlice';

// Types
import { ClothesType, ClothingItem } from '../../types/clothes';

// 카테고리 인터페이스
interface Category {
  id: string | 'all';
  label: string;
  icon: string;
  count: number;
}

interface ClosetScreenProps {
  navigation: any;
}

const ClosetScreen: React.FC<ClosetScreenProps> = ({ navigation }) => {
  const dispatch = useDispatch();

  // Redux 상태
  const allClothes = useSelector(selectAllClothes);
  // const filteredClothes = useSelector(selectFilteredClothes); // 👈 제거: 로컬 필터링으로 대체
  const isLoading = useSelector(selectClosetLoading);
  const error = useSelector(selectClosetError);

  // 로컬 상태
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOriginalCached, setIsOriginalCached] = useState(false);
  const [selectedClothing, setSelectedClothing] = useState<ClothingItem | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  
  // 삭제 모달 상태
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string } | null>(null);

  // 애니메이션 값
  const cardScale = useSharedValue(1);
  const categoryOpacity = useSharedValue(0);
  const viewModeScale = useSharedValue(1);
  const fabScale = useSharedValue(1);

  // ⭐ [추가] 로컬 필터링 로직
  // selectedCategory가 변경될 때마다 목록을 새로 계산합니다.
  const filteredClothes = useMemo(() => {
    if (selectedCategory === 'all') {
      return allClothes;
    }
    return allClothes.filter(item => item.mainCategory === selectedCategory);
  }, [allClothes, selectedCategory]);

  // 초기 로딩
  useEffect(() => {
    loadClothes();
    categoryOpacity.value = withDelay(100, withTiming(1, { duration: 600 }));
  }, []);

  // 원본 이미지 Prefetch
  useEffect(() => {
    if (allClothes.length === 0 || isOriginalCached) return;

    const prefetchOriginalImages = async () => {
      try {
        const networkState = await Network.getNetworkStateAsync();
        const isWifi = networkState.type === Network.NetworkStateType.WIFI;
        
        const itemsToPrefetch = isWifi ? allClothes : allClothes.slice(0, 20);
        // console.log(`[Prefetch] ${itemsToPrefetch.length}개 원본 이미지 캐싱 시작...`);

        const originalUrls = itemsToPrefetch
          .filter(item => item.imageUri)
          .map(item => item.imageUri);

        await Image.prefetch(originalUrls, {
          cachePolicy: 'memory-disk',
        });

        setIsOriginalCached(true);
      } catch (error) {
        console.error('[Prefetch] Error:', error);
      }
    };

    const timer = setTimeout(prefetchOriginalImages, 1000);
    return () => clearTimeout(timer);
  }, [allClothes, isOriginalCached]);

  // 옷 목록 불러오기
  const loadClothes = useCallback(async () => {
    try {
      await dispatch(fetchClothes()).unwrap();
    } catch (error) {
      console.error('Failed to load clothes:', error);
      Alert.alert('오류', '옷 목록을 불러오는데 실패했습니다.');
    }
  }, [dispatch]);

  // Pull-to-Refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadClothes();
    setIsRefreshing(false);
  }, [loadClothes]);

  // 옷 정보 업데이트 핸들러
  const handleUpdateClothing = async (
    id: string,
    updates: { name?: string; subCategory?: string }
  ) => {
    try {
      const serverData: any = {};
      if (updates.name !== undefined) {
        serverData.name = updates.name;
      }
      if (updates.subCategory !== undefined) {
        serverData.sub_category = updates.subCategory;
      }
      
      const result = await dispatch(updateClothes({
        id: parseInt(id),
        data: serverData
      })).unwrap();
      
      if (selectedClothing?.id.toString() === id) {
        setSelectedClothing(result);
      }
    } catch (error: any) {
      console.error('❌ [Update Failed]:', error);
      throw error;
    }
  };

  // 카테고리 데이터 생성
  const categories: Category[] = [
    { 
      id: 'all', 
      label: '전체', 
      icon: 'apps-outline', 
      count: allClothes.length 
    },
    {
      id: 'TOP',
      label: '상의',
      icon: 'shirt-outline',
      count: allClothes.filter(item => item.mainCategory === 'TOP').length,
    },
    {
      id: 'BOTTOM',
      label: '하의',
      icon: 'man-outline',
      count: allClothes.filter(item => item.mainCategory === 'BOTTOM').length,
    },
    {
      id: 'OUTER',
      label: '아우터',
      icon: 'snow-outline',
      count: allClothes.filter(item => item.mainCategory === 'OUTER').length,
    },
  ];

  // ⭐ [수정] 카테고리 선택 핸들러 (로컬 상태만 변경)
  const handleCategorySelect = (categoryId: string | 'all') => {
    setSelectedCategory(categoryId);
    
    // 기존의 Redux dispatch 제거 (로컬 필터링 사용하므로 불필요)
    // if (categoryId === 'all') { dispatch(clearFilter()); } else { ... }

    // 클릭 애니메이션
    cardScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1)
    );
  };

  // 뷰모드 토글
  const toggleViewMode = () => {
    const newMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(newMode);
    viewModeScale.value = withSequence(
      withTiming(0.9, { duration: 100 }),
      withSpring(1, { damping: 10 })
    );
  };

  // FAB 애니메이션 스타일
  const animatedFabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  const handleFabPress = () => {
    navigation.navigate('AddClothing');
  };

  const handleItemPress = (itemId: number) => {
    const item = allClothes.find(clothing => clothing.id === itemId);
    if (item) {
      setSelectedClothing(item);
      setDetailModalVisible(true);
    }
  };

  const handleDeletePress = (itemId: number, itemName: string) => {
    setItemToDelete({ id: itemId, name: itemName });
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await dispatch(deleteClothes(itemToDelete.id)).unwrap();
      setDeleteModalVisible(false);
      setItemToDelete(null);
      Alert.alert('삭제 완료', `"${itemToDelete.name}"이(가) 삭제되었습니다.`, [{ text: '확인' }]);
    } catch (error: any) {
      setDeleteModalVisible(false);
      setItemToDelete(null);
      Alert.alert('삭제 실패', error || '옷을 삭제하는데 실패했습니다.', [{ text: '확인' }]);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  if (isLoading && allClothes.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ marginTop: 16, color: Colors.textSecondary }}>옷장 불러오는 중...</Text>
      </View>
    );
  }

  if (error && allClothes.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }]}>
        <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
        <Text style={{ marginTop: 16, color: Colors.textPrimary, fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
          옷장을 불러올 수 없습니다
        </Text>
        <Text style={{ marginTop: 8, color: Colors.textSecondary, textAlign: 'center' }}>{error}</Text>
        <TouchableOpacity
          style={{
            marginTop: 24,
            paddingHorizontal: 24,
            paddingVertical: 12,
            backgroundColor: Colors.primary,
            borderRadius: 12,
          }}
          onPress={loadClothes}
        >
          <Text style={{ color: Colors.textOnPrimary, fontWeight: '600' }}>다시 시도</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* 헤더 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>My Closet</Text>
            <Text style={styles.headerSubtitle}>
              {/* 로컬 필터링된 개수 표시 */}
              {filteredClothes.length}개의 아이템
            </Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.viewModeButton}
              onPress={toggleViewMode}
              activeOpacity={0.7}
            >
              <Ionicons
                name={viewMode === 'grid' ? 'list' : 'grid'}
                size={20}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 카테고리 필터 */}
        <Animated.View
          style={[styles.categoryContainer]}
          entering={FadeInDown.delay(100).springify()}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
          >
            {categories.map((category, index) => (
              <Animated.View
                key={category.id}
                entering={FadeInUp.delay(150 + index * 50).springify()}
              >
                <TouchableOpacity
                  style={[
                    styles.categoryPill,
                    selectedCategory === category.id && styles.categoryPillActive,
                  ]}
                  onPress={() => handleCategorySelect(category.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={18}
                    color={
                      selectedCategory === category.id
                        ? Colors.primary
                        : Colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.categoryLabel,
                      selectedCategory === category.id && styles.categoryLabelActive,
                    ]}
                  >
                    {category.label}
                  </Text>
                  <View
                    style={[
                      styles.categoryCount,
                      selectedCategory === category.id && styles.categoryCountActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryCountText,
                        selectedCategory === category.id && styles.categoryCountTextActive,
                      ]}
                    >
                      {category.count}
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* 옷 목록 */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
            />
          }
        >
          {filteredClothes.length === 0 ? (
            <Animated.View
              entering={FadeIn.duration(400)}
              style={styles.emptyState}
            >
              <Ionicons
                name="shirt-outline"
                size={80}
                color={Colors.textTertiary}
              />
              <Text style={styles.emptyTitle}>
                {selectedCategory === 'all'
                  ? '등록된 옷이 없어요'
                  : `${categories.find(c => c.id === selectedCategory)?.label} 카테고리가 비어있어요`}
              </Text>
              <Text style={styles.emptySubtitle}>
                우측 하단 버튼으로 옷을 추가해보세요
              </Text>
            </Animated.View>
          ) : (
            <View style={{ paddingHorizontal: 16 }}>
              {viewMode === 'grid' ? (
                <View style={styles.gridContainer}>
                  {filteredClothes.map((item, index) => (
                    <ClothingGridItem
                      key={item.id}
                      clothing={{
                        id: item.id.toString(),
                        name: item.name,
                        category: item.mainCategory,
                        imageUri: item.imageUri || '',
                        color: item.color,
                        favorite: false,
                        wearCount: 0,
                      }}
                      index={index}
                      categories={categories}
                      onPress={() => handleItemPress(item.id)}
                      onDelete={() => handleDeletePress(item.id, item.name)}
                      showThumbnail={!isOriginalCached}
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.listContainer}>
                  {filteredClothes.map((item, index) => (
                    <ClothingListItem
                      key={item.id}
                      clothing={{
                        id: item.id.toString(),
                        name: item.name,
                        category: item.mainCategory,
                        imageUri: item.imageUri || '',
                        color: item.color,
                        favorite: false,
                        wearCount: 0,
                      }}
                      index={index}
                      categories={categories}
                      onPress={() => handleItemPress(item.id)}
                      onDelete={() => handleDeletePress(item.id, item.name)}
                      showThumbnail={!isOriginalCached}
                    />
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* FAB 버튼 */}
        <Animated.View
          style={[styles.fab, animatedFabStyle]}
          entering={FadeInUp.duration(600).delay(400)}
        >
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={handleFabPress}
            onPressIn={() => {
              fabScale.value = withSpring(0.92, {
                damping: 15,
                stiffness: 150,
              });
            }}
            onPressOut={() => {
              fabScale.value = withSpring(1, { damping: 15, stiffness: 150 });
            }}
          >
            <View style={styles.fabGlassBar}>
              <BlurView
                style={StyleSheet.absoluteFill}
                blurType="light"
                blurAmount={3}
                reducedTransparencyFallbackColor="transparent"
              />

              <View style={styles.fabGlassLayer} />
              <View style={styles.fabTopLine} />

              <View style={styles.fabContent}>
                <Ionicons name="add" size={30} color={Colors.plusIcon} />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>

      {/* 삭제 확인 모달 */}
      <DeleteConfirmModal
        visible={deleteModalVisible}
        clothingName={itemToDelete?.name || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
      
      {/* ClothingDetailModal */}
      <ClothingDetailModal
        visible={detailModalVisible}
        clothing={selectedClothing}
        onUpdate={handleUpdateClothing}
        onClose={() => {
          setDetailModalVisible(false);
          setSelectedClothing(null);
        }}
      />

    </View>
  );
};

export default ClosetScreen;