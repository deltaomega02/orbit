// src/constants/config.ts
// 앱 전체 설정 및 API 엔드포인트를 정의

export const Config = {
  // API Configuration
  API_BASE_URL: process.env.API_BASE_URL || 'https://api.orbit-app.com',
  WEATHER_API_KEY: process.env.WEATHER_API_KEY || '',
  
  // App Configuration
  APP_NAME: 'Orbit',
  APP_VERSION: '1.0.0',
  
  // Animation Configuration
  ANIMATION_DURATION: 300,
  SPRING_CONFIG: {
    damping: 15,
    stiffness: 150,
  },
  
  // Camera Configuration
  CAMERA_QUALITY: 0.8,
  MAX_IMAGE_SIZE: 1920,
  
  // Storage Keys
  STORAGE_KEYS: {
    USER_DATA: '@orbit_user_data',
    CLOSET_DATA: '@orbit_closet_data',
    PREFERENCES: '@orbit_preferences',
    ONBOARDING: '@orbit_onboarding_complete',
  },
  
  // Categories
  CLOTHING_CATEGORIES: [
    { id: 'top', label: '상의', icon: 'tshirt' },
    { id: 'bottom', label: '하의', icon: 'archive' },
    { id: 'outer', label: '아우터', icon: 'jacket' },
    { id: 'dress', label: '원피스', icon: 'dress' },
    { id: 'shoes', label: '신발', icon: 'shoe' },
    { id: 'bag', label: '가방', icon: 'bag' },
    { id: 'accessory', label: '액세서리', icon: 'watch' },
  ],
  
  // Weather conditions
  WEATHER_CONDITIONS: {
    SUNNY: 'sunny',
    CLOUDY: 'cloudy',
    RAINY: 'rainy',
    SNOWY: 'snowy',
    WINDY: 'windy',
  },
  
  // TPO Options
  TPO_OPTIONS: [
    { id: 'casual', label: '캐주얼' },
    { id: 'business', label: '비즈니스' },
    { id: 'formal', label: '포멀' },
    { id: 'sports', label: '스포츠' },
    { id: 'date', label: '데이트' },
    { id: 'travel', label: '여행' },
  ],
};

export default Config;
