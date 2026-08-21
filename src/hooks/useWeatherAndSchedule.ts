// src/hooks/useWeatherAndSchedule.ts
// 날씨와 일정 데이터를 캐시 우선으로 로드하고 백그라운드에서 업데이트하는 훅

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import weatherService, { WeatherData } from '../services/weather/weatherService';
import calendarService, { CalendarEvent } from '../services/calendar/calendarService';
import * as Location from 'expo-location';

interface UseWeatherAndScheduleReturn {
  weather: WeatherData | null;
  events: CalendarEvent[];
  isLoading: boolean;
  isRefreshing: boolean; // 백그라운드 새로고침 중
  error: string | null;
  refresh: () => Promise<void>; // 수동 새로고침
}

/**
 * 날씨와 일정 데이터를 관리하는 커스텀 훅
 * 
 * 동작 방식:
 * 1. Redux 캐시 먼저 확인 → 있으면 즉시 표시
 * 2. 백그라운드에서 API 호출 → 업데이트된 데이터로 교체
 * 3. 사용자는 로딩 없이 즉시 데이터 확인 가능
 */
export const useWeatherAndSchedule = (): UseWeatherAndScheduleReturn => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redux 캐시 가져오기
  const weatherCache = useSelector((state: RootState) => state.cache.weather);
  const calendarCache = useSelector((state: RootState) => state.cache.calendar);

  /**
   * 초기 데이터 로드
   */
  useEffect(() => {
    loadData(true);
  }, []);

  /**
   * Redux 캐시를 먼저 표시
   */
  useEffect(() => {
    if (weatherCache) {
      setWeather({
        temp: weatherCache.temperature,
        feelsLike: weatherCache.temperature,
        humidity: weatherCache.humidity || 0,
        description: weatherCache.condition,
        icon: weatherCache.icon,
        windSpeed: weatherCache.windSpeed || 0,
        location: weatherCache.location || '현재 위치',
      });
    }
  }, [weatherCache]);

  useEffect(() => {
    if (calendarCache) {
      setEvents(calendarCache.events.map(e => ({
        id: e.id,
        summary: e.title,
        start: e.startTime,
        end: e.endTime,
        location: e.location,
        description: e.description,
      })));
    }
  }, [calendarCache]);

  /**
   * 데이터 로드 (캐시 우선 + 백그라운드 업데이트)
   */
  const loadData = async (isInitial: boolean = false) => {
    
    if (isInitial) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      // 병렬로 날씨와 일정 업데이트
      await Promise.all([
        loadWeather(),
        loadEvents(),
      ]);

    } catch (err) {
      console.error('❌ [useWeatherAndSchedule] 데이터 로드 실패:', err);
      setError('데이터를 불러오는 중 오류가 발생했습니다');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  /**
   * 날씨 데이터 로드
   */
  const loadWeather = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('⚠️ 위치 권한 없음');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });


      // forceRefresh = false: 캐시가 유효하면 캐시 사용, 만료되었으면 API 호출
      const weatherData = await weatherService.getWeatherByCoords(
        location.coords.latitude,
        location.coords.longitude,
        false // 캐시 우선
      );

      if (!('error' in weatherData)) {
        setWeather(weatherData);
      } else {
        console.error('❌ 날씨 로드 실패:', weatherData.message);
      }
    } catch (error) {
      console.error('❌ 날씨 로드 중 오류:', error);
    }
  };

  /**
   * 일정 데이터 로드
   */
  const loadEvents = async () => {
    try {
      // forceRefresh = false: 캐시가 유효하면 캐시 사용, 만료되었으면 API 호출
      const eventsData = await calendarService.getTodayEvents(false);

      if (!('error' in eventsData)) {
        setEvents(eventsData);
      } else {
        console.error('❌ 일정 로드 실패:', eventsData.message);
      }
    } catch (error) {
      console.error('❌ 일정 로드 중 오류:', error);
    }
  };

  /**
   * 수동 새로고침 (강제 업데이트)
   */
  const refresh = async () => {
    setIsRefreshing(true);

    try {
      // 강제로 API 호출
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const [weatherData, eventsData] = await Promise.all([
          weatherService.getWeatherByCoords(
            location.coords.latitude,
            location.coords.longitude,
            true // 강제 새로고침
          ),
          calendarService.getTodayEvents(true), // 강제 새로고침
        ]);

        if (!('error' in weatherData)) {
          setWeather(weatherData);
        }

        if (!('error' in eventsData)) {
          setEvents(eventsData);
        }

      }
    } catch (error) {
      console.error('❌ [useWeatherAndSchedule] 새로고침 실패:', error);
      setError('새로고침에 실패했습니다');
    } finally {
      setIsRefreshing(false);
    }
  };

  return {
    weather,
    events,
    isLoading: isLoading && !weatherCache && !calendarCache, // 캐시 있으면 로딩 표시 안함
    isRefreshing,
    error,
    refresh,
  };
};