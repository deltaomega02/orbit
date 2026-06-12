// src/store/slices/cacheSlice.ts
// 날씨 및 일정 캐시 데이터를 관리하는 Redux slice
// ⭐ v2.0: RESET_ALL 액션 처리 추가

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CacheState, WeatherCache, CalendarCache } from '../../types/cache';

const initialState: CacheState = {
  weather: null,
  calendar: null,
  lastUpdated: {
    weather: null,
    calendar: null,
  },
};

const cacheSlice = createSlice({
  name: 'cache',
  initialState,
  reducers: {
    /**
     * 날씨 캐시 업데이트
     */
    setWeatherCache: (state, action: PayloadAction<WeatherCache>) => {
      state.weather = action.payload;
      state.lastUpdated.weather = action.payload.timestamp;
    },

    /**
     * 일정 캐시 업데이트
     */
    setCalendarCache: (state, action: PayloadAction<CalendarCache>) => {
      state.calendar = action.payload;
      state.lastUpdated.calendar = action.payload.timestamp;
    },

    /**
     * 날씨 캐시 초기화
     */
    clearWeatherCache: (state) => {
      state.weather = null;
      state.lastUpdated.weather = null;
    },

    /**
     * 일정 캐시 초기화
     */
    clearCalendarCache: (state) => {
      state.calendar = null;
      state.lastUpdated.calendar = null;
    },

    /**
     * 모든 캐시 초기화
     */
    clearAllCache: (state) => {
      state.weather = null;
      state.calendar = null;
      state.lastUpdated.weather = null;
      state.lastUpdated.calendar = null;
    },

    /**
     * 전체 캐시 상태 복원 (앱 시작 시 AsyncStorage에서 로드)
     */
    restoreCacheState: (state, action: PayloadAction<Partial<CacheState>>) => {
      if (action.payload.weather) {
        state.weather = action.payload.weather;
        state.lastUpdated.weather = action.payload.weather.timestamp;
      }
      if (action.payload.calendar) {
        state.calendar = action.payload.calendar;
        state.lastUpdated.calendar = action.payload.calendar.timestamp;
      }
    },
  },
  extraReducers: (builder) => {
    // ⭐ ========== RESET_ALL (로그아웃 시 상태 초기화) ==========
    builder.addMatcher(
      (action) => action.type === 'RESET_ALL',
      () => {
        console.log('🔄 [cacheSlice] 상태 초기화');
        return initialState;
      }
    );
  },
});

export const {
  setWeatherCache,
  setCalendarCache,
  clearWeatherCache,
  clearCalendarCache,
  clearAllCache,
  restoreCacheState,
} = cacheSlice.actions;

export default cacheSlice.reducer;