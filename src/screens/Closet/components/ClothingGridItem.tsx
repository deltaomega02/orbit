// src/screens/Closet/components/ClothingGridItem.tsx
// 이미지 없는 경우 처리 추가 + expo-image 캐싱

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Image } from 'expo-image'; //  expo-image로 교체 (자동 캐싱)
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Colors } from '../../../constants/colors';
import { styles } from '../ClosetScreen.styles';
import { normalizeColor } from '../../../utils/colorUtils';

interface ClothingItem {
  id: string;
  name: string;
  category: string;
  imageUri: string;
  color: string;
  favorite: boolean;
  wearCount: number;
}

interface ClothingGridItemProps {
  clothing: ClothingItem;
  index: number;
  categories?: any; // 현재 사용하지 않지만 prop으로 전달됨
  onPress: () => void;
  onDelete?: () => void; //  삭제 핸들러 추가
  showThumbnail?: boolean; //  썸네일 표시 여부 (기본값: true)
}

export const ClothingGridItem: React.FC<ClothingGridItemProps> = ({
  clothing,
  index,
  onPress,
  onDelete, //  onDelete prop 추가
  showThumbnail = true, //  기본값: 썸네일 사용
}) => {
  const row = Math.floor(index / 2);
  const col = index % 2;
  const delay = Math.min(row * 100 + col * 50, 400);

  // 이미지가 있는지 확인
  const hasImage = clothing.imageUri && clothing.imageUri.length > 0 && clothing.imageUri !== '(no image)';
  
  //  썸네일/원본 이미지 URL 결정
  const imageUrl = hasImage 
    ? (showThumbnail ? `${clothing.imageUri}?size=200` : clothing.imageUri)
    : null;

  const displayColor = normalizeColor(clothing.color);

  return (
    <Animated.View
      style={[styles.itemCard]}
      entering={FadeInUp.duration(500).delay(delay).springify()}
    >
      <Pressable
        style={({ pressed }) => [
          styles.itemPressable,
          pressed && { transform: [{ scale: 0.98 }] },
        ]}
        onPress={onPress}
      >
        <View style={styles.imageContainer}>
          {imageUrl ? (
            // 이미지가 있는 경우 (expo-image 캐싱 적용)
            <>
              <Image
                source={{ uri: imageUrl }}
                style={styles.itemImage}
                contentFit="cover"
                transition={200} // 부드러운 전환 효과
                cachePolicy="memory-disk" // 메모리 + 디스크 캐싱
                priority="normal"
              />

              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.04)']}
                style={styles.imageOverlay}
              />
            </>
          ) : (
            // 이미지가 없는 경우 플레이스홀더
            <View style={styles.noImagePlaceholder}>
              <LinearGradient
                colors={['rgba(139, 125, 255, 0.05)', 'rgba(255, 107, 157, 0.05)']}
                style={styles.placeholderGradient}
              >
                <Ionicons
                  name="shirt-outline"
                  size={60}
                  color={Colors.textSecondary}
                  style={{ opacity: 0.3 }}
                />
                <Text style={styles.noImageText}>이미지 없음</Text>
              </LinearGradient>
            </View>
          )}

          {/* 삭제 버튼 - 우측 상단으로 이동 + 글래스모피즘 적용 */}
          {onDelete && (
            <Pressable
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                zIndex: 10,
              }}
              onPress={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <View style={{
                width: 30,
                height: 30,
                borderRadius: 15,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
                elevation: 2,
              }}>
                <BlurView
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                  }}
                  blurType="light"
                  blurAmount={10}
                  reducedTransparencyFallbackColor="rgba(255, 255, 255, 0.92)"
                />
                <View style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  <Ionicons name="trash-outline" size={16} color={Colors.error} />
                </View>
              </View>
            </Pressable>
          )}

          {clothing.favorite && (
            <View style={styles.favoriteIndicator}>
              <Ionicons name="heart" size={16} color={Colors.primary} />
            </View>
          )}

          {clothing.wearCount > 30 && (
            <View style={styles.frequentBadge}>
              <View style={styles.frequentDot} />
            </View>
          )}
        </View>

        <View style={styles.itemInfo}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[styles.itemName, { flex: 1 }]} numberOfLines={1}>
              {clothing.name}
            </Text>
            {/* 색상 인디케이터 - 이름과 같은 줄 우측 끝 */}
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 10,
                backgroundColor: displayColor,
                borderWidth: 2,
                borderColor: '#FFFFFF',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.15,
                shadowRadius: 3,
                elevation: 3,
                marginLeft: 8,
              }}
            />
          </View>
          <View style={styles.itemMeta}>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
};