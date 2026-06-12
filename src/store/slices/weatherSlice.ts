// src/store/slices/weatherSlice.ts
// 날씨 및 일정 데이터를 중앙 관리하는 Redux slice

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import weatherService, { WeatherData } from '../../services/weather/weatherService';
import calendarService, { CalendarEvent } from '../../services/calendar/calendarService';
import * as Location from 'expo-location';

interface WeatherState {
  weather: WeatherData | null;
  events: CalendarEvent[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
}

const initialState: WeatherState = {
  weather: null,
  events: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

/**
 * 날씨 데이터 가져오기 (Async Thunk)
 */
export const fetchWeather = createAsyncThunk(
  'weather/fetchWeather',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🌤️ [Redux] 날씨 데이터 로드 시작');
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('위치 권한이 필요합니다');
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const weatherData = await weatherService.getWeatherByCoords(
        location.coords.latitude,
        location.coords.longitude
      );

      if ('error' in weatherData) {
        throw new Error(weatherData.message);
      }

      console.log('✅ [Redux] 날씨 데이터 로드 성공');
      return weatherData;
    } catch (error: any) {
      console.error('❌ [Redux] 날씨 데이터 로드 실패:', error);
      return rejectWithValue(error.message || '날씨 정보를 불러올 수 없습니다');
    }
  }
);

/**
 * 일정 데이터 가져오기 (Async Thunk)
 */
export const fetchEvents = createAsyncThunk(
  'weather/fetchEvents',
  async (forceRefresh: boolean = true, { rejectWithValue }) => {
    try {
      console.log('📅 [Redux] 일정 데이터 로드 시작');
      
      const eventsData = await calendarService.getTodayEvents(forceRefresh);

      if ('error' in eventsData) {
        throw new Error(eventsData.message);
      }

      console.log('✅ [Redux] 일정 데이터 로드 성공:', eventsData.length + '개');
      return eventsData;
    } catch (error: any) {
      console.error('❌ [Redux] 일정 데이터 로드 실패:', error);
      return rejectWithValue(error.message || '일정 정보를 불러올 수 없습니다');
    }
  }
);

/**
 * 날씨 + 일정 동시 로드
 */
export const fetchWeatherAndEvents = createAsyncThunk(
  'weather/fetchWeatherAndEvents',
  async ({ isGuest }: { isGuest: boolean }, { dispatch }) => {
    console.log('🔄 [Redux] 날씨 + 일정 동시 로드 시작');
    
    // 날씨는 항상 로드
    await dispatch(fetchWeather());
    
    // 게스트가 아니면 일정도 로드
    if (!isGuest) {
      await dispatch(fetchEvents(true));
    }
    
    console.log('✅ [Redux] 날씨 + 일정 동시 로드 완료');
  }
);

const weatherSlice = createSlice({
  name: 'weather',
  initialState,
  reducers: {
    clearWeatherData: (state) => {
      state.weather = null;
      state.events = [];
      state.error = null;
      state.lastUpdated = null;
    },
  },
  extraReducers: (builder) => {
    // fetchWeather
    builder.addCase(fetchWeather.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchWeather.fulfilled, (state, action: PayloadAction<WeatherData>) => {
      state.weather = action.payload;
      state.lastUpdated = Date.now();
      state.isLoading = false;
    });
    builder.addCase(fetchWeather.rejected, (state, action) => {
      state.error = action.payload as string;
      state.isLoading = false;
    });

    // fetchEvents
    builder.addCase(fetchEvents.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchEvents.fulfilled, (state, action: PayloadAction<CalendarEvent[]>) => {
      state.events = action.payload;
      state.lastUpdated = Date.now();
      state.isLoading = false;
    });
    builder.addCase(fetchEvents.rejected, (state, action) => {
      state.error = action.payload as string;
      state.isLoading = false;
    });

    // fetchWeatherAndEvents
    builder.addCase(fetchWeatherAndEvents.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchWeatherAndEvents.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(fetchWeatherAndEvents.rejected, (state, action) => {
      state.error = action.error.message || '데이터를 불러올 수 없습니다';
      state.isLoading = false;
    });
  },
});

export const { clearWeatherData } = weatherSlice.actions;
export default weatherSlice.reducer;

// Selectors
export const selectWeather = (state: any) => state.weather.weather;
export const selectEvents = (state: any) => state.weather.events;
export const selectIsLoading = (state: any) => state.weather.isLoading;
export const selectError = (state: any) => state.weather.error;
export const selectLastUpdated = (state: any) => state.weather.lastUpdated;