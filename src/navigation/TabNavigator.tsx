// src/navigation/TabNavigator.tsx
// 확장 가능한 Dock - 홈에서는 날씨와 일정 표시
// ⭐️ 게스트 계정(@orbit.guest)은 일정 섹션 숨김

import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Dimensions, Text } from 'react-native';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useNavigation, CompositeNavigationProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { BlurView } from '@react-native-community/blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  withDelay,
  Easing,
  FadeInUp,
  FadeOutDown,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';

import HomeScreen from '../screens/Home';
import ClosetScreen from '../screens/Closet';
import OutfitScreen from '../screens/Outfit';
import SettingsScreen from '../screens/Settings';
import { RecommendScreen } from '../screens/Recommend';
import { MainTabParamList, RootStackParamList } from './types';
import { Colors } from '../constants/colors';
import { Spacing, Sizes } from '../constants/dimensions';
import { Typography } from '../constants/typography';

import weatherService, { WeatherData } from '../services/weather/weatherService';
import calendarService, { CalendarEvent } from '../services/calendar/calendarService';
import * as Location from 'expo-location';

// Redux
import { RootState } from '../store';
import { setWeatherCache, setCalendarCache } from '../store/slices/cacheSlice';
import { ActivityIndicator } from 'react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();
const { width } = Dimensions.get('window');

type CustomTabBarNavigationProp = CompositeNavigationProp<
  any,
  StackNavigationProp<RootStackParamList>
>;

const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  const parentNavigation = navigation.getParent<CustomTabBarNavigationProp>();
  
  
  // Redux
  const dispatch = useDispatch();
  const weatherCache = useSelector((state: RootState) => state.cache.weather);
  const calendarCache = useSelector((state: RootState) => state.cache.calendar);
  // 실제 날씨 & 일정 데이터 상태
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  
  // ⭐️ 게스트 계정 여부 (일정 섹션 표시/숨김 결정)
  const [isGuestAccount, setIsGuestAccount] = useState(false);

  // Dock 높이 애니메이션 (홈에서만 확장)
  const dockHeight = useSharedValue(72);
  const weatherOpacity = useSharedValue(0);
  const weatherTranslateY = useSharedValue(30);
  
  // 물방울 렌즈 애니메이션
  const lensPositionX = useSharedValue(0);
  const lensOpacity = useSharedValue(0);
  const lensScale = useSharedValue(1);
  const lensBounce = useSharedValue(0);
  const lensDistortion = useSharedValue(1);
  
  // 탭 위치 계산
  const dockPadding = 32;
  const tabWidth = (width - 32 - dockPadding * 2) / 5;
  
  // 현재 홈 화면인지 확인
  const isHomeScreen = state.index === 0;
  
  // 홈 화면의 확장 상태 가져오기 (타입 캐스팅으로 오류 해결)
  const homeRoute = state.routes[0];
  const isHomeExpanded = (homeRoute?.params as MainTabParamList['Home'])?.isHomeExpanded || false;
  
  // ⭐️ 게스트 계정 체크
  useEffect(() => {
    const checkGuestAccount = async () => {
      try {
        const userInfoString = await AsyncStorage.getItem('userInfo');
        if (userInfoString) {
          const userInfo = JSON.parse(userInfoString);
          const email = userInfo?.user?.email || '';
          const isGuest = email.endsWith('@orbit.guest');
          setIsGuestAccount(isGuest);
          console.log('👤 [TabNavigator] 계정 타입:', isGuest ? '게스트' : '일반 사용자');
        }
      } catch (error) {
        console.error('❌ [TabNavigator] 계정 타입 확인 실패:', error);
      }
    };
    
    checkGuestAccount();
  }, []);
  
  // Redux 캐시 -> 로컬 state 동기화
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
      console.log('✅ [TabNavigator] Redux 캐시 → 날씨 표시');
    }
  }, [weatherCache]);

  useEffect(() => {
    if (calendarCache) {
      const cachedEvents = calendarCache.events.map((e: any) => ({
        id: e.id,
        summary: e.title,
        start: e.startTime,
        end: e.endTime,
        location: e.location,
        description: e.description,
      }));
      setEvents(cachedEvents);
      console.log('✅ [TabNavigator] Redux 캐시 → 일정 표시:' + cachedEvents.length + '개');
    }
  }, [calendarCache]);
  
  useEffect(() => {
    // 홈 화면에서만 Dock 확장
    if (isHomeScreen && !isHomeExpanded) {
      dockHeight.value = withSpring(160, {
        damping: 15,
        stiffness: 100,
      });
      weatherOpacity.value = withDelay(
        200,
        withTiming(1, { duration: 400 })
      );
      weatherTranslateY.value = withDelay(
        200,
        withSpring(0, { damping: 12, stiffness: 100 })
      );
    } else {
      dockHeight.value = withSpring(72, {
        damping: 15,
        stiffness: 100,
      });
      weatherOpacity.value = withTiming(0, { duration: 200 });
      weatherTranslateY.value = withTiming(30, { duration: 200 });
    }
  }, [isHomeScreen, isHomeExpanded]);
  
  // 날씨 & 일정 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      console.log('🔄 [TabNavigator] 날씨 & 일정 로드 시작');
      
      // ⭐️ 캘린더 캐시 완전 해제 (임시)
      await AsyncStorage.removeItem('calendarCache');
      console.log('🗓️ [TabNavigator] 캘린더 캐시 삭제 완료');

      
      // 날씨 로드
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          const weatherData = await weatherService.getWeatherByCoords(
            location.coords.latitude,
            location.coords.longitude
          );
          
          if (!('error' in weatherData)) {
            setWeather(weatherData);
            
            // Redux에 저장
            dispatch(setWeatherCache({
              temperature: weatherData.temp,
              condition: weatherData.description,
              icon: weatherData.icon,
              location: weatherData.location,
              humidity: weatherData.humidity,
              windSpeed: weatherData.windSpeed,
              timestamp: Date.now(),
            }));
            console.log('✅ [TabNavigator] 날씨 로드 성공');
          }
        }
      } catch (error) {
        console.error('❌ [TabNavigator] 날씨 로드 실패:', error);
      }
      
      // 일정 로드 (게스트가 아닐 때만)
      if (!isGuestAccount) {
        try {
          const eventsData = await calendarService.getTodayEvents(true);
          if (!('error' in eventsData)) {
            setEvents(eventsData);
            
            // Redux에 저장
            dispatch(setCalendarCache({
              events: eventsData.map((e: any) => ({
                id: e.id,
                title: e.summary,
                startTime: e.start,
                endTime: e.end,
                location: e.location,
                description: e.description,
              })),
              timestamp: Date.now(),
            }));
            console.log('✅ [TabNavigator] 일정 로드 성공:', eventsData.length + '개');
          }
        } catch (error) {
          console.error('❌ [TabNavigator] 일정 로드 실패:', error);
        }
      } else {
        console.log('🚪 [TabNavigator] 게스트 계정 - 일정 로드 스킵');
      }
      
      setDataLoading(false);
    };
    
    // isGuestAccount가 결정된 후에만 loadData 실행
    if (isGuestAccount !== undefined) {
      loadData();
    }
  }, [isGuestAccount, dispatch]);
  
  useEffect(() => {
    const targetX = state.index * tabWidth + tabWidth / 2 + dockPadding;
    
    // 물방울 애니메이션
    lensPositionX.value = withSpring(targetX, {
      damping: 12,
      stiffness: 80,
      mass: 0.8,
    });
    
    lensOpacity.value = withTiming(0.4, { duration: 150 }, () => {
      lensOpacity.value = withDelay(
        300,
        withTiming(0, { 
          duration: 1500,
          easing: Easing.out(Easing.cubic)
        })
      );
    });
    
    lensScale.value = withTiming(0.85, { duration: 100 }, () => {
      lensScale.value = withSpring(1, { damping: 10, stiffness: 150 });
    });
    
    lensBounce.value = withTiming(-3, { duration: 150 }, () => {
      lensBounce.value = withSpring(0, { damping: 8, stiffness: 100 });
    });
    
    lensDistortion.value = withTiming(1.2, { duration: 100 }, () => {
      lensDistortion.value = withSpring(1, { damping: 10, stiffness: 120 });
    });
  }, [state.index]);
  
  // Dock 애니메이션 스타일
  const animatedDockStyle = useAnimatedStyle(() => {
    return {
      height: dockHeight.value,
    };
  });
  
  // 날씨/일정 영역 애니메이션
  const animatedWeatherStyle = useAnimatedStyle(() => {
    return {
      opacity: weatherOpacity.value,
      transform: [
        { translateY: weatherTranslateY.value },
      ],
    };
  });
  
  // 물방울 렌즈 애니메이션
  const animatedLensStyle = useAnimatedStyle(() => {
    return {
      opacity: lensOpacity.value,
      transform: [
        { translateX: lensPositionX.value - 40 },
        { translateY: lensBounce.value },
        { scaleX: lensDistortion.value },
        { scaleY: lensScale.value },
      ],
    };
  });
  
  const animatedFocusStyle = useAnimatedStyle(() => {
    return {
      opacity: lensOpacity.value * 0.8,
      transform: [
        { translateX: lensPositionX.value - 30 },
        { translateY: lensBounce.value - 1 },
        { scale: lensScale.value * 0.7 },
      ],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.glassBar, animatedDockStyle]}>
        {/* 블러 효과 */}
        <BlurView
          style={StyleSheet.absoluteFill}
          blurType="light"
          blurAmount={3}
          reducedTransparencyFallbackColor="transparent"
        />
        
        {/* 유리 레이어 */}
        <View style={styles.glassLayer} />
        
        {/* 상단 하이라이트 */}
        <View style={styles.topLine} />
        
        {/* 날씨와 일정 영역 - 홈에서만 표시 */}
        <Animated.View style={[
          isGuestAccount ? styles.weatherContainerFullWidth : styles.weatherContainer,
          animatedWeatherStyle
        ]}>
          {/* 날씨 정보 */}
          <View style={isGuestAccount ? styles.weatherSectionFullWidth : styles.weatherSection}>
            {dataLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
              </View>
            ) : weather ? (
              <>
                <View style={[
                  styles.weatherMain,
                  isGuestAccount && { alignSelf: 'center' }
                ]}>
                  <Ionicons 
                    name={weatherService.getWeatherIonicon(weather.icon) as any}
                    size={40} 
                    color={Colors.primary}
                  />
                  <View style={[
                    styles.weatherInfo,
                    isGuestAccount && { flex: 0 }
                  ]}>
                    <Text style={[styles.weatherLocation, isGuestAccount && { textAlign: 'center' }]}>
                      {weather.location}: {weather.temp}°
                    </Text>
                    <Text style={[styles.weatherDesc, isGuestAccount && { textAlign: 'center' }]}>{weather.description}</Text>
                  </View>
                </View>
                <View style={[
                  styles.weatherDetails,
                  isGuestAccount && { justifyContent: 'center' }
                ]}>
                  <View style={styles.weatherDetailItem}>
                    <Ionicons name="water-outline" size={12} color={Colors.textTertiary} />
                    <Text style={styles.weatherDetailText}>{weather.humidity}%</Text>
                  </View>
                  <View style={styles.weatherDetailItem}>
                    <Ionicons name="thermometer-outline" size={12} color={Colors.textTertiary} />
                    <Text style={styles.weatherDetailText}>체감 {weather.feelsLike}°</Text>
                  </View>
                </View>
              </>
            ) : (
              <Text style={styles.weatherDetailText}>날씨 정보를 불러올 수 없습니다</Text>
            )}
          </View>
          
          {/* ⭐️ 게스트가 아닐 때만 구분선과 일정 섹션 표시 */}
          {!isGuestAccount && (
            <>
              {/* 구분선 */}
              <View style={styles.divider} />
              
              {/* 일정 정보 */}
              <View style={styles.scheduleSection}>
                <Text style={styles.scheduleTitle}>오늘의 일정</Text>
                {dataLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={Colors.primary} />
                  </View>
                ) : events.length > 0 ? (
                  <View style={styles.scheduleList}>
                    {events.slice(0, 2).map((event) => (
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
                    {events.length > 2 && (
                      <Text style={styles.scheduleMoreText}>외 {events.length - 2}개</Text>
                    )}
                  </View>
                ) : (
                  <View style={styles.scheduleEmpty}>
                    <Ionicons name="calendar-outline" size={14} color={Colors.textTertiary} />
                    <Text style={styles.scheduleEmptyText}>예정된 일정이 없습니다</Text>
                  </View>
                )}
              </View>
            </>
          )}
        </Animated.View>
        
        {/* 물방울 렌즈 효과 */}
        <Animated.View style={[styles.lensDroplet, animatedLensStyle]}>
          <LinearGradient
            colors={[
              'rgba(140,140,150,0.15)',
              'rgba(200,200,210,0.25)',
              'rgba(220,220,230,0.3)',
              'rgba(200,200,210,0.25)',
              'rgba(140,140,150,0.15)',
            ]}
            locations={[0, 0.2, 0.5, 0.8, 1]}
            style={styles.dropletGradient}
          />
        </Animated.View>
        
        {/* 렌즈 중심 포커스 */}
        <Animated.View style={[styles.lensFocus, animatedFocusStyle]}>
          <View style={styles.focusInner} />
        </Animated.View>
        
        {/* 탭 아이템들 - 하단에 고정 */}
        <View style={styles.tabContainer}>
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const isCenter = route.name === 'AddClothes';

            const onPress = () => {
              if (isCenter) {
                // 중앙 버튼 - Recommend 탭으로 이동
                navigation.navigate('AddClothes');
              } else {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }
            };

            // 중앙 추가 버튼
            if (isCenter) {
              return (
                <TouchableOpacity
                  key={index}
                  style={styles.centerTab}
                  onPress={onPress}
                  activeOpacity={0.6}
                >
                  <View style={styles.plusButton}>
                    <Ionicons 
                      name="add" 
                      size={30} 
                      color={Colors.plusIcon}
                    />
                  </View>
                </TouchableOpacity>
              );
            }

            // 아이콘 이름 설정
            let iconName = 'home-outline';
            if (route.name === 'Home') iconName = 'home-outline';
            else if (route.name === 'Closet') iconName = 'shirt-outline';
            else if (route.name === 'Outfits') iconName = 'time-outline';
            else if (route.name === 'Profile') iconName = 'ellipsis-horizontal';

            return (
              <TouchableOpacity
                key={index}
                onPress={onPress}
                style={styles.tab}
                activeOpacity={0.6}
              >
                <View style={[
                  styles.iconContainer,
                  isFocused && styles.iconFocused,
                ]}
                >
                  <Ionicons 
                    name={iconName as any} 
                    size={28}
                    color={isFocused ? Colors.tabActive : Colors.tabInactive}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
};

const TabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Closet" component={ClosetScreen} />
      <Tab.Screen 
        name="AddClothes" 
        component={RecommendScreen}
      />
      <Tab.Screen name="Outfits" component={OutfitScreen} />
      <Tab.Screen name="Profile" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 25,
    left: 16,
    right: 16,
  },
  
  // 확장 가능한 유리 바
  glassBar: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 3,
  },
  
  glassLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.dockBackground,
    borderRadius: 24,
    borderWidth: 0.5,
    borderColor: Colors.dockBorder,
  },
  
  topLine: {
    position: 'absolute',
    top: 0,
    left: 30,
    right: 30,
    height: 0.3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  // 날씨와 일정 컨테이너 (일반 사용자)
  weatherContainer: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  // ⭐️ 게스트용 - 전체 너비 (일정 섹션 없음)
  weatherContainerFullWidth: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // 날씨 섹션 (일반 사용자)
  weatherSection: {
    flex: 1,
    paddingRight: 10,
    justifyContent: 'center',
  },
  
  // ⭐️ 게스트용 - 중앙 정렬
  weatherSectionFullWidth: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  weatherInfo: {
    marginLeft: 12,
    flex: 1,
  },
  weatherLocation: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  weatherDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  weatherDetails: {
    flexDirection: 'row',
    gap: 10,
  },
  weatherDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  weatherDetailText: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  
  // 구분선
  divider: {
    width: 1,
    height: 60,
    backgroundColor: Colors.weatherDivider,
    marginHorizontal: 15,
  },
  
  // 일정 섹션
  scheduleSection: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: 'center',
  },
  scheduleTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  scheduleList: {
    gap: 5,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleTime: {
    fontSize: 10,
    color: Colors.textTertiary,
    width: 32,
    fontWeight: '500',
  },
  scheduleText: {
    fontSize: 11,
    color: Colors.textPrimary,
    flex: 1,
  },
  scheduleDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primary,
  },
  scheduleMoreText: {
    fontSize: 9,
    color: Colors.textTertiary,
    marginTop: 2,
    marginLeft: 38,
  },
  scheduleEmpty: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  scheduleEmptyText: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  
  // 물방울 렌즈 스타일
  lensDroplet: {
    position: 'absolute',
    left: 0,
    bottom: 8,
    width: 80,
    height: 56,
    borderRadius: 28,
  },
  
  dropletGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  
  lensFocus: {
    position: 'absolute',
    left: 0,
    bottom: 20,
    width: 60,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  focusInner: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(240, 240, 245, 0.2)',
    shadowColor: '#FFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  
  // 탭 컨테이너 - 하단에 고정
  tabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 1,
  },
  
  tab: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  centerTab: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  iconContainer: {
    padding: 10,
  },
  
  iconFocused: {
    transform: [{ scale: 1.08 }],
  },
  
  plusButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: Colors.plusButton,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TabNavigator;