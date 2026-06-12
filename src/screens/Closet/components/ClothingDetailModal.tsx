// src/screens/Closet/components/ClothingDetailModal.tsx
// 옷 상세 정보를 보여주는 글래스모피즘 모달 (ZoomIn 애니메이션)
// ⭐ v2.0: 썸네일(저화질) → 고화질 프로그레시브 로딩 적용

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from '@react-native-community/blur';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { Colors } from '../../../constants/colors';
import { ClothingItem } from '../../../types/clothes';
import { normalizeColor } from '../../../utils/colorUtils';
import UpdateSuccessModal from './UpdateSuccessModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ClothingDetailModalProps {
  visible: boolean;
  clothing: ClothingItem | null;
  onClose: () => void;
  onUpdate?: (id: string, updates: { name?: string; subCategory?: string }) => Promise<void>;
}

export const ClothingDetailModal: React.FC<ClothingDetailModalProps> = ({
  visible,
  clothing,
  onClose,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedSubCategory, setEditedSubCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // 프로그레시브 이미지 로딩 상태
  const [isHighResLoaded, setIsHighResLoaded] = useState(false);

  // clothing이 변경될 때마다 초기값 설정
  useEffect(() => {
    if (clothing) {
      setEditedName(clothing.name);
      setEditedSubCategory(clothing.subCategory || '');
      // 새로운 옷이 선택되면 고화질 로딩 상태 초기화
      setIsHighResLoaded(false);
    }
  }, [clothing]);

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!visible) {
      setIsHighResLoaded(false);
    }
  }, [visible]);

  if (!clothing) return null;

  const hasImage = clothing.imageUri && clothing.imageUri !== '(no image)';
  
  // 썸네일 URL과 고화질 URL
  const thumbnailUrl = hasImage ? `${clothing.imageUri}?size=200` : null;
  const highResUrl = hasImage ? clothing.imageUri : null;
  
  const displayColor = normalizeColor(clothing.color);

  const handleEdit = () => {
    setEditedName(clothing.name);
    setEditedSubCategory(clothing.subCategory || '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!editedName.trim()) {
      Alert.alert('알림', '옷 이름을 입력해주세요.');
      return;
    }

    setIsSaving(true);
    try {
      if (onUpdate) {
        await onUpdate(clothing.id.toString(), {
          name: editedName.trim(),
          subCategory: editedSubCategory.trim(),
        });
        setIsEditing(false);
        
        // Alert 대신 글래스모피즘 모달 표시
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error('Update failed:', error);
      Alert.alert('오류', '수정에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedName(clothing.name);
    setEditedSubCategory(clothing.subCategory || '');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {/* 배경 오버레이 - 글래스모피즘 적용 */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={10}
          reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.3)"
        />
      </Pressable>

      {/* 모달 컨테이너 */}
      <View style={styles.modalContainer} pointerEvents="box-none">
        <Animated.View
          entering={ZoomIn.duration(300).springify()}
          exiting={FadeOut.duration(200)}
          style={styles.modalCard}
        >
          {/* 블러 배경 */}
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={20}
            reducedTransparencyFallbackColor="white"
          />

          {/* 글래스 레이어 */}
          <View style={styles.glassLayer} />

          {/* 상단 흰색 라인 */}
          <View style={styles.topLine} />

          {/* 수정 버튼 */}
          {!isEditing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={handleEdit}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {/* 모달 내용 */}
          <View style={styles.contentContainer}>
            {/* 이미지 섹션 */}
            <View style={styles.imageSection}>
              {hasImage ? (
                // ⭐ 프로그레시브 로딩: 썸네일 → 고화질
                <View style={styles.imageWrapper}>
                  {/* 썸네일 이미지 (먼저 표시) */}
                  {!isHighResLoaded && (
                    <Image
                      source={{ uri: thumbnailUrl! }}
                      style={[styles.clothingImage, styles.thumbnailImage]}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      priority="high"
                    />
                  )}
                  
                  {/* 고화질 이미지 (로드 완료 후 표시) */}
                  <Image
                    source={{ uri: highResUrl! }}
                    style={[
                      styles.clothingImage,
                      styles.highResImage,
                      { opacity: isHighResLoaded ? 1 : 0 }
                    ]}
                    contentFit="cover"
                    transition={300}
                    cachePolicy="memory-disk"
                    priority="normal"
                    onLoad={() => {
                      console.log('✅ [DetailModal] 고화질 이미지 로드 완료');
                      setIsHighResLoaded(true);
                    }}
                  />
                </View>
              ) : (
                <View style={styles.noImageContainer}>
                  <Ionicons
                    name="shirt-outline"
                    size={80}
                    color={Colors.textTertiary}
                    style={{ opacity: 0.3 }}
                  />
                  <Text style={styles.noImageText}>이미지 없음</Text>
                </View>
              )}

              {/* 색상 인디케이터 */}
              <View style={styles.colorIndicatorContainer}>
                <View
                  style={[
                    styles.colorIndicator,
                    { backgroundColor: displayColor },
                  ]}
                />
              </View>
            </View>

            {/* 정보 섹션 */}
            <View style={styles.infoSection}>
              {/* 옷 이름 */}
              {isEditing ? (
                <TextInput
                  style={styles.nameInput}
                  value={editedName}
                  onChangeText={setEditedName}
                  placeholder="옷 이름"
                  placeholderTextColor={Colors.textTertiary}
                />
              ) : (
                <Text style={styles.clothingName}>{clothing.name}</Text>
              )}

              {/* 카테고리 */}
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{clothing.mainCategory}</Text>
              </View>

              {/* 서브 카테고리 */}
              {isEditing ? (
                <TextInput
                  style={styles.subCategoryInput}
                  value={editedSubCategory}
                  onChangeText={setEditedSubCategory}
                  placeholder="옷 종류 (예: 반팔, 긴팔)"
                  placeholderTextColor={Colors.textTertiary}
                />
              ) : (
                clothing.subCategory && (
                  <View style={styles.subCategoryBadge}>
                    <Text style={styles.subCategoryText}>{clothing.subCategory}</Text>
                  </View>
                )
              )}

              {/* 특징 설명 (detail) - 사진이 없을 때만 표시 */}
              {!hasImage && (
                <>
                  {clothing.detail ? (
                    <View style={styles.detailContainer}>
                      <Text style={styles.detailLabel}>특징</Text>
                      <Text style={styles.detailText}>{clothing.detail}</Text>
                    </View>
                  ) : (
                    <View style={styles.detailContainer}>
                      <Text style={styles.noDetailText}>설명이 없습니다</Text>
                    </View>
                  )}
                </>
              )}
            </View>

            {/* 버튼 */}
            {isEditing ? (
              <View style={styles.editButtonContainer}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={handleCancel}
                  activeOpacity={0.7}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelButtonText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.saveButton]}
                  onPress={handleSave}
                  activeOpacity={0.7}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>저장</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={onClose}
                activeOpacity={0.7}
              >
                <View style={styles.confirmButtonInner}>
                  <Text style={styles.confirmButtonText}>확인</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </View>

      {/* 수정 완료 글래스모피즘 모달 */}
      <UpdateSuccessModal
        visible={showSuccessModal}
        clothingName={editedName}
        onClose={() => {
          setShowSuccessModal(false);
          onClose(); // 디테일 모달도 함께 닫기
        }}
        autoClose={true}
        autoCloseDelay={2000}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  modalCard: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  glassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    zIndex: 1,
  },
  editButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  contentContainer: {
    padding: 24,
    zIndex: 20,
    position: 'relative',
  },
  imageSection: {
    width: '100%',
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FAFAFA',
    marginBottom: 20,
    position: 'relative',
  },
  // 이미지 래퍼 (프로그레시브 로딩용)
  imageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  clothingImage: {
    width: '100%',
    height: '100%',
  },
  // 썸네일 이미지 스타일
  thumbnailImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  // 고화질 이미지 스타일
  highResImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  noImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  noImageText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
  colorIndicatorContainer: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    width: 30,
    height: 30,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  colorIndicator: {
    width: 28,
    height: 28,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  infoSection: {
    marginBottom: 24,
  },
  clothingName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  nameInput: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.5,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
    paddingBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  subCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  subCategoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  subCategoryInput: {
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  detailContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
    padding: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailText: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  noDetailText: {
    fontSize: 14,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
  confirmButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmButtonInner: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editButtonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});