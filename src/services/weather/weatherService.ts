// src/services/weather/weatherService.ts
// 캐시 없이 매번 실시간 날씨/위치 조회 (한국어 지명 유지)

import axios from 'axios';

// OpenWeatherMap API 키
const WEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY';

// URL 상수
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const GEO_BASE_URL = 'https://api.openweathermap.org/geo/1.0';

export interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  description: string;
  icon: string;
  windSpeed: number;
  location: string;
}

export interface WeatherError {
  error: true;
  message: string;
}

class WeatherService {
  /**
   * 위도/경도 기반 날씨 정보 가져오기
   * 캐시 로직을 제거하여 항상 API를 호출합니다.
   */
  async getWeatherByCoords(
    latitude: number,
    longitude: number
  ): Promise<WeatherData | WeatherError> {
    console.log('\n========== 🌤️ 날씨 서비스 시작 (No Cache) ==========');
    console.log('🌐 [API] OpenWeatherMap 요청 시작 (항상 새로고침)...');
    console.log(`   - 좌표: ${latitude}, ${longitude}`);
    
    try {
      // 날씨 API + 지명 변환 API 병렬 요청
      const [weatherResponse, geoResponse] = await Promise.all([
        axios.get(`${WEATHER_BASE_URL}/weather`, {
          params: {
            lat: latitude,
            lon: longitude,
            appid: WEATHER_API_KEY,
            units: 'metric',
            lang: 'kr', // 한국어 날씨 설명 요청
          },
          timeout: 10000,
        }),
        axios.get(`${GEO_BASE_URL}/reverse`, {
          params: {
            lat: latitude,
            lon: longitude,
            limit: 1,
            appid: WEATHER_API_KEY,
          },
          timeout: 10000,
        }).catch((err) => {
          // 지명 변환 실패 시 로그만 남기고 빈 배열 반환 (날씨 정보는 살리기 위해)
          console.error('❌ [API] 지명 변환 요청 실패:', err.message);
          return { data: [] };
        })
      ]);

      const weatherDataRaw = weatherResponse.data;
      
      // 👇 [디버깅] 원본 이름 확인
      console.log(`📦 [API] 원본 날씨 데이터 내 지역명: "${weatherDataRaw.name}"`);
      
      // 👇 [핵심] 한국어 지명 추출 및 확인
      let finalLocationName = weatherDataRaw.name || 'Unknown';
      
      if (geoResponse.data && geoResponse.data.length > 0) {
        const geoData = geoResponse.data[0];
        
        // 전체 이름 데이터 로그 출력 (디버깅용)
        // console.log('🔍 [API] 지명 데이터(local_names) 수신:', JSON.stringify(geoData.local_names, null, 2));
        
        if (geoData.local_names && geoData.local_names.ko) {
          finalLocationName = geoData.local_names.ko;
          console.log(`🇰🇷 [성공] 한국어 지명 발견! -> "${finalLocationName}"`);
        } else {
          console.log('⚠️ [주의] 한국어(ko) 지명 데이터가 없습니다. 영어 이름을 사용합니다.');
        }
      } else {
        console.log('⚠️ [주의] Geocoding API 응답이 비어있습니다.');
      }

      console.log(`✅ [최종 적용] 위치 이름: "${finalLocationName}"`);

      // 최종 데이터 객체 생성
      const weatherData: WeatherData = {
        temp: Math.round(weatherDataRaw.main.temp),
        feelsLike: Math.round(weatherDataRaw.main.feels_like),
        humidity: weatherDataRaw.main.humidity,
        description: this.translateWeatherDescription(weatherDataRaw.weather[0].description),
        icon: weatherDataRaw.weather[0].icon,
        windSpeed: weatherDataRaw.wind.speed,
        location: finalLocationName, // 한국어 지명 적용
      };
      
      console.log('✅ [Complete] API 데이터 반환 완료');
      console.log('=======================================\n');
      
      return weatherData;

    } catch (error: any) {
      console.error('❌ [Error] API 요청 중 오류 발생:', error.message);

      // 캐시가 없으므로 에러 발생 시 즉시 에러 객체 반환
      return {
        error: true,
        message: '날씨 정보를 불러올 수 없습니다.',
      };
    }
  }

  /**
   * 날씨 설명 한글 번역 (API가 일부 영어로 주는 경우 대비)
   */
  private translateWeatherDescription(description: string): string {
    const translations: { [key: string]: string } = {
      'clear sky': '맑음', 'few clouds': '구름 조금', 'scattered clouds': '구름 많음',
      'broken clouds': '흐림', 'overcast clouds': '매우 흐림', 'shower rain': '소나기',
      'rain': '비', 'light rain': '약한 비', 'moderate rain': '보통 비',
      'heavy rain': '강한 비', 'thunderstorm': '뇌우', 'snow': '눈',
      'light snow': '약한 눈', 'mist': '안개', 'fog': '짙은 안개', 'haze': '실안개',
    };
    return translations[description.toLowerCase()] || description;
  }

  /**
   * OpenWeatherMap 아이콘 URL 반환
   */
  getWeatherIconUrl(iconCode: string): string {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  }

  /**
   * Ionicons 이름으로 변환 (앱 내 아이콘 사용 시)
   */
  getWeatherIonicon(iconCode: string): string {
    const iconMap: { [key: string]: string } = {
      '01d': 'sunny', '01n': 'moon', '02d': 'partly-sunny', '02n': 'cloudy-night',
      '03d': 'cloud', '03n': 'cloud', '04d': 'cloudy', '04n': 'cloudy',
      '09d': 'rainy', '09n': 'rainy', '10d': 'rainy', '10n': 'rainy',
      '11d': 'thunderstorm', '11n': 'thunderstorm', '13d': 'snow', '13n': 'snow',
      '50d': 'partly-sunny', '50n': 'cloudy-night',
    };
    return iconMap[iconCode] || 'cloud-outline';
  }

  /**
   * 기온별 옷차림 추천 텍스트 반환
   */
  getClothingRecommendation(temp: number): string {
    if (temp >= 28) return '민소매, 반팔, 반바지, 원피스';
    if (temp >= 23) return '반팔, 얇은 셔츠, 반바지, 면바지';
    if (temp >= 20) return '얇은 가디건, 긴팔, 면바지, 청바지';
    if (temp >= 17) return '얇은 니트, 맨투맨, 가디건, 청바지';
    if (temp >= 12) return '자켓, 가디건, 야상, 스타킹, 청바지';
    if (temp >= 9) return '자켓, 트렌치코트, 야상, 니트, 청바지';
    if (temp >= 5) return '코트, 가죽자켓, 히트텍, 니트, 레깅스';
    return '패딩, 두꺼운 코트, 목도리, 기모제품';
  }
}

export default new WeatherService();