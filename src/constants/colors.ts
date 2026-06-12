// src/constants/colors.ts
// 앱 전체에서 사용되는 색상 팔레트를 정의

export const Colors = {
  // Primary Colors - Orbit Brand
  primary: '#8B7DFF',      // 메인 보라색
  primaryDark: '#6B5DD3',
  primaryLight: '#A89FFF',
  
  // Secondary Colors
  secondary: '#FF6B9D',    // 포인트 핑크
  accent: '#4ECDC4',       // 민트
  
  // Background Colors - iOS Style Light Theme
  background: '#F2F2F7',   // 메인 배경 (라이트 그레이)
  backgroundLight: '#FFFFFF',  // 카드 배경 (흰색)
  cardBackground: '#FFFFFF',   // 카드 배경
  cardBackgroundTranslucent: 'rgba(255, 255, 255, 0.92)', // 반투명 카드
  cardBorder: 'rgba(0, 0, 0, 0.08)', // 카드 테두리
  modalBackground: 'rgba(0, 0, 0, 0.4)',
  
  // Dock & Glass Effects
  dockBackground: 'rgba(255, 255, 255, 0.08)', // Dock 글래스 배경
  dockBorder: 'rgba(255, 255, 255, 0.15)', // Dock 테두리
  glassmorphism: 'rgba(255, 255, 255, 0.7)', // 글래스모피즘 효과
  glassPanel: 'rgba(255, 255, 255, 0.15)', // 글래스 패널
  glassBorder: 'rgba(255, 255, 255, 0.3)', // 글래스 테두리
  glassOverlay: 'rgba(255, 255, 255, 0.2)', // 글래스 오버레이
  
  // Text Colors - Light Theme
  textPrimary: '#000000',
  textSecondary: '#6C6C70',
  textTertiary: '#8E8E93',
  textOnPrimary: '#FFFFFF', // 주 색상 위의 텍스트
  textOnImage: '#000000', // 이미지 위의 텍스트 (검은색으로 변경)
  
  // UI Elements
  border: '#E5E5EA',
  divider: '#C6C6C8',
  
  // Navigation Elements
  navArrow: '#666666', // 화살표 기본 색상
  navArrowPressed: '#333333', // 화살표 눌림 색상
  navArrowBackground: 'rgba(255, 255, 255, 0.1)', // 화살표 배경
  navArrowBorder: 'rgba(255, 255, 255, 0.2)', // 화살표 테두리
  
  // Status Colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  
  // Weather Widget
  weatherGradientStart: '#667eea',
  weatherGradientEnd: '#764ba2',
  weatherDivider: 'rgba(0, 0, 0, 0.06)',
  
  // Tab Bar (Dock)
  tabActive: '#000000',  // 활성 탭 아이콘
  tabInactive: '#666666', // 비활성 탭 아이콘
  plusButton: 'rgba(0, 0, 0, 0.02)', // 중앙 + 버튼 배경
  plusIcon: '#333333', // + 아이콘 색상
  
  // Shadow
  shadow: 'rgba(0, 0, 0, 0.08)',
  shadowMedium: 'rgba(0, 0, 0, 0.12)',
  shadowStrong: 'rgba(0, 0, 0, 0.16)',
  shadowLight: 'rgba(0, 0, 0, 0.03)',
  
  // Gradients
  imageGradientTop: 'rgba(0,0,0,0.2)',
  imageGradientBottom: 'rgba(0,0,0,0.1)',
  lightRefraction: 'rgba(255,255,255,0.3)', // 빛 굴절 효과
};

export default Colors;