// src/types/clothes.ts
// 의류 관련 TypeScript 타입을 정의
// 서버 API와 매칭되도록 업데이트

// ============================================
// 서버 API Response Types
// ============================================

/**
 * 서버에서 반환하는 의류 데이터 구조
 * ⭐ v2.2: image_url 필드 추가 (전체 URL 반환)
 */
export interface ClothesApiResponse {
  id: number;
  main_category: string;
  main_category_display: string;
  sub_category: string;
  name: string;
  color: string;
  detail: string | null;
  image: string | null; // 파일 경로 (예: "/media/clothes/xxx.jpg")
  image_url: string | null; // ⭐ 전체 URL (예: "http://서버주소/media/clothes/xxx.jpg")
  created_at: string;
  updated_at: string;
}

/**
 * 의류 목록 API 응답
 */
export interface ClothesListResponse {
  count: number;
  results: ClothesApiResponse[];
}

/**
 * 의류 생성 요청 데이터
 */
export interface ClothesCreateRequest {
  main_category: string;
  sub_category: string;
  name: string;
  color: string;
  detail?: string;
  image?: any; // FormData의 File 객체
}

/**
 * 의류 수정 요청 데이터
 */
export interface ClothesUpdateRequest {
  name?: string;
  color?: string;
  detail?: string;
  image?: any;
}

// ============================================
// Clothes Types (서버와 동일)
// ============================================

export type ClothesType = 
  | 'TOP'      // 상의
  | 'BOTTOM'   // 하의
  | 'OUTER'    // 아우터
  | 'DRESS'    // 원피스
  | 'SHOES'    // 신발
  | 'BAG'      // 가방
  | 'ACC';     // 악세서리

export const CLOTHES_TYPE_LABELS: Record<ClothesType, string> = {
  TOP: '상의',
  BOTTOM: '하의',
  OUTER: '아우터',
  DRESS: '원피스',
  SHOES: '신발',
  BAG: '가방',
  ACC: '악세서리',
};

// ============================================
// 앱 내부 사용 타입 (기존 호환성 유지)
// ============================================

/**
 * 앱에서 사용하는 의류 아이템 인터페이스
 * API 응답을 변환하여 사용
 */
export interface ClothingItem {
  id: number;
  name: string;
  mainCategory: string; // main_category
  subCategory: string; // sub_category
  categoryDisplay: string; // main_category_display
  color: string;
  detail: string | null;
  imageUri: string | null; // ⭐ image_url의 전체 URL (서버에서 받은 그대로)
  hasImage: boolean; // image_url이 null이 아닌지 여부
  createdAt: string; // ISO 문자열로 저장 (Redux 직렬화 문제 해결)
  updatedAt: string; // ISO 문자열로 저장
}

/**
 * API 응답을 앱 내부 타입으로 변환
 * ⭐ v2.2: image_url을 imageUri로 매핑
 */
export function convertApiResponseToClothingItem(
  apiData: ClothesApiResponse
): ClothingItem {
  return {
    id: apiData.id,
    name: apiData.name,
    mainCategory: apiData.main_category,
    subCategory: apiData.sub_category,
    categoryDisplay: apiData.main_category_display,
    color: apiData.color,
    detail: apiData.detail,
    imageUri: apiData.image_url, // ⭐ 서버의 전체 URL 사용
    hasImage: !!apiData.image_url, // null이 아니면 true
    createdAt: apiData.created_at, // ISO 문자열 그대로 사용
    updatedAt: apiData.updated_at, // ISO 문자열 그대로 사용
  };
}

/**
 * 앱 내부 타입을 API 요청 형식으로 변환
 */
export function convertClothingItemToApiRequest(
  item: Partial<ClothingItem>
): Partial<ClothesCreateRequest> {
  return {
    main_category: item.mainCategory,
    sub_category: item.subCategory,
    name: item.name,
    color: item.color,
    detail: item.detail || undefined,
  };
}

// ============================================
// 필터링 및 통계
// ============================================

export interface ClothingFilter {
  mainCategory?: string;
  subCategory?: string;
  color?: string;
}

export interface ClosetStats {
  total: number;
  by_main_category: Record<string, { name: string; count: number }>;
}

// ============================================
// 업로드 관련 타입
// ============================================

export interface ClothingUpload {
  uri: string;
  base64?: string;
  width: number;
  height: number;
}

export interface BackgroundRemovalResult {
  originalUri: string;
  processedUri: string;
  maskUri?: string;
}

// ============================================
// UI 관련 타입
// ============================================

export type ViewMode = 'grid' | 'list';

export interface CategoryOption {
  type: ClothesType;
  label: string;
  icon: string;
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { type: 'TOP', label: '상의', icon: 'shirt' },
  { type: 'BOTTOM', label: '하의', icon: 'archive' },
  { type: 'OUTER', label: '아우터', icon: 'jacket' },
  { type: 'DRESS', label: '원피스', icon: 'dress' },
  { type: 'SHOES', label: '신발', icon: 'shoe-heel' },
  { type: 'BAG', label: '가방', icon: 'bag-personal' },
  { type: 'ACC', label: '악세서리', icon: 'watch' },
];