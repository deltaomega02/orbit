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
    console.log('==========================================');
    console.log('🚀 WeatherWidget 마운트됨 - 데이터 로드 시작');
    console.log('==========================================');
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
    console.log('🔍 [WeatherWidget] 로그인 타입:', loginType, '(게스트:', guestMode, ')');
  };

  /**
   * 날씨 및 일정 데이터 로드
   */
  const loadData = async () => {
    console.log('🔍 [WeatherWidget] loadData 시작');
    setLoading(true);
    setLocationError(false);
    setCalendarError(false);

    // 1. 위치 권한 요청 및 날씨 정보 가져오기
    console.log('🌤️ [WeatherWidget] 날씨 정보 로드 시작...');
    await loadWeather();

    // 2. 게스트가 아닐 때만 Google Calendar 일정 가져오기
    const loginType = await AuthService.getLoginType();
    if (loginType !== 'guest') {
      console.log('📅 [WeatherWidget] 캘린더 일정 로드 시작...');
      await loadCalendar();
    } else {
      console.log('⚠️ [WeatherWidget] 게스트 모드 - 캘린더 로드 건너뜀');
    }

    setLoading(false);
    console.log('✅ [WeatherWidget] loadData 완료');
  };

  /**
   * 날씨 정보 로드
   */
  const loadWeather = async () => {
    try {
      console.log('🌍 [Weather] 1단계: 위치 권한 요청 시작');
      
      // 위치 권한 요청
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log(`🔐 [Weather] 위치 권한 상태: ${status}`);

      if (status !== 'granted') {
        console.warn('⚠️ [Weather] 위치 권한 거부됨');
        setLocationError(true);
        return;
      }

      console.log('📍 [Weather] 2단계: 현재 위치 가져오기 시작');
      
      // 현재 위치 가져오기
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      console.log('✅ [Weather] 위치 가져오기 성공:');
      console.log(`   - 위도: ${location.coords.latitude}`);
      console.log(`   - 경도: ${location.coords.longitude}`);

      console.log('🌤️ [Weather] 3단계: 날씨 API 호출 시작');
      
      // 날씨 정보 조회
      const weatherData = await weatherService.getWeatherByCoords(
        location.coords.latitude,
        location.coords.longitude
      );

      if ('error' in weatherData) {
        console.error('❌ [Weather] 날씨 조회 실패:', weatherData.message);
        setLocationError(true);
      } else {
        console.log('✅ [Weather] 날씨 정보 성공:');
        console.log(`   - 온도: ${weatherData.temp}°C`);
        console.log(`   - 날씨: ${weatherData.description}`);
        console.log(`   - 습도: ${weatherData.humidity}%`);
        console.log(`   - 풍속: ${weatherData.windSpeed}m/s`);
        console.log(`   - 위치: ${weatherData.location}`);
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
      console.log('📅 [Calendar] 일정 조회 시작 (강제 새로고침)');
      
      // ★ forceRefresh = true로 캐시 무시하고 항상 새로 가져옴
      const eventsData = await calendarService.getTodayEvents(true);

      if ('error' in eventsData) {
        console.warn('⚠️ [Calendar] 일정 조회 실패:', eventsData.message);
        setCalendarError(true);
      } else {
        console.log('✅ [Calendar] 일정 조회 성공:');
        console.log(`   - 오늘의 일정: ${eventsData.length}개`);
        if (eventsData.length > 0) {
          eventsData.forEach((event, index) => {
            console.log(`   ${index + 1}. ${event.summary} (${calendarService.formatTime(event.start)})`);
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