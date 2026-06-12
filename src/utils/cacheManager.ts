// src/utils/cacheManager.ts
// AsyncStorage를 활용한 캐시 저장/로드 로직

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  WeatherCache,
  CalendarCache,
  StylePreferenceCache,
  CACHE_KEYS,
  CACHE_EXPIRY,
} from '../types/cache';

/**
 * 날씨 캐시 저장
 */
export const saveWeatherCache = async (
  data: WeatherCache
): Promise<boolean> => {
  try {
    const cacheData = {
      ...data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(CACHE_KEYS.WEATHER, JSON.stringify(cacheData));
    console.log('✅ 날씨 캐시 저장 완료:', new Date(cacheData.timestamp));
    return true;
  } catch (error) {
    console.error('❌ 날씨 캐시 저장 실패:', error);
    return false;
  }
};

/**
 * 날씨 캐시 로드
 */
export const loadWeatherCache = async (): Promise<WeatherCache | null> => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.WEATHER);
    if (!cached) {
      console.log('ℹ️ 날씨 캐시 없음');
      return null;
    }

    const data: WeatherCache = JSON.parse(cached);
    
    if (isCacheExpired(data.timestamp)) {
      const cacheDate = new Date(data.timestamp);
      const cachedDay = `${cacheDate.getFullYear()}-${cacheDate.getMonth() + 1}-${cacheDate.getDate()}`;
      console.log('⏰ 날씨 캐시 만료됨 (캐시 날짜:', cachedDay, ')');
      return null;
    }

    const age = Date.now() - data.timestamp;
    console.log('✅ 날씨 캐시 로드 완료 (나이:', Math.floor(age / 1000 / 60), '분)');
    return data;
  } catch (error) {
    console.error('❌ 날씨 캐시 로드 실패:', error);
    return null;
  }
};

/**
 * 일정 캐시 저장
 */
export const saveCalendarCache = async (
  data: CalendarCache
): Promise<boolean> => {
  try {
    const cacheData = {
      ...data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(
      CACHE_KEYS.CALENDAR,
      JSON.stringify(cacheData)
    );
    console.log('✅ 일정 캐시 저장 완료:', new Date(cacheData.timestamp));
    return true;
  } catch (error) {
    console.error('❌ 일정 캐시 저장 실패:', error);
    return false;
  }
};

/**
 * 일정 캐시 로드
 */
export const loadCalendarCache = async (): Promise<CalendarCache | null> => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.CALENDAR);
    if (!cached) {
      console.log('ℹ️ 일정 캐시 없음');
      return null;
    }

    const data: CalendarCache = JSON.parse(cached);

    if (isCacheExpired(data.timestamp)) {
      const cacheDate = new Date(data.timestamp);
      const cachedDay = `${cacheDate.getFullYear()}-${cacheDate.getMonth() + 1}-${cacheDate.getDate()}`;
      console.log('⏰ 일정 캐시 만료됨 (캐시 날짜:', cachedDay, ')');
      return null;
    }

    const age = Date.now() - data.timestamp;
    console.log('✅ 일정 캐시 로드 완료 (나이:', Math.floor(age / 1000 / 60), '분)');
    return data;
  } catch (error) {
    console.error('❌ 일정 캐시 로드 실패:', error);
    return null;
  }
};

/**
 * 특정 캐시 삭제
 */
export const clearCache = async (type: 'weather' | 'calendar' | 'all') => {
  try {
    if (type === 'weather' || type === 'all') {
      await AsyncStorage.removeItem(CACHE_KEYS.WEATHER);
      console.log('🗑️ 날씨 캐시 삭제 완료');
    }
    if (type === 'calendar' || type === 'all') {
      await AsyncStorage.removeItem(CACHE_KEYS.CALENDAR);
      console.log('🗑️ 일정 캐시 삭제 완료');
    }
  } catch (error) {
    console.error('❌ 캐시 삭제 실패:', error);
  }
};

/**
 * 캐시가 만료되었는지 확인 (날짜 기준)
 * 자정이 지나면 만료된 것으로 판단
 */
export const isCacheExpired = (timestamp: number): boolean => {
  const cacheDate = new Date(timestamp);
  const now = new Date();
  
  // 연, 월, 일이 하나라도 다르면 만료
  return (
    cacheDate.getFullYear() !== now.getFullYear() ||
    cacheDate.getMonth() !== now.getMonth() ||
    cacheDate.getDate() !== now.getDate()
  );
};

/**
 * 오늘 날짜 문자열 반환 (YYYY-MM-DD)
 */
export const getTodayDateString = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

/**
 * 캐시 상태 정보 로깅 (디버깅용)
 */
export const logCacheStatus = async () => {
  const weather = await loadWeatherCache();
  const calendar = await loadCalendarCache();
  
  console.log('📊 캐시 상태:');
  console.log('  - 날씨:', weather ? `${Math.floor((Date.now() - weather.timestamp) / 1000 / 60)}분 전` : '없음');
  console.log('  - 일정:', calendar ? `${Math.floor((Date.now() - calendar.timestamp) / 1000 / 60)}분 전` : '없음');
};

/**
 * 스타일 프리퍼런스 저장
 */
export const saveStylePreference = async (
  preference: string
): Promise<boolean> => {
  try {
    const cacheData: StylePreferenceCache = {
      preference,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(
      CACHE_KEYS.STYLE_PREFERENCE,
      JSON.stringify(cacheData)
    );
    console.log('✅ 스타일 프리퍼런스 저장 완료:', preference);
    return true;
  } catch (error) {
    console.error('❌ 스타일 프리퍼런스 저장 실패:', error);
    return false;
  }
};

/**
 * 스타일 프리퍼런스 로드
 * 만료 체크 없이 항상 유효 (사용자가 직접 삭제할 때까지 유지)
 */
export const loadStylePreference = async (): Promise<string | null> => {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEYS.STYLE_PREFERENCE);
    if (!cached) {
      console.log('ℹ️ 스타일 프리퍼런스 없음');
      return null;
    }

    const data: StylePreferenceCache = JSON.parse(cached);
    console.log('✅ 스타일 프리퍼런스 로드 완료:', data.preference);
    return data.preference;
  } catch (error) {
    console.error('❌ 스타일 프리퍼런스 로드 실패:', error);
    return null;
  }
};

/**
 * 스타일 프리퍼런스 삭제
 */
export const clearStylePreference = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(CACHE_KEYS.STYLE_PREFERENCE);
    console.log('🗑️ 스타일 프리퍼런스 삭제 완료');
    return true;
  } catch (error) {
    console.error('❌ 스타일 프리퍼런스 삭제 실패:', error);
    return false;
  }
};