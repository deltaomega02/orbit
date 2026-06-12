// src/screens/Home/components/EmptyCard.tsx
// 코디가 없을 때 표시되는 빈 카드 컴포넌트

import React from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { styles as homeStyles } from '../HomeScreen.styles';
import { Colors } from '../../../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface EmptyCardProps {
  onPress: () => void;
}

export const EmptyCard: React.FC<EmptyCardProps> = ({ onPress }) => {
  return (
    <Animated.View
      style={[
        homeStyles.cardContainer,
        { 
          height: SCREEN_HEIGHT * 0.56,
          justifyContent: 'center',
          alignItems: 'center',
        }
      ]}
      entering={FadeInUp.duration(600).delay(200)}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={homeStyles.emptyCard}
      >
        {/* 옷 아이콘 */}
        <View>
          <Ionicons 
            name="shirt-outline" 
            size={64} 
            color={"rgba(0, 0, 0, 0.4)"}
          />
        </View>

        {/* 텍스트 */}
        <Text style={homeStyles.emptyCardTitle}>
          아직 코디가 없습니다
        </Text>
        <Text style={homeStyles.emptyCardSubtitle}>
          추천 탭에서 새로운 코디를 만들어보세요!
        </Text>

        
      </TouchableOpacity>
    </Animated.View>
  );
};