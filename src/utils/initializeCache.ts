// src/utils/initializeCache.ts
// 앱 시작 시 캐시를 AsyncStorage에서 로드하여 Redux에 복원

import { store } from '../store';
import { restoreCacheState } from '../store/slices/cacheSlice';
import { loadWeatherCache, loadCalendarCache } from './cacheManager';

/**
 * 앱 시작 시 캐시 초기화
 * AsyncStorage에서 캐시 데이터를 로드하여 Redux store에 복원합니다.
 */
export const initializeCache = async (): Promise<void> => {
  try {
    console.log('🔄 [InitCache] 캐시 초기화 시작...');

    // 병렬로 날씨와 일정 캐시 로드
    const [weatherCache, calendarCache] = await Promise.all([
      loadWeatherCache(),
      loadCalendarCache(),
    ]);

    // Redux store에 복원
    store.dispatch(
      restoreCacheState({
        weather: weatherCache,
        calendar: calendarCache,
      })
    );

    if (weatherCache || calendarCache) {
      console.log('✅ [InitCache] 캐시 복원 완료');
      if (weatherCache) {
        console.log('   - 날씨: ✓');
      }
      if (calendarCache) {
        console.log('   - 일정: ✓ (' + calendarCache.events.length + '개)');
      }
    } else {
      console.log('ℹ️ [InitCache] 복원할 캐시 없음');
    }
  } catch (error) {
    console.error('❌ [InitCache] 캐시 초기화 실패:', error);
  }
};