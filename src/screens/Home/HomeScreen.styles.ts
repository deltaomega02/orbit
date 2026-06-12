// src/screens/Home/HomeScreen.styles.ts
// ★ v2.0: 헤더 여백 추가, dots 위치 조정
// ★ v2.1: EmptyCard 스타일 추가

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
  
  // Orbit 브랜드 헤더
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    height: 56,
  },
  
  logoContainer: {
    alignItems: 'center',
  },
  
  // 로고 텍스트
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
  
  // 메인 컨텐츠
  mainContent: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: 220,
    paddingTop: Spacing.sm,
  },
  
  // 카드 스타일
  cardContainer: {
    width: SCREEN_WIDTH - Spacing.lg * 2,
    maxWidth: 420,
    height: SCREEN_HEIGHT * 0.56,
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

  // ★ OutfitMainDisplay 스타일 추가
  placeholderContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F0F2F5',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },

  placeholderText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: '600',
  },

  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },

  bottomInfo: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },

  itemsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  itemChip: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  itemText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '600',
  },
  
  // 상단 오버레이
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
  
  // ★ OutfitCard용 텍스트 스타일 (OutfitMainDisplay와 동일)
  outfitTitle: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: '800',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  occasionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    opacity: 0.9,
  },
  
  // 하단 오버레이
  bottomOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 10,
  },

  // ★ [신규] 접혔을 때 보이는 원형 버튼 컨테이너
  expandButtonContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden', // BlurView가 둥글게 잘리도록
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },

  // ★ [신규] 원형 버튼 내부 정렬
  expandButtonContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)', // 약간의 흰색 배경
  },
  
  // ★ [수정] 펼쳐졌을 때 패널 (기존 glassPanel 활용)
  glassPanel: {
    borderRadius: Sizes.borderRadiusMedium,
    overflow: 'hidden',
    width: '100%', // 펼쳐지면 가로 꽉 차게 (또는 필요에 따라 조절 가능)
  },
  
  // ★ [수정] 패널 내부 컨텐츠
  glassContent: {
    backgroundColor: Colors.glassPanel,
    padding: Spacing.md,
    gap: Spacing.sm,
  },

  // ★ [신규] 패널 내부의 줄이기(-) 버튼
  minimizeButton: {
    alignSelf: 'flex-end',
    marginBottom: 4,
    padding: 4,
  },

  // ★ 토글 버튼
  toggleButton: {
    alignSelf: 'flex-end', // 오른쪽 정렬
    width: 32,             // 고정된 너비 (원형)
    height: 32,            // 고정된 높이 (원형)
    borderRadius: 16,      // 반지름 (완전한 원)
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // 살짝 보이는 배경
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,       // 리스트와의 간격
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
  
  itemName: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '600',
    flex: 1,
    textShadowColor: 'rgba(255, 255, 255, 0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  
  // 네비게이션 방향
  navArrowLeft: {
    position: 'absolute',
    left: 15,
    top: '50%',
    marginTop: -22,
    zIndex: 10,
    padding: 10,
  },
  
  navArrowRight: {
    position: 'absolute',
    right: 15,
    top: '50%',
    marginTop: -22,
    zIndex: 10,
    padding: 10,
  },
  
  // 페이지 dots - 마진 조정
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.lg, 
    marginBottom: Spacing.md,
  },
  
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
    opacity: 0.5,
  },
  
  dotActive: {
    width: 20,
    backgroundColor: Colors.primary,
    opacity: 1,
  },

  // ★ Empty Card Styles
  emptyCard: {
    width: '100%',
    height: '100%',
    borderRadius: Sizes.borderRadiusXLarge,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.3,
    elevation: 8,
  },

  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },

  emptyCardTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },

  emptyCardSubtitle: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },

  emptyCardHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },

  emptyCardHintText: {
    fontSize: 12,
    color: Colors.textTertiary,
    fontWeight: '500',
  },
});