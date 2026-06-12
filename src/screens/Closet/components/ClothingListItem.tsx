// src/screens/Closet/components/ClothingListItem.tsx
// ⭐ expo-image 캐싱 적용 및 color 표시 개선

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image'; 
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors } from '../../../constants/colors';
import { styles } from '../ClosetScreen.styles';
import { normalizeColor } from '../../../utils/colorUtils';

interface Category {
  id: string;
  label: string;
}

interface ClothingItem {
  id: string;
  name: string;
  category?: string;
  type?: string;
  imageUri: string;
  color: string;
}

interface ClothingListItemProps {
  clothing: ClothingItem;
  index: number;
  categories?: Category[];
  onPress: () => void;
  onDelete?: () => void;
  showThumbnail?: boolean;
}

export const ClothingListItem: React.FC<ClothingListItemProps> = ({
  clothing,
  index,
  categories = [],
  onPress,
  onDelete,
  showThumbnail = true,
}) => {
  // 썸네일/원본 이미지 URL 결정
  const imageUrl = showThumbnail 
    ? `${clothing.imageUri}?size=200` 
    : clothing.imageUri;

  // 카테고리 라벨 가져오기
  const getCategoryLabel = () => {
    if (categories && categories.length > 0) {
      const category = categories.find(cat => 
        cat.id === clothing.category || cat.id === clothing.type
      );
      return category?.label || clothing.category || clothing.type || '';
    }
    return clothing.category || clothing.type || '';
  };

  const displayColor = normalizeColor(clothing.color);

  return (
    <Animated.View
      style={styles.listItemCard}
      entering={FadeInUp.duration(400).delay(Math.min(index * 50, 300))}
    >
      <Pressable
        style={({ pressed }) => [
          styles.listItemPressable,
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
        onPress={onPress}
      >
        {/* 이미지 컨테이너 */}
        <View style={localStyles.imageWrapper}>
          <Image
            source={{ uri: imageUrl }}
            style={styles.listItemImage}
            contentFit="cover"
            transition={200}
            cachePolicy="memory-disk"
            priority="normal"
          />
        </View>

        <View style={styles.listItemInfo}>
          <View style={styles.listItemHeader}>
            <Text style={styles.listItemName} numberOfLines={1}>
              {clothing.name}
            </Text>
          </View>

          <View style={[styles.listItemMeta, { alignItems: 'center', justifyContent: 'flex-start', gap: 6 }]}>
            {getCategoryLabel() && (
              <View style={styles.listItemCategory}>
                <Text style={styles.listCategoryText}>
                  {getCategoryLabel()}
                </Text>
              </View>
            )}
            {/* 색상 인디케이터 - 카테고리 태그 박스 바로 옆 */}
            <View
              style={{
                width: 13,
                height: 13,
                borderRadius: 7,
                backgroundColor: displayColor,
                borderWidth: 1.5,
                borderColor: '#FFFFFF',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.15,
                shadowRadius: 2,
                elevation: 2,
              }}
            />
          </View>
        </View>

        {/* 삭제 버튼 - 배경 투명 */}
        {onDelete && (
          <Pressable
            style={[styles.listDeleteButton, { backgroundColor: 'transparent' }]}
            onPress={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
};

// 로컬 스타일
const localStyles = StyleSheet.create({
  imageWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
  },
});