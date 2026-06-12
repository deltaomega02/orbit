// src/screens/Recommend/RecommendScreen.styles.ts
// RecommendScreen 전용 스타일

import { StyleSheet, Platform } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing } from '../../constants/dimensions';
import { Typography } from '../../constants/typography';

// 레이아웃 상수 정의
const LAYOUT = {
  weatherCard: {
    height: 140,
    iconSize: 48,
    iconContainerSize: 56,
    sectionPadding: 16,
  },
  actionButton: {
    height: 110,
    iconSize: 40,
    iconContainerSize: 56,
    buttonPadding: 12,
  },
};

export const styles = StyleSheet.create({
  // ===== 기본 컨테이너 =====
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  
  safeArea: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  
  // ===== 헤더 =====
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    height: 56,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  orbitText: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: Colors.textPrimary,
  },
  
  tagline: {
    fontSize: 9,
    color: Colors.textTertiary,
    fontWeight: '500',
    letterSpacing: 0.8,
    marginTop: -2,
  },
  
  // ===== 글래스모피즘 공통 =====
  glassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.dockBackground,
    borderWidth: 0.5,
    borderColor: Colors.dockBorder,
  },
  
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  
  iconGlow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  
  // ===== 날씨 & 일정 위젯 =====
  weatherScheduleContainer: {
    marginBottom: Spacing.md,
  },
  
  weatherScheduleCard: {
    height: LAYOUT.weatherCard.height,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    backgroundColor: 'transparent',
  },
  
  contentContainer: {
    flex: 1,
  },
  
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  
  loadingText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  
  infoRow: {
    flex: 1,
    flexDirection: 'row',
  },
  
  infoSection: {
    flex: 1,
    paddingHorizontal: LAYOUT.weatherCard.sectionPadding,
    paddingVertical: LAYOUT.weatherCard.sectionPadding,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  infoContent: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  infoIconContainer: {
    width: LAYOUT.weatherCard.iconContainerSize,
    height: LAYOUT.weatherCard.iconContainerSize,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  
  infoTextGroup: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  
  infoTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    fontSize: 20,
    lineHeight: 24,
    textShadowColor: 'rgba(139, 125, 255, 0.1)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
    maxWidth: '100%',
  },
  
  infoSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
    maxWidth: '100%',
  },
  
  infoError: {
    ...Typography.caption,
    color: Colors.textTertiary,
    textAlign: 'center',
    fontSize: 11,
    maxWidth: '100%',
  },
  
  divider: {
    position: 'absolute',
    left: '50%',
    top: LAYOUT.weatherCard.sectionPadding,
    bottom: LAYOUT.weatherCard.sectionPadding,
    width: 1,
    backgroundColor: Colors.dockBorder,
    transform: [{ translateX: -0.5 }],
  },
  
  // ⭐ 스타일 프리퍼런스 버튼 (날씨 카드 아래)
  stylePreferenceContainer: {
    marginHorizontal: 0,
    marginBottom: Spacing.md,
  },

  stylePreferenceButton: {
    height: 70,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  stylePreferenceContent: {
    height: 70, // ⭐ 명시적 높이 지정
    flexDirection: 'row',
    alignItems: 'center', // ⭐ 세로 중앙
    justifyContent: 'center', // ⭐ 가로 중앙
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 0, // ⭐ padding 제거하고 높이로만 제어
  },

  stylePreferenceTextContainer: {
    alignItems: 'center',
    justifyContent: 'center', // ⭐ 추가
  },

  stylePreferenceTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
    textAlign: 'center',
  },

  stylePreferenceSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // ===== 액션 버튼들 =====
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
    height: LAYOUT.actionButton.height,
  },
  
  actionButton: {
    height: LAYOUT.actionButton.height,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
    backgroundColor: 'transparent',
  },
  
  buttonHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  
  buttonContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: LAYOUT.actionButton.buttonPadding,
    paddingVertical: LAYOUT.actionButton.buttonPadding,
  },
  
  buttonIconContainer: {
    width: LAYOUT.actionButton.iconContainerSize,
    height: LAYOUT.actionButton.iconContainerSize,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  
  actionButtonText: {
    ...Typography.labelSmall,
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
    maxWidth: '100%',
  },
  
  actionButtonTextDisabled: {
    color: Colors.textTertiary,
  },
  
  // ===== 생성 중 인디케이터 =====
  generatingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    height: 48,
  },
  
  generatingText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  
  // ===== 섹션 타이틀 =====
  sectionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: Spacing.md,
    textShadowColor: 'rgba(139, 125, 255, 0.15)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  
  // ===== 추천 카드 =====
  cardWrapper: {
    marginBottom: Spacing.md,
  },
  
  recommendCard: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  
  cardHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  
  // ===== 카드 헤더 =====
  cardHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    height: 72,
  },
  
  cardHeaderLeft: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  typeIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: Colors.dockBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  
  cardHeaderCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.sm,
    minHeight: 48,
  },
  
  cardTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
    maxWidth: '100%',
  },
  
  cardSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
    maxWidth: '100%',
  },
  
  cardHeaderRight: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // ===== 카드 확장 컨텐츠 =====
  cardExpandedContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: Spacing.sm,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: Colors.dockBorder,
    minHeight: 44,
  },
  
  reasonText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  
  // ===== 의상 아이템들 =====
  itemsColumn: {
    gap: Spacing.sm,
  },
  
  itemRow: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 0.5,
    borderColor: Colors.dockBorder,
    minHeight: 56,
  },
  
  itemRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    minHeight: 56,
  },
  
  itemLabelBox: {
    width: 60,
    alignItems: 'flex-start',
  },
  
  itemLabel: {
    ...Typography.caption,
    color: Colors.textTertiary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  
  itemNameBox: {
    flex: 1,
  },
  
  itemName: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
    lineHeight: 20,
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  
  // ===== 액션 버튼 (하단 입어보기) =====
  applyButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    height: 48,
  },
  
  applyButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    height: 48,
    paddingHorizontal: Spacing.md,
  },
  
  applyButtonText: {
    ...Typography.bodyMedium,
    color: '#FFF',
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  
  // ===== 빈 상태 =====
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  
  emptyIconWrapper: {
    marginBottom: Spacing.sm,
  },
  
  emptyIconBg: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  emptyTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '700',
    textShadowColor: 'rgba(139, 125, 255, 0.15)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  
  emptySubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    lineHeight: 20,
  },
});