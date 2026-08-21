// src/screens/Home/components/WeatherWidget.tsx
// 실제 날씨 정보와 Google Calendar 일정을 표시하는 위젯
// 게스트 로그인 시 날씨만 표시
// ★ 일정은 앱 실행 시 항상 새로 가져옴 (캐시 사용 안 함)

import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import weatherService, { WeatherData } from '../../../services/weather/weatherService';
import calendarService, { CalendarEvent } from '../../../services/calendar/calendarService';
import { AuthService } from '../../../services/auth/AuthServices';
import { Colors } from '../../../constants/colors';
import { styles } from '../HomeScreen.styles';

export const WeatherWidget: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [locationError, setLocationError] = useState(false);
  const [calendarError, setCalendarError] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    checkLoginType();
    loadData();
  }, []);

  /**
   * 로그인 타입 확인
   */
  const checkLoginType = async () => {
    const loginType = await AuthService.getLoginType();
    const guestMode = loginType === 'guest';
    setIsGuest(guestMode);
  };

  /**
   * 날씨 및 일정 데이터 로드
   */
  const loadData = async () => {
    setLoading(true);
    setLocationError(false);
    setCalendarError(false);

    // 1. 위치 권한 요청 및 날씨 정보 가져오기
    await loadWeather();

    // 2. 게스트가 아닐 때만 Google Calendar 일정 가져오기
    const loginType = await AuthService.getLoginType();
    if (loginType !== 'guest') {
      await loadCalendar();
    } else {
    }

    setLoading(false);
  };

  /**
   * 날씨 정보 로드
   */
  const loadWeather = async () => {
    try {
      
      // 위치 권한 요청
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        console.warn('⚠️ [Weather] 위치 권한 거부됨');
        setLocationError(true);
        return;
      }

      
      // 현재 위치 가져오기
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });


      
      // 날씨 정보 조회
      const weatherData = await weatherService.getWeatherByCoords(
        location.coords.latitude,
        location.coords.longitude
      );

      if ('error' in weatherData) {
        console.error('❌ [Weather] 날씨 조회 실패:', weatherData.message);
        setLocationError(true);
      } else {
        setWeather(weatherData);
      }
    } catch (error) {
      console.error('❌ [Weather] 예외 발생:', error);
      if (error instanceof Error) {
        console.error('   - 에러 메시지:', error.message);
        console.error('   - 에러 스택:', error.stack);
      }
      setLocationError(true);
    }
  };

  /**
   * Google Calendar 일정 로드
   * ★ 항상 강제 새로고침 (forceRefresh = true)
   */
  const loadCalendar = async () => {
    try {
      
      // ★ forceRefresh = true로 캐시 무시하고 항상 새로 가져옴
      const eventsData = await calendarService.getTodayEvents(true);

      if ('error' in eventsData) {
        console.warn('⚠️ [Calendar] 일정 조회 실패:', eventsData.message);
        setCalendarError(true);
      } else {
        if (eventsData.length > 0) {
          eventsData.forEach((event, index) => {
          });
        }
        setEvents(eventsData);
      }
    } catch (error) {
      console.error('❌ [Calendar] 예외 발생:', error);
      if (error instanceof Error) {
        console.error('   - 에러 메시지:', error.message);
      }
      setCalendarError(true);
    }
  };

  /**
   * 새로고침
   */
  const handleRefresh = () => {
    loadData();
  };

  /**
   * 위치 권한 재요청
   */
  const handleRequestLocationPermission = async () => {
    Alert.alert(
      '위치 권한 필요',
      '날씨 정보를 가져오려면 위치 권한이 필요합니다. 설정에서 권한을 허용해주세요.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '설정으로 이동',
          onPress: () => {
            // 설정 앱으로 이동 (iOS/Android)
            if (Location.openSettings) {
              Location.openSettings();
            }
          },
        },
      ]
    );
  };

  // 로딩 중
  if (loading) {
    return (
      <View style={styles.weatherContainer}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.weatherContainer}>
      {/* 날씨 섹션 */}
      <View style={[styles.weatherSection, isGuest && { flex: 1, paddingRight: 0 }]}>
        {locationError ? (
          <TouchableOpacity onPress={handleRequestLocationPermission}>
            <View style={styles.weatherMain}>
              <Ionicons name="location-outline" size={32} color={Colors.textTertiary} />
              <View style={styles.weatherInfo}>
                <Text style={styles.weatherTemp}>위치 권한 필요</Text>
                <Text style={styles.weatherDesc}>탭하여 권한 허용</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : weather ? (
          <>
            <View style={styles.weatherMain}>
              <Ionicons
                name={weatherService.getWeatherIonicon(weather.icon) as any}
                size={40}
                color={Colors.primary}
              />
              <View style={styles.weatherInfo}>
                <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
                <Text style={styles.weatherDesc}>{weather.description}</Text>
              </View>
            </View>
            <View style={styles.weatherDetails}>
              <View style={styles.weatherDetailItem}>
                <Ionicons name="water-outline" size={14} color={Colors.textTertiary} />
                <Text style={styles.weatherDetailText}>{weather.humidity}%</Text>
              </View>
              <View style={styles.weatherDetailItem}>
                <Ionicons name="speedometer-outline" size={14} color={Colors.textTertiary} />
                <Text style={styles.weatherDetailText}>{weather.windSpeed}m/s</Text>
              </View>
            </View>
          </>
        ) : (
          <TouchableOpacity onPress={handleRefresh}>
            <Text style={styles.weatherDesc}>날씨 정보를 불러올 수 없습니다</Text>
            <Text style={styles.weatherDetailText}>탭하여 재시도</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 게스트가 아닐 때만 구분선과 일정 섹션 표시 */}
      {!isGuest && (
        <>
          {/* 구분선 */}
          <View style={styles.divider} />

          {/* 일정 섹션 */}
          <View style={styles.scheduleSection}>
            <Text style={styles.scheduleTitle}>오늘의 일정</Text>

            {calendarError ? (
              <Text style={styles.weatherDetailText}>일정을 불러올 수 없습니다</Text>
            ) : events.length === 0 ? (
              <View style={styles.scheduleList}>
                <View style={styles.scheduleItem}>
                  <Ionicons name="calendar-outline" size={16} color={Colors.textTertiary} />
                  <Text style={styles.scheduleText}>예정된 일정이 없습니다</Text>
                </View>
              </View>
            ) : (
              <View style={styles.scheduleList}>
                {events.slice(0, 3).map((event) => (
                  <View key={event.id} style={styles.scheduleItem}>
                    <Text style={styles.scheduleTime}>
                      {calendarService.isAllDayEvent(event.start)
                        ? '종일'
                        : calendarService.formatTime(event.start)}
                    </Text>
                    <Text style={styles.scheduleText} numberOfLines={1}>
                      {event.summary}
                    </Text>
                  </View>
                ))}
                {events.length > 3 && (
                  <Text style={styles.weatherDetailText}>외 {events.length - 3}개</Text>
                )}
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
};