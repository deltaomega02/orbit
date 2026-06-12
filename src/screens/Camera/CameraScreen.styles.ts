// src/screens/Camera/CameraScreen.styles.ts

import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Sizes } from '../../constants/dimensions';
import { Typography } from '../../constants/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },

  // 권한 요청 카드
  permissionCard: {
    width: SCREEN_WIDTH - 80,
    borderRadius: Sizes.borderRadiusXLarge,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  permissionContent: {
    padding: Spacing.xxl,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: Sizes.borderRadiusXLarge,
  },
  permissionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  permissionDescription: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  permissionButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Sizes.borderRadiusMedium,
  },
  permissionButtonText: {
    ...Typography.button,
    color: Colors.textPrimary,
  },

  // 카메라 오버레이
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 999,
  },

  // 헤더
  cameraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    zIndex: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  glassButtonInner: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 모드 배지
  modeBadge: {
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
  },
  modeBadgeContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 18,
  },
  modeTitle: {
    ...Typography.labelMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
  },

  // 캡쳐 가이드
  captureGuideContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemGuide: {
    width: SCREEN_WIDTH * 0.70,
    aspectRatio: 1,
    position: 'relative',
  },
  guideCorner1: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 50,
    height: 50,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: Colors.primary + '80',
    borderTopLeftRadius: 8,
  },
  guideCorner2: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 50,
    height: 50,
    borderTopWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: Colors.primary + '80',
    borderTopRightRadius: 8,
  },
  guideCorner3: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 2.5,
    borderLeftWidth: 2.5,
    borderColor: Colors.primary + '80',
    borderBottomLeftRadius: 8,
  },
  guideCorner4: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 50,
    height: 50,
    borderBottomWidth: 2.5,
    borderRightWidth: 2.5,
    borderColor: Colors.primary + '80',
    borderBottomRightRadius: 8,
  },
  guideCenterDot: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 6,
    height: 6,
    marginTop: -3,
    marginLeft: -3,
    borderRadius: 3,
    backgroundColor: Colors.primary + '60',
  },

  // 전신 가이드
  bodyGuide: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  bodyGuideFrame: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bodyGuideGradient: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
  },

  // 바텀 컨트롤
  bottomControlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 60,
  },
  tipCard: {
    alignSelf: 'center',
    marginBottom: Spacing.xl,
    borderRadius: Sizes.borderRadiusMedium,
    overflow: 'hidden',
  },
  tipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: Sizes.borderRadiusMedium,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  tipText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
    fontWeight: '500',
  },

  // 메인 컨트롤
  mainControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },

  // 셔터 버튼
  shutterButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
  },
  shutterOuter: {
    flex: 1,
    padding: 4,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  shutterInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 촬영 후 리뷰 화면
  capturedImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',
  },
  reviewContainer: {
    flex: 1,
  },
  reviewHeader: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  glassPanel: {
    height: 56,
    borderRadius: Sizes.borderRadiusMedium,
    overflow: 'hidden',
  },
  glassPanelContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: Sizes.borderRadiusMedium,
  },
  backButton: {
    padding: Spacing.sm,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  reviewTitle: {
    ...Typography.h4,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  reviewSubtitle: {
    ...Typography.caption,
    color: Colors.textPrimary,
    opacity: 0.7,
    marginTop: 2,
  },

  // AI Info Card
  aiInfoCard: {
    position: 'absolute',
    top: '40%',
    left: Spacing.lg,
    right: Spacing.lg,
    borderRadius: Sizes.borderRadiusMedium,
    overflow: 'hidden',
  },
  aiInfoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  aiIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 125, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  aiTextContainer: {
    flex: 1,
  },
  aiTitle: {
    ...Typography.labelLarge,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  aiDescription: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // 리뷰 액션 버튼
  reviewActions: {
    position: 'absolute',
    bottom: 40,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    gap: Spacing.md,
  },
  retakeButtonGlass: {
    flex: 1,
    height: 56,
    borderRadius: Sizes.borderRadiusMedium,
    overflow: 'hidden',
  },
  confirmButtonGlass: {
    flex: 2,
    height: 56,
    borderRadius: Sizes.borderRadiusMedium,
    overflow: 'hidden',
  },
  buttonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  retakeText: {
    ...Typography.button,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  confirmText: {
    ...Typography.button,
    color: Colors.textOnPrimary,
    fontWeight: '600',
  },
});