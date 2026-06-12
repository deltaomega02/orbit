// src/screens/Home/components/OutfitCard.tsx
// ★ OutfitMainDisplay 스타일 완전 적용 (좌우 네비게이션 버튼 유지, 하트 제외)

import React from 'react';
import { View, Text, TouchableOpacity, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  SharedValue,
} from 'react-native-reanimated';
import { Image } from 'expo-image';

import { styles as homeStyles } from '../HomeScreen.styles';
import { Colors } from '../../../constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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

interface OutfitCardProps {
  outfit: Outfit;
  onNavigateLeft: () => void;
  onNavigateRight: () => void;
  onLongPress: () => void;
  leftPressed: boolean;
  rightPressed: boolean;
  cardScale: SharedValue<number>;
  leftButtonScale: SharedValue<number>;
  rightButtonScale: SharedValue<number>;
  cardHeight: SharedValue<number>;
  isExpanded: boolean;
}

export const OutfitCard: React.FC<OutfitCardProps> = ({
  outfit,
  onNavigateLeft,
  onNavigateRight,
  onLongPress,
  leftPressed,
  rightPressed,
  cardScale,
  leftButtonScale,
  rightButtonScale,
  cardHeight,
  isExpanded,
}) => {
  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    height: cardHeight.value * SCREEN_HEIGHT,
  }));

  const animatedLeftButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: leftButtonScale.value }],
  }));

  const animatedRightButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rightButtonScale.value }],
  }));

  const hasImage = outfit.imageUri && outfit.imageUri !== '';

  return (
    <Pressable
      onLongPress={onLongPress}
      delayLongPress={500}
    >
      <Animated.View 
        style={[homeStyles.cardContainer, animatedCardStyle]}
        entering={FadeInUp.duration(600).delay(200)}
      >
        <View style={homeStyles.card}>
          {/* 이미지 또는 Placeholder */}
          {hasImage ? (
            <>
              <Image
                source={{ uri: outfit.imageUri }}
                style={homeStyles.cardImage}
                contentFit="cover"
                cachePolicy="memory-disk"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={homeStyles.imageGradient}
              />
            </>
          ) : (
            <View style={homeStyles.placeholderContainer}>
              <Ionicons name="shirt-outline" size={64} color="#D1D5DB" />
              <Text style={homeStyles.placeholderText}>No Outfit Image</Text>
            </View>
          )}

          {/* 하단 오버레이 - Title + Occasion + Items */}
          <View style={homeStyles.imageOverlay}>
            <View style={homeStyles.bottomInfo}>
              {/* 제목 - 확대되지 않았을 때만 표시 */}
              {!isExpanded && (
                <Text style={homeStyles.outfitTitle}>{outfit.title}</Text>
              )}
              
              {/* Occasion - 확대되지 않았을 때만 표시 */}
              {/* {!isExpanded && (
                <Text style={homeStyles.occasionText}>{outfit.occasion}</Text>
              )} */}
              
              <View style={homeStyles.itemsList}>
                {outfit.items.map((item, idx) => (
                  <View key={idx} style={homeStyles.itemChip}>
                    <Text style={homeStyles.itemText}>{item.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* 좌우 네비게이션 버튼 */}
          <TouchableOpacity
            style={homeStyles.navArrowLeft} 
            onPress={onNavigateLeft}      
            activeOpacity={1}              
          >
            <Animated.View style={animatedLeftButtonStyle}>
              <Ionicons 
                name="chevron-back" 
                size={24} 
                color={leftPressed ? Colors.navArrowPressed : Colors.navArrow} 
              />
            </Animated.View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={homeStyles.navArrowRight}
            onPress={onNavigateRight}
            activeOpacity={1}
          >
            <Animated.View style={animatedRightButtonStyle}>
              <Ionicons 
                name="chevron-forward" 
                size={24} 
                color={rightPressed ? Colors.navArrowPressed : Colors.navArrow} 
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Pressable>
  );
};  