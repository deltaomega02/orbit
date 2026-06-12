// src/screens/Camera/components/ManualCard.tsx
// AI 스타일링 어시스턴트 메뉴얼 선택 카드

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Colors } from '../../../constants/colors';
import { Spacing, Sizes } from '../../../constants/dimensions';

interface ManualCardProps {
  onCategorySelect?: (category: string) => void;
  onOccasionSelect?: (occasion: string) => void;
  onGeneratePress?: () => void;
}

export const ManualCard: React.FC<ManualCardProps> = ({
  onCategorySelect,
  onOccasionSelect,
  onGeneratePress,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);

  const categories = [
    { id: 'top', label: '캐주얼', icon: 'shirt-outline' },
    { id: 'bottom', label: '포멀', icon: 'briefcase-outline' },
    { id: 'dress', label: '스트릿', icon: 'flash-outline' },
    { id: 'outer', label: '미니멀', icon: 'square-outline' },
  ];

  const occasions = [
    { id: 'work', label: '출근/업무', icon: 'briefcase-outline' },
    { id: 'date', label: '데이트', icon: 'heart-outline' },
    { id: 'daily', label: '일상/외출', icon: 'walk-outline' },
    { id: 'party', label: '모임/파티', icon: 'people-outline' },
    { id: 'sports', label: '운동', icon: 'fitness-outline' },
    { id: 'travel', label: '여행', icon: 'airplane-outline' },
  ];

  const handleCategoryPress = (id: string) => {
    setSelectedCategory(id);
    onCategorySelect?.(id);
  };

  const handleOccasionPress = (id: string) => {
    setSelectedOccasion(id);
    onOccasionSelect?.(id);
  };

  return (
    <Animated.View 
      entering={FadeInDown.duration(400).delay(300)}
      style={styles.container}
    >
      <View style={styles.card}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="transparent"
        />
        <View style={styles.cardContent}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Ionicons name="sparkles" size={24} color={Colors.primary} />
            <Text style={styles.headerTitle}>AI 스타일링 어시스턴트</Text>
          </View>

          {/* 스타일 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>스타일 선택</Text>
            <View style={styles.optionsGrid}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.optionButton,
                    selectedCategory === category.id && styles.optionButtonSelected,
                  ]}
                  onPress={() => handleCategoryPress(category.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={category.icon as any}
                    size={20}
                    color={
                      selectedCategory === category.id
                        ? Colors.primary
                        : Colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.optionLabel,
                      selectedCategory === category.id && styles.optionLabelSelected,
                    ]}
                  >
                    {category.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 어떤 상황인가요? */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>어떤 상황인가요?</Text>
            <View style={styles.occasionsGrid}>
              {occasions.map((occasion) => (
                <TouchableOpacity
                  key={occasion.id}
                  style={[
                    styles.occasionChip,
                    selectedOccasion === occasion.id && styles.occasionChipSelected,
                  ]}
                  onPress={() => handleOccasionPress(occasion.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={occasion.icon as any}
                    size={16}
                    color={
                      selectedOccasion === occasion.id
                        ? Colors.textPrimary
                        : Colors.textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.occasionLabel,
                      selectedOccasion === occasion.id && styles.occasionLabelSelected,
                    ]}
                  >
                    {occasion.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* AI 코디 생성하기 버튼 */}
          <TouchableOpacity
            style={styles.generateButton}
            onPress={onGeneratePress}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.generateButtonGradient}
            >
              <Ionicons name="sparkles" size={20} color={Colors.textPrimary} />
              <Text style={styles.generateButtonText}>AI 코디 생성하기</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
  cardContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: Sizes.borderRadiusXLarge,
    padding: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  optionButton: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: Sizes.borderRadiusMedium,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  optionButtonSelected: {
    backgroundColor: 'rgba(139, 125, 255, 0.15)',
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  optionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  optionLabelSelected: {
    color: Colors.primary,
  },
  occasionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  occasionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  occasionChipSelected: {
    backgroundColor: 'rgba(139, 125, 255, 0.15)',
    borderColor: Colors.primary,
  },
  occasionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  occasionLabelSelected: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  generateButton: {
    marginTop: Spacing.sm,
    borderRadius: Sizes.borderRadiusMedium,
    overflow: 'hidden',
  },
  generateButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  generateButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
});