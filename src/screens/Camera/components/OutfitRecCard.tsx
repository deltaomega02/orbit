// src/screens/Camera/components/OutfitRecCard.tsx
// 카메라 화면에서 표시되는 AI 추천 코디 카드

import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from '@react-native-community/blur';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  FadeInDown, 
  useAnimatedStyle, 
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';

import { Colors } from '../../../constants/colors';
import { Spacing, Sizes } from '../../../constants/dimensions';

interface OutfitItem {
  name: string;
  color: string;
}

interface OutfitRecommendation {
  id: string;
  title: string;
  imageUri: string;
  matchScore: number;
  items: OutfitItem[];
}

interface OutfitRecCardProps {
  outfit: OutfitRecommendation;
  onPress?: () => void;
}

export const OutfitRecCard: React.FC<OutfitRecCardProps> = ({
  outfit,
  onPress,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardHeight = useSharedValue(200);

  const handleArrowPress = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    cardHeight.value = withTiming(newExpandedState ? 320 : 200, {
      duration: 400,
    });
  };

  const animatedCardStyle = useAnimatedStyle(() => ({
    height: cardHeight.value,
  }));

  return (
    <Animated.View 
      entering={FadeInDown.duration(400).delay(200)}
      style={styles.container}
    >
      <Pressable onPress={onPress}>
        <Animated.View style={[styles.card, animatedCardStyle]}>
        {/* 배경 이미지 */}
        <Image 
          source={{ uri: outfit.imageUri }} 
          style={styles.cardImage}
          resizeMode="cover"
        />
        
        {/* 그라디언트 오버레이 */}
        <LinearGradient
          colors={[
            'transparent',
            'rgba(0,0,0,0.3)',
            'rgba(0,0,0,0.7)',
          ]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />

        {/* 매치 스코어 배지 */}
        <View style={styles.scoreBadge}>
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={10}
            reducedTransparencyFallbackColor="transparent"
          />
          <View style={styles.scoreBadgeContent}>
            <Ionicons name="sparkles" size={14} color={Colors.primary} />
            <Text style={styles.scoreText}>{outfit.matchScore}% Match</Text>
          </View>
        </View>

        {/* 하단 정보 */}
        <View style={styles.infoContainer}>
          <Text style={styles.title}>{outfit.title}</Text>
          
          {/* 아이템 리스트 */}
          <View style={styles.itemsList}>
            {outfit.items.slice(0, 3).map((item, index) => (
              <View key={index} style={styles.itemRow}>
                <View 
                  style={[
                    styles.colorDot, 
                    { backgroundColor: item.color }
                  ]} 
                />
                <Text style={styles.itemName} numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
            ))}
            {outfit.items.length > 3 && (
              <Text style={styles.moreItems}>
                +{outfit.items.length - 3} more
              </Text>
            )}
          </View>
        </View>

        {/* 좌측 상단 확장 버튼 */}
        <TouchableOpacity 
          style={styles.arrowContainer}
          onPress={handleArrowPress}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20} 
            color={Colors.textPrimary} 
          />
        </TouchableOpacity>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.lg,
  },
  card: {
    borderRadius: Sizes.borderRadiusXLarge,
    overflow: 'hidden',
    backgroundColor: Colors.cardBackground,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 5,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  scoreBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  scoreBadgeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  itemsList: {
    gap: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  itemName: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  moreItems: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 2,
  },
  arrowContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});