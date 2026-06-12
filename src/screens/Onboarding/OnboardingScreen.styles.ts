// src/screens/Onboarding/OnboardingScreen.styles.ts

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
  skipButton: {
    position: 'absolute',
    top: 60,
    right: Spacing.lg,
    zIndex: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  skipText: {
    ...Typography.bodyMedium,
    color: Colors.textSecondary,
  },
  progressContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.backgroundLight || Colors.cardBackground,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  stepContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  title: {
    ...Typography.h2,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.h4,
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  description: {
    ...Typography.bodyLarge,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  decorativeOrbs: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
  },
  orb: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.1,
  },
  orbSmall: {
    width: 60,
    height: 60,
    backgroundColor: Colors.secondary,
    top: 100,
    right: 40,
  },
  orbMedium: {
    width: 100,
    height: 100,
    backgroundColor: Colors.primary,
    bottom: 200,
    left: -30,
  },
  orbLarge: {
    width: 150,
    height: 150,
    backgroundColor: Colors.accent || Colors.secondary,
    bottom: 100,
    right: -50,
  },
  bottomContainer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.backgroundLight || Colors.cardBackground,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.primary,
  },
  nextButton: {
    overflow: 'hidden',
    borderRadius: Sizes.borderRadiusMedium,
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  nextButtonText: {
    ...Typography.button,
    color: Colors.textPrimary,
  },
  termsText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  termsLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});