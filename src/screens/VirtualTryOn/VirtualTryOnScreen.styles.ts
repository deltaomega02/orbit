// src/screens/VirtualTryOn/VirtualTryOnScreen.styles.ts
// ⭐ v5.7: 전신사진 페이드인 효과 - 확실한 레이어 구조

import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Sizes } from '../../constants/dimensions';
import { Typography } from '../../constants/typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  safeArea: {
    flex: 1,
  },

  // ==================== 헤더 ====================
  header: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 56,
    justifyContent: 'center',
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    position: 'relative',
  },

  backButton: {
    position: 'absolute',
    left: 0, 
    height: '100%',
    width: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
    zIndex: 20,
  },

  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 50,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    flexWrap: 'wrap',
  },

  // ==================== 메인 컨텐츠 ====================
  mainContent: {
    flex: 1,
  },

  scrollContentContainer: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl * 2,
    paddingHorizontal: Spacing.lg,
  },

  contentWrapper: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: Spacing.lg,
  },

  // ==================== 카드 ====================
  cardContainer: {
    width: SCREEN_WIDTH - Spacing.lg * 2,
    height: SCREEN_HEIGHT * 0.7,
    borderRadius: Sizes.borderRadiusXLarge,
    backgroundColor: Colors.cardBackground,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.12,
    shadowRadius: 25,
    elevation: 5,
  },
  
  card: {
    width: '100%',
    height: '100%',
    borderRadius: Sizes.borderRadiusXLarge,
    overflow: 'hidden',
    position: 'relative',
  },
  
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  
  imageGradient: {
    ...StyleSheet.absoluteFillObject,
  },

  blurView: {
    ...StyleSheet.absoluteFillObject,
  },

  // ==================== ⭐ 로딩 컨테이너 (페이드인 효과) ====================
  // React Native는 렌더링 순서가 z-index보다 중요!
  // 나중에 렌더링된 것이 위에 그려짐
  
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // ⭐ 투명 - 전신사진이 보이도록
  },

  // ⭐ Layer 1: 전신사진 배경 (가장 먼저 렌더링)
  bodyPhotoBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },

  // ⭐ Layer 2: 페이드 오버레이 (전신사진 위에 렌더링)
  fadeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',  // ⭐⭐⭐ 명확한 흰색
    // opacity는 inline style로 동적으로 적용됨
  },

  // ⭐ Layer 3: 로딩 컨텐츠 (가장 나중에 렌더링 = 제일 위)
  loadingContentWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },

  // ⭐ 프로그레스 바 컨테이너
  progressBarContainer: {
    width: '80%',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },

  // ⭐ 프로그레스 바 배경
  progressBarBackground: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(139, 125, 255, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },

  // ⭐ 프로그레스 바 채우기
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 3,
    // width는 inline style로 동적으로 적용됨
  },

  loadingText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: Spacing.sm,
    textAlign: 'center',
    fontSize: 16,
  },

  loadingSubText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },

  // ==================== ⭐ 에러 컨테이너 ====================
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.cardBackground,
    paddingHorizontal: Spacing.xl,
  },

  errorText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  retryButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: Sizes.borderRadiusMedium,
  },

  retryButtonText: {
    ...Typography.bodyMedium,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // ==================== 상단 오버레이 (뱃지) ====================
  topOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 10,
  },
  
  glassCard: {
    alignSelf: 'flex-start',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  
  glassLayer: {
    backgroundColor: Colors.glassOverlay,
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
    borderRadius: 14,
  },
  
  occasionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  
  occasionDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
  },
  
  occasionText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  
  // ==================== 하단 오버레이 (아이템 리스트) ====================
  bottomOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    zIndex: 10,
  },

  expandButtonContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },

  expandButtonContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.glassOverlay,
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
  },
  
  glassPanel: {
    borderRadius: Sizes.borderRadiusMedium,
    overflow: 'hidden',
    width: '100%',
  },
  
  glassContent: {
    backgroundColor: Colors.glassPanel,
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
    borderRadius: Sizes.borderRadiusMedium,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 2,
  },
  
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },

  colorIndicatorPlaceholder: {
    width: 20,
    height: 20,
  },
  
  itemName: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },

  // ==================== 하단 Detail 패널 ====================
  detailPanel: {
    width: SCREEN_WIDTH - Spacing.lg * 2,
    borderRadius: Sizes.borderRadiusMedium,
    overflow: 'hidden',
  },
  
  detailContent: {
    backgroundColor: Colors.glassPanel,
    borderWidth: 0.5,
    borderColor: Colors.glassBorder,
    borderRadius: Sizes.borderRadiusMedium,
    padding: Spacing.md,
  },

  descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },

  descriptionLabel: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  descriptionText: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    lineHeight: 22,
    fontWeight: '500',
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});