// src/types/cache.ts
// 날씨 및 일정 데이터 캐싱을 위한 TypeScript 타입 정의

/**
 * 날씨 캐시 데이터 타입
 */
export interface WeatherCache {
  temperature: number;
  condition: string;
  icon: string;
  humidity?: number;
  windSpeed?: number;
  location?: string;
  timestamp: number; // Unix timestamp (밀리초)
}

/**
 * 일정 캐시 데이터 타입
 */
export interface CalendarEventCache {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  description?: string;
  location?: string;
}

export interface CalendarCache {
  events: CalendarEventCache[];
  timestamp: number; // Unix timestamp (밀리초)
}

/**
 * 전체 캐시 상태 타입
 */
export interface CacheState {
  weather: WeatherCache | null;
  calendar: CalendarCache | null;
  lastUpdated: {
    weather: number | null;
    calendar: number | null;
  };
}

/**
 * AsyncStorage 키 상수
 */
export const CACHE_KEYS = {
  WEATHER: '@orbit_cache_weather',
  CALENDAR: '@orbit_cache_calendar',
  STYLE_PREFERENCE: '@orbit_cache_style_preference',
} as const;

/**
 * 스타일 프리퍼런스 캐시 데이터 타입
 */
export interface StylePreferenceCache {
  preference: string; // 사용자가 입력한 스타일 선호도
  timestamp: number; // Unix timestamp (밀리초)
}

/**
 * 캐시 만료 정책: 날짜가 바뀌면(자정 지나면) 만료
 * 24시간이 아닌 날짜 기준으로 판단
 */