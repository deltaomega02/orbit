// src/screens/Auth/LoginScreen.styles.ts

import { StyleSheet, Dimensions, Platform } from 'react-native';
import { Colors } from '../../constants/colors';
import { Spacing, Sizes } from '../../constants/dimensions';
import { Typography } from '../../constants/typography';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',  // 기본 배경색
  },
  
  // 배경 이미지 컨테이너
  backgroundContainer: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // 배경 이미지 - 크기 조절
  backgroundImage: {
    width: SCREEN_WIDTH * 1,  
    height: SCREEN_WIDTH * 1,  // 정사각형 비율 유지
    opacity: 0.9,  // 살짝 투명도 적용
  },
  
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },

  // 헤더 - ORBIT 브랜드
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: -Spacing.xxl,
  },
  orbitLogo: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 3,
    color: Colors.textPrimary,
    textShadowColor: 'rgba(255, 255, 255, 0.95)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  tagline: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: 6,
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  // 메인 카드 컨테이너 (더 투명한 글래스모피즘)
  cardContainer: {
    width: SCREEN_WIDTH - Spacing.md * 2,
    maxWidth: 440,
    minHeight: SCREEN_HEIGHT * 0.65,
  },
  card: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: Platform.OS === 'ios' 
      ? 'rgba(255, 255, 255, 0.05)'  // iOS: 극도로 투명하게 (0.08 → 0.05)
      : 'rgba(255, 255, 255, 0.08)',  // Android: 극도로 투명하게 (0.12 → 0.08)
    shadowColor: 'rgba(0, 0, 0, 0.15)',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 10,
    overflow: 'hidden',
  },
  
  // 글래스 레이어들 (더 투명하게)
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Platform.OS === 'ios'
      ? 'rgba(255, 255, 255, 0.02)'  // 0.03 → 0.02
      : 'rgba(255, 255, 255, 0.03)',  // 0.06 → 0.03
  },
  
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 32,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',  // 0.18 → 0.15
    backgroundColor: 'transparent',
  },
  
  cardContent: {
    flex: 1,
    padding: Spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // 웰컴 텍스트 (더 선명하게)
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
    textShadowColor: 'rgba(255, 255, 255, 0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 5,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
    lineHeight: 22,
    opacity: 0.95,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // 버튼 컨테이너
  buttonContainer: {
    width: '100%',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },

  // Google 로그인 버튼 (더 선명한 글래스)
  googleButton: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.88)',  // 더 불투명하게
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.15)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  googleIconWrapper: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#EA4335',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
    }),
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },

  // 구분선
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  dividerLine: {
    flex: 1,
    height: 0.5,
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  dividerText: {
    fontSize: 13,
    color: Colors.textTertiary,
    marginHorizontal: Spacing.md,
    fontWeight: '500',
    opacity: 0.9,
  },

  // 게스트 로그인 버튼 (더 투명한 글래스)
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 4,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',  // 더 투명하게
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  guestButtonGlass: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  guestButtonText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: '500',
    letterSpacing: -0.2,
  },

  // 정보 컨테이너 (더 투명한 글래스 카드)
  infoContainer: {
    marginTop: Spacing.xl,
    width: '100%',
  },
  infoGlassCard: {
    borderRadius: 12,
    padding: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',  // 더 투명하게
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  infoGlassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.01)',
  },
  infoContent: {
    gap: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    opacity: 0.95,
  },

  // 모달 (글래스모피즘)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContent: {
    backgroundColor: Platform.OS === 'ios'
      ? 'rgba(255, 255, 255, 0.85)'
      : 'rgba(255, 255, 255, 0.92)',
    borderRadius: 24,
    width: '100%',
    maxWidth: 380,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.2,
        shadowRadius: 25,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  modalGlassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  modalBody: {
    padding: Spacing.xl,
    alignItems: 'center',
  },

  // 경고 아이콘
  warningIconContainer: {
    marginBottom: Spacing.md,
  },
  warningGradient: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#FF9500',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  // 모달 텍스트
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },

  // 제한사항 리스트
  limitationsList: {
    width: '100%',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  limitationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  limitationIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  limitationText: {
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
  },

  // 모달 버튼
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalConfirmButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});