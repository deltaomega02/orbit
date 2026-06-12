// src/constants/dimensions.ts
// 앱 전체에서 사용되는 크기, 간격, 여백 등의 상수를 정의

import { Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  page: 16, // 페이지 좌우 여백
};

export const Sizes = {
  // Screen dimensions
  screenWidth,
  screenHeight,
  
  // Component sizes
  buttonHeight: 48,
  buttonHeightLarge: 56,
  buttonHeightSmall: 36,
  
  inputHeight: 48,
  
  cardWidth: (screenWidth - 48) / 2, // 2 columns with padding
  cardHeight: 220,
  
  iconSmall: 16,
  iconMedium: 24,
  iconLarge: 32,
  iconXLarge: 48,
  
  avatarSmall: 32,
  avatarMedium: 48,
  avatarLarge: 80,
  
  // Border radius
  borderRadiusSmall: 8,
  borderRadiusMedium: 12,
  borderRadiusLarge: 16,
  borderRadiusXLarge: 24,
  borderRadiusRound: 999,
  
  // Tab bar
  tabBarHeight: 60,
  tabIconSize: 24,
  
  // Header
  headerHeight: 56,
  
  // Floating action button
  fabSize: 56,
  fabIconSize: 28,
};

export const Layout = {
  padding: Spacing.md,
  paddingHorizontal: Spacing.md,
  paddingVertical: Spacing.md,
  
  containerPadding: Spacing.lg,
  
  cardMargin: Spacing.sm,
  itemSpacing: Spacing.md,
  sectionSpacing: Spacing.xl,
};

export default { Spacing, Sizes, Layout };