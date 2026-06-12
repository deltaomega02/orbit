// src/screens/Outfit/components/OutfitGridModal.tsx

import React, { useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated from 'react-native-reanimated';
import { Colors } from '../../../constants/colors';
import { styles } from '../OutfitScreen.styles';

// 메인 화면과 동일한 인터페이스
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

interface OutfitGridModalProps {
  visible: boolean;
  outfits: OutfitRecord[];
  currentIndex: number;
  onClose: () => void;
  onSelectOutfit: (index: number) => void;
  backdropStyle: any;
  gridStyle: any;
}

export const OutfitGridModal: React.FC<OutfitGridModalProps> = ({
  visible,
  outfits,
  currentIndex,
  onClose,
  onSelectOutfit,
  backdropStyle,
  gridStyle,
}) => {
  const flatListRef = useRef<FlatList>(null);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <Animated.View style={[styles.modalBackdrop, backdropStyle]}>
          <TouchableWithoutFeedback onPress={onClose}>
            <View style={StyleSheet.absoluteFill} />
          </TouchableWithoutFeedback>
        </Animated.View>

        <Animated.View style={[styles.gridContainer, gridStyle]}>
          <View style={styles.gridHeader}>
            <Text style={styles.gridTitle}>All Outfits</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <FlatList
            ref={flatListRef}
            data={outfits}
            numColumns={3}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContent}
            renderItem={({ item, index }) => (
              <TouchableOpacity
                style={[
                  styles.gridItem,
                  index === currentIndex && styles.gridItemActive,
                ]}
                onPress={() => onSelectOutfit(index)}
                activeOpacity={0.8}
              >
                {/* 그리드에서도 이미지가 없으면 아이콘 표시 */}
                {item.imageUri ? (
                  <Image
                    source={{ uri: item.imageUri }}
                    style={styles.gridImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.gridImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#E5E7EB' }]}>
                    <Ionicons name="shirt-outline" size={24} color="#9CA3AF" />
                  </View>
                )}

                {index === currentIndex && (
                  <View style={styles.gridActiveOverlay}>
                    <View style={styles.gridActiveBorder} />
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#FFF"
                      style={styles.gridCheckmark}
                    />
                  </View>
                )}
                <View style={styles.gridItemInfo}>
                  <Text style={styles.gridItemDate}>{item.day}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </Animated.View>
      </View>
    </Modal>
  );
};