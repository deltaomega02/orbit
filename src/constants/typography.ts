// src/constants/typography.ts
// 앱 전체에서 사용되는 폰트 스타일을 정의

import { TextStyle } from 'react-native';

export const FontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 24,
  xxxl: 32,
  huge: 40,
};

export const FontWeights = {
  thin: '100' as TextStyle['fontWeight'],
  light: '300' as TextStyle['fontWeight'],
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  black: '900' as TextStyle['fontWeight'],
};

export const Typography = {
  // Headings
  heading1: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.bold,
    lineHeight: 32,
  },
  h1: {
    fontSize: FontSizes.huge,
    fontWeight: FontWeights.bold,
    lineHeight: 48,
  },
  h2: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    lineHeight: 40,
  },
  h3: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.semibold,
    lineHeight: 32,
  },
  h4: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    lineHeight: 24,
  },
  
  // Body text
  body: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.regular,
    lineHeight: 20,
  },
  bodyLarge: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.regular,
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.regular,
    lineHeight: 20,
  },
  bodySmall: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.regular,
    lineHeight: 16,
  },
  
  // Labels
  labelLarge: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.medium,
    lineHeight: 20,
  },
  labelMedium: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    lineHeight: 18,
  },
  labelSmall: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.medium,
    lineHeight: 16,
  },
  
  // Buttons
  button: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
    lineHeight: 24,
  },
  buttonSmall: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.medium,
    lineHeight: 20,
  },
  
  // Caption
  caption: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.regular,
    lineHeight: 14,
  },
};

export const TYPOGRAPHY = Typography;

export default Typography;