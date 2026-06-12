// src/api/client.ts
// API 클라이언트 설정 및 메서드 정의
// ⭐ v4.0: 코디 추천 API 추가
// ⭐ v4.1: body_photo 필드 추가
// ⭐ v4.2: updateProfileWithPhoto 메서드 추가
// ⭐ v5.1: 가상 착용 이미지 생성 API 추가
// ⭐ v5.2: 코디네이션 상세 조회 메서드 추가 (이미지 polling용)

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// API 기본 설정
const API_BASE_URL = 'http://YOUR_SERVER_IP:8000/api'; 

// Axios 인스턴스 생성
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30초 타임아웃
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 토큰 자동 추가
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      if (token) {
        config.headers.Authorization = `Token ${token}`;
      }
    } catch (error) {
      console.error('[API] 토큰 로드 실패:', error);
    }
    
    // 로깅 (개발용)
    console.log('[API Request]', config.method?.toUpperCase(), config.url);
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 처리
apiClient.interceptors.response.use(
  (response) => {
    // 로깅 (개발용)
    console.log('[API Response]', response.config.url, response.status);
    return response;
  },
  async (error: AxiosError) => {
    console.error('[API Response Error]', error.response?.status, error.message);
    
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 인증 실패: 토큰 만료 또는 무효
          console.log('[API] 인증 실패 - 재로그인 필요');
          await AsyncStorage.removeItem('auth_token');
          break;
        case 403:
          Alert.alert('권한 없음', '이 작업을 수행할 권한이 없습니다.');
          break;
        case 404:
          console.log('[API] 리소스를 찾을 수 없음');
          break;
        case 500:
          Alert.alert('서버 오류', '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
          break;
      }
    } else if (error.request) {
      console.error('[API] 응답 없음:', error.request);
      Alert.alert('네트워크 오류', '서버와 연결할 수 없습니다. 인터넷 연결을 확인해주세요.');
    } else {
      console.error('[API] 요청 설정 오류:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Google 로그인 타입
export interface GoogleLoginRequest {
  email: string;
  google_id: string;
  name: string;
  profile_picture?: string;
  id_token?: string;
}

export interface GoogleLoginResponse {
  success: boolean;
  is_new_user: boolean;
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    google_id: string;
    profile_picture?: string;
    first_name: string;
    last_name: string;
    sex?: string;
    height?: number;
    weight?: number;
    body_photo?: string;        // ⭐ 추가: 파일 경로
    body_photo_url?: string;    // ⭐ 추가: 전체 URL
    created_at: string;
    updated_at: string;
  };
  message: string;
}

// ⭐ Gemini AI 분석 응답 타입
export interface AIAnalysisResponse {
  status: 'analyzing' | 'completed' | 'error';
  progress: number;
  message: string;
  detail?: string;
}

// ⭐ 코디 추천 요청/응답 타입
export interface OutfitRecommendationRequest {
  recommendation_type: 'weather' | 'schedule' | 'ai';
  weather_data?: {
    temp: number;
    feels_like: number;
    description: string;
    humidity: number;
    wind_speed: number;
  };
  calendar_events?: Array<{
    title: string;
    start_time: string;
    end_time: string;
    description?: string;
  }>;
  style_preference?: string; // 사용자 스타일 선호도 (옵션)
}

export interface OutfitRecommendationResponse {
  success: boolean;
  coordination_id?: number; // ⭐ v5.0: DB에 저장된 코디네이션 ID
  error?: string;
  retry?: boolean; // ⭐ v5.0: 중복인 경우 재시도 지시
  message?: string;
  recommendation?: {
    outfit_title: string;
    outfit_description: string;
    top: {
      id: number;
      name: string;
      color: string;
    } | null;
    bottom: {
      id: number;
      name: string;
      color: string;
    } | null;
    outer: {
      id: number;
      name: string;
      color: string;
    } | null;
    reason: string;
    style_tips: string;
  };
}

// ⭐ v5.1: 가상 착용 이미지 생성 응답 타입
export interface VirtualTryOnGenerationResponse {
  success: boolean;
  coordination_id: number;
  image_url?: string;
  message: string;
  error?: string;
}

// ⭐ v5.2: 코디네이션 상세 조회 응답 타입 (이미지 polling용)
export interface CoordinationDetailResponse {
  id: number;
  name?: string;
  outfit_title?: string;
  title?: string;
  occasion?: string;
  description?: string;
  reason?: string;
  outfit_description?: string;  // ⭐ 추가
  ai_description?: string;       // ⭐ 추가
  style_tips?: string;
  styling_tips?: string;         // ⭐ 추가
  tips?: string;                 // ⭐ 추가
  top?: {
    id: number;
    name: string;
    category?: string;
    color: string;
    main_color?: string;         // ⭐ 추가
  };
  bottom?: {
    id: number;
    name: string;
    category?: string;
    color: string;
    main_color?: string;         // ⭐ 추가
  };
  outer?: {
    id: number;
    name: string;
    category?: string;
    color: string;
    main_color?: string;         // ⭐ 추가
  };
  virtual_tryon_image_url?: string;  // ⭐ 핵심: 가상 착용 이미지 URL
  virtual_tryon_image?: string;       // 대체 필드명
  image_url?: string;                 // 대체 필드명
  created_at?: string;
  updated_at?: string;
  is_favorite?: boolean;
}

// API 메서드들
export const API = {
  // 연결 테스트
  testConnection: () => apiClient.get('/accounts/test/'),
  
  // 인증 관련
  auth: {
    googleLogin: (data: GoogleLoginRequest) => 
      apiClient.post<GoogleLoginResponse>('/accounts/auth/google/', data),
  },
  
  // 사용자 프로필
  user: {
    getProfile: () => apiClient.get('/accounts/user/profile/'),
    updateProfile: (data: Partial<{
      sex: string;
      height: number;
      weight: number;
      first_name: string;
      last_name: string;
    }>) => apiClient.patch('/accounts/user/profile/', data),
    
    // ⭐ 전신사진 포함 프로필 업데이트
    updateProfileWithPhoto: (formData: FormData) => 
      apiClient.patch('/accounts/user/profile/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      }),
  },
  
  // 의류 관련
  clothes: {
    list: (type?: string) => {
      const params = type ? { type } : {};
      return apiClient.get('/accounts/clothes/', { params });
    },
    
    create: (data: FormData | any) => {
      const isFormData = data instanceof FormData;
      
      console.log('[API] clothes.create 호출');
      console.log('[API] FormData 여부:', isFormData);
      
      return apiClient.post('/accounts/clothes/', data, {
        headers: isFormData ? {
          'Content-Type': 'multipart/form-data',
        } : {
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      } as AxiosRequestConfig);
    },
    
    get: (id: number) => apiClient.get(`/accounts/clothes/${id}/`),
    
    update: (id: number, data: FormData | any) => {
      const isFormData = data instanceof FormData;
      return apiClient.put(`/accounts/clothes/${id}/`, data, {
        headers: isFormData ? {
          'Content-Type': 'multipart/form-data',
        } : undefined,
        timeout: 60000,
      } as AxiosRequestConfig);
    },
    
    // ⭐ 부분 수정용 PATCH 메서드 (이름, 서브카테고리 등 일부만 수정할 때 사용)
    patch: (id: number, data: any) => {
      console.log('[API] clothes.patch 호출 - 부분 수정');
      return apiClient.patch(`/accounts/clothes/${id}/`, data, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      } as AxiosRequestConfig);
    },
    
    delete: (id: number) => apiClient.delete(`/accounts/clothes/${id}/`),
    stats: () => apiClient.get('/accounts/clothes/stats/'),
    
    // Gemini AI 분석
    analyzeWithAI: (formData: FormData) => {
      console.log('[API] Gemini AI 분석 요청 시작');
      return apiClient.post<AIAnalysisResponse>(
        '/accounts/clothes/analyze/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 120000,
        }
      );
    },
  },
  
  // ⭐ 코디 추천 API (NEW!)
  outfit: {
    /**
     * AI 기반 코디 추천
     * @param data 추천 요청 데이터 (날씨, 일정 등)
     * @returns 추천된 코디 정보
     */
    recommend: (data: OutfitRecommendationRequest) => {
      console.log('[API] 코디 추천 요청:', data.recommendation_type);
      return apiClient.post<OutfitRecommendationResponse>(
        '/accounts/outfit/recommend/',
        data,
        {
          timeout: 60000, // AI 처리는 1분
        }
      );
    },
  },
  
  // 코디네이션 관련
  coordinations: {
    /**
     * 코디네이션 목록 조회
     * @param is_favorite 즐겨찾기만 조회할지 여부
     * @returns 코디네이션 목록
     */
    list: (is_favorite?: boolean) => {
      const params = is_favorite !== undefined ? { is_favorite } : {};
      return apiClient.get('/accounts/coordinations/', { params });
    },
    
    /**
     * 새 코디네이션 생성
     * @param data 코디네이션 데이터
     * @returns 생성된 코디네이션 정보
     */
    create: (data: FormData | any) => {
      const isFormData = data instanceof FormData;
      return apiClient.post('/accounts/coordinations/', data, {
        headers: isFormData ? {
          'Content-Type': 'multipart/form-data',
        } : undefined,
        timeout: 60000,
      } as AxiosRequestConfig);
    },
    
    /**
     * ⭐ v5.2: 코디네이션 상세 조회 (이미지 polling용)
     * @param id 코디네이션 ID
     * @returns 코디네이션 상세 정보 (가상 착용 이미지 URL 포함)
     */
    get: (id: number) => {
      console.log('[API] 코디네이션 상세 조회:', id);
      return apiClient.get<CoordinationDetailResponse>(`/accounts/coordinations/${id}/`);
    },
    
    /**
     * 코디네이션 수정
     * @param id 코디네이션 ID
     * @param data 수정할 데이터
     * @returns 수정된 코디네이션 정보
     */
    update: (id: number, data: FormData | any) => {
      const isFormData = data instanceof FormData;
      return apiClient.put(`/accounts/coordinations/${id}/`, data, {
        headers: isFormData ? {
          'Content-Type': 'multipart/form-data',
        } : undefined,
        timeout: 60000,
      } as AxiosRequestConfig);
    },
    
    /**
     * 코디네이션 삭제
     * @param id 코디네이션 ID
     */
    delete: (id: number) => apiClient.delete(`/accounts/coordinations/${id}/`),
    
    /**
     * 즐겨찾기 토글
     * @param id 코디네이션 ID
     */
    toggleFavorite: (id: number) => 
      apiClient.post(`/accounts/coordinations/${id}/favorite/`),
    
    /**
     * ⭐ v5.1: 가상 착용 이미지 생성
     * @param coordinationId 코디네이션 ID
     * @returns 생성된 이미지 URL
     */
    generateVirtualTryOn: (coordinationId: number) => {
      console.log('[API] 가상 착용 이미지 생성 요청:', coordinationId);
      return apiClient.post<VirtualTryOnGenerationResponse>(
        `/accounts/coordinations/${coordinationId}/generate-tryon/`,
        {},
        {
          timeout: 120000, // 이미지 생성은 2분
        }
      );
    },
  },
};

export default apiClient;