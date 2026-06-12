// src/services/calendar/calendarService.ts
// Google Calendar API - 자동 토큰 갱신 기능 추가
// ⭐ 401 에러 시 자동으로 토큰 갱신 후 재시도

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { store } from '../../store';
import { setCalendarCache } from '../../store/slices/cacheSlice';
import { 
  loadCalendarCache, 
  saveCalendarCache,
  isCacheExpired 
} from '../../utils/cacheManager';
import { CalendarCache, CalendarEventCache } from '../../types/cache';

const CALENDAR_API_BASE = 'https://www.googleapis.com/calendar/v3';

export interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
}

export interface CalendarError {
  error: true;
  message: string;
}

class CalendarService {
  /**
   * ⭐ 토큰 갱신 (401 에러 시 자동 호출)
   */
  private async refreshAccessToken(): Promise<string | null> {
    try {
      console.log('🔄 [CalendarService] 토큰 갱신 시작');
      
      // Google Sign-In에서 새 토큰 받기
      const tokens = await GoogleSignin.getTokens();
      
      if (tokens.accessToken) {
        await AsyncStorage.setItem('calendarToken', tokens.accessToken);
        console.log('✅ [CalendarService] 토큰 갱신 완료');
        return tokens.accessToken;
      }
      
      console.error('❌ [CalendarService] 토큰 갱신 실패 - accessToken 없음');
      return null;
    } catch (error) {
      console.error('❌ [CalendarService] 토큰 갱신 실패:', error);
      return null;
    }
  }

  /**
   * 저장된 Calendar Access Token 가져오기
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      console.log('🔑 [CalendarService] 액세스 토큰 가져오기');
      
      // AsyncStorage에서 토큰 가져오기
      const token = await AsyncStorage.getItem('calendarToken');
      if (token) {
        console.log('✅ [CalendarService] 저장된 토큰 사용');
        return token;
      }

      console.log('⚠️ [CalendarService] 저장된 토큰 없음, 새로 발급');
      
      // 토큰이 없으면 새로 발급
      const tokens = await GoogleSignin.getTokens();
      
      if (tokens.accessToken) {
        await AsyncStorage.setItem('calendarToken', tokens.accessToken);
        console.log('✅ [CalendarService] 새 토큰 저장 완료');
        return tokens.accessToken;
      }

      console.warn('⚠️ [CalendarService] 토큰 발급 실패');
      return null;
    } catch (error) {
      console.error('❌ [CalendarService] 토큰 가져오기 실패:', error);
      return null;
    }
  }

  /**
   * ⭐ 오늘의 일정 가져오기 (자동 재시도 포함)
   */
  async getTodayEvents(forceRefresh: boolean = false): Promise<CalendarEvent[] | CalendarError> {
    try {
      console.log('📅 [CalendarService] 일정 조회 시작');
      
      // 게스트 계정 체크
      const userInfoString = await AsyncStorage.getItem('userInfo');
      if (userInfoString) {
        const userInfo = JSON.parse(userInfoString);
        const email = userInfo?.user?.email || '';
        
        if (email.endsWith('@orbit.guest')) {
          console.log('🚪 [CalendarService] 게스트 계정 - 빈 배열 반환');
          return [];
        }
      }
      
      // 캐시 확인 (강제 새로고침이 아닐 때만)
      if (!forceRefresh) {
        const cached = await loadCalendarCache();
        if (cached && !isCacheExpired(cached.timestamp)) {
          console.log('✅ [CalendarService] 캐시 사용');
          return cached.events.map(e => ({
            id: e.id,
            summary: e.title,
            start: e.startTime,
            end: e.endTime,
            location: e.location,
            description: e.description,
          }));
        }
      }
      
      // ⭐ API 호출 (자동 재시도 로직)
      return await this.fetchEventsWithRetry();
      
    } catch (error: any) {
      console.error('❌ [CalendarService] 일정 조회 실패:', error.message);
      
      // 실패 시 만료된 캐시라도 사용
      const staleCache = await loadCalendarCache();
      if (staleCache) {
        console.log('⚠️ [CalendarService] 만료된 캐시 사용');
        return staleCache.events.map(e => ({
          id: e.id,
          summary: e.title,
          start: e.startTime,
          end: e.endTime,
          location: e.location,
          description: e.description,
        }));
      }
      
      return {
        error: true,
        message: '일정을 불러올 수 없습니다',
      };
    }
  }

  /**
   * ⭐ API 호출 + 401 에러 시 자동 재시도
   */
  private async fetchEventsWithRetry(retryCount: number = 0): Promise<CalendarEvent[]> {
    const MAX_RETRIES = 1; // 1번만 재시도
    
    try {
      const accessToken = await this.getAccessToken();
      
      if (!accessToken) {
        throw new Error('액세스 토큰 없음');
      }

      // 오늘 범위 계산
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      console.log('📡 [CalendarService] API 호출');
      
      const url = `${CALENDAR_API_BASE}/calendars/primary/events`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          timeMin: startOfDay,
          timeMax: endOfDay,
          maxResults: 10,
          singleEvents: true,
          orderBy: 'startTime',
        },
        timeout: 10000,
      });

      console.log('✅ [CalendarService] API 성공, 일정:', response.data.items?.length || 0, '개');

      const events: CalendarEvent[] = response.data.items.map((item: any) => ({
        id: item.id,
        summary: item.summary || '(제목 없음)',
        start: item.start.dateTime || item.start.date,
        end: item.end.dateTime || item.end.date,
        location: item.location,
        description: item.description,
      }));
      
      // 캐시 저장
      const cacheData: CalendarCache = {
        events: events.map(e => ({
          id: e.id,
          title: e.summary,
          startTime: e.start,
          endTime: e.end,
          location: e.location,
          description: e.description,
        })),
        timestamp: Date.now(),
      };
      
      await saveCalendarCache(cacheData);
      store.dispatch(setCalendarCache(cacheData));
      
      return events;
      
    } catch (error: any) {
      // ⭐ 401 에러 처리 (토큰 갱신 후 재시도)
      if (error.response?.status === 401 && retryCount < MAX_RETRIES) {
        console.warn('⚠️ [CalendarService] 401 에러 - 토큰 갱신 후 재시도');
        
        // 기존 토큰 삭제
        await AsyncStorage.removeItem('calendarToken');
        
        // 토큰 갱신
        const newToken = await this.refreshAccessToken();
        
        if (newToken) {
          console.log('🔄 [CalendarService] 재시도 중...');
          return await this.fetchEventsWithRetry(retryCount + 1);
        }
      }
      
      throw error;
    }
  }

  /**
   * 시간 포맷팅
   */
  formatTime(isoString: string): string {
    try {
      const date = new Date(isoString);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      return '';
    }
  }

  /**
   * 종일 일정 확인
   */
  isAllDayEvent(start: string): boolean {
    return !start.includes('T');
  }

  /**
   * 일정 개수 가져오기
   */
  async getTodayEventCount(): Promise<number> {
    const events = await this.getTodayEvents();
    if ('error' in events) {
      return 0;
    }
    return events.length;
  }
}

export default new CalendarService();