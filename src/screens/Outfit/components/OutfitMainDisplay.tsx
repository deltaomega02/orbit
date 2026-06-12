// src/screens/Outfit/components/OutfitMainDisplay.tsx
// ⭐ expo-image로 캐시 적용

import React from 'react';
import { 
    View, 
    Text, 
    TouchableOpacity, // TouchableOpacity 추가
    StyleSheet 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { Image } from 'expo-image';
import { Colors } from '../../../constants/colors';
import { styles } from '../OutfitScreen.styles';

// 타입 정의 (OutfitScreen과 일치)
interface OutfitRecord {
    id: string;
    date: string;
    month: string;
    day: string;
    imageUri?: string | null;
    occasion: string;
    items: string[];
    aiScore: number;
    isLiked: boolean;
}

interface OutfitMainDisplayProps {
    outfit: OutfitRecord;
    animatedStyle: any;
    // ⭐ [추가] 좋아요 상태를 토글하는 함수를 prop으로 받습니다.
    onToggleLike: (outfitId: string, isCurrentlyLiked: boolean) => void; 
}

export const OutfitMainDisplay: React.FC<OutfitMainDisplayProps> = ({
    outfit,
    animatedStyle,
    onToggleLike, // prop으로 받기
}) => {
    const hasImage = outfit.imageUri && outfit.imageUri !== '';

    // Colors에 heartRed가 정의되어 있다고 가정 (없다면 #FF4B4B 사용)
    const HEART_RED = (Colors as any).heartRed || '#FF4B4B'; 

    return (
        <Animated.View style={[styles.mainImageContainer, animatedStyle]}>
            {hasImage ? (
                <>
                    <Image
                        source={{ uri: outfit.imageUri! }}
                        style={styles.mainImage}
                        contentFit="cover"
                        cachePolicy="memory-disk"
                    />
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.7)']}
                        style={styles.imageGradient}
                    />
                </>
            ) : (
                <View style={styles.placeholderContainer}>
                    <Ionicons name="shirt-outline" size={64} color="#D1D5DB" />
                    <Text style={styles.placeholderText}>No Outfit Image</Text>
                </View>
            )}

            <View style={styles.imageOverlay}>
                
                {/* ⭐ [수정] 하트 아이콘을 TouchableOpacity로 감싸 클릭 가능하게 만듭니다. */}
                <TouchableOpacity 
                    style={styles.likeIndicator}
                    onPress={() => onToggleLike(outfit.id, outfit.isLiked)} // 부모 함수 호출
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    activeOpacity={0.8}
                >
                    <Ionicons 
                        name={outfit.isLiked ? "heart" : "heart-outline"} 
                        size={32} 
                        color={outfit.isLiked ? HEART_RED : "#FFF"} 
                        style={{ 
                            textShadowColor: 'rgba(0,0,0,0.5)', 
                            textShadowOffset: {width: 0, height: 1}, 
                            textShadowRadius: 4 
                        }}
                    />
                </TouchableOpacity>

                <View style={styles.bottomInfo}>
                    <Text style={styles.occasionText}>{outfit.occasion}</Text>
                    
                    <View style={styles.itemsList}>
                        {outfit.items.map((item, idx) => (
                            <View key={idx} style={styles.itemChip}>
                                <Text style={styles.itemText}>{item}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </Animated.View>
    );
};