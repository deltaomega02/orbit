// src/store/slices/closetSlice.ts
// 옷장 데이터를 관리하는 Redux slice
// 서버 API 연동 포함
// ⭐ v2.3: RESET_ALL 액션 처리 추가

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  ClothingItem, 
  ClothingFilter, 
  ClosetStats,
  ClothesApiResponse,
  ClothesListResponse,
  ClothesCreateRequest,
  ClothesUpdateRequest,
  convertApiResponseToClothingItem,
  ClothesType,
} from '../../types/clothes';
import { API } from '../../api/client';

// ============================================
// State 인터페이스
// ============================================

interface ClosetState {
  items: ClothingItem[];
  filteredItems: ClothingItem[];
  currentFilter: ClothingFilter;
  stats: ClosetStats | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetch: number | null; // 마지막 fetch 시간 (캐싱용)
}

const initialState: ClosetState = {
  items: [],
  filteredItems: [],
  currentFilter: {},
  stats: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetch: null,
};

// ============================================
// Async Thunks (서버 API 호출)
// ============================================

/**
 * 옷 목록 가져오기
 */
export const fetchClothes = createAsyncThunk(
  'closet/fetchClothes',
  async (type?: ClothesType, { rejectWithValue }) => {
    try {
      const response = await API.clothes.list(type);
      const data = response.data as ClothesListResponse;
      return data.results.map(convertApiResponseToClothingItem);
    } catch (error: any) {
      console.error('[fetchClothes] Error:', error);
      return rejectWithValue(
        error.response?.data?.error || '옷 목록을 불러오는데 실패했습니다.'
      );
    }
  }
);

/**
 * 새 옷 등록
 */
export const createClothes = createAsyncThunk(
  'closet/createClothes',
  async (data: ClothesCreateRequest, { rejectWithValue }) => {
    try {
      const response = await API.clothes.create(data);
      const apiData = response.data as ClothesApiResponse;
      return convertApiResponseToClothingItem(apiData);
    } catch (error: any) {
      console.error('[createClothes] Error:', error);
      return rejectWithValue(
        error.response?.data?.error || '옷 등록에 실패했습니다.'
      );
    }
  }
);

/**
 * 옷 정보 수정
 */
export const updateClothes = createAsyncThunk(
  'closet/updateClothes',
  async (
    { id, data }: { id: number; data: ClothesUpdateRequest },
    { rejectWithValue }
  ) => {
    try {
      // ⭐ data가 FormData인 경우는 update(PUT), 그 외는 patch(PATCH) 사용
      const isFormData = data instanceof FormData;
      const response = isFormData 
        ? await API.clothes.update(id, data)  // 이미지 포함 시 PUT
        : await API.clothes.patch(id, data);   // 텍스트만 수정 시 PATCH
      
      const apiData = response.data as ClothesApiResponse;
      return convertApiResponseToClothingItem(apiData);
    } catch (error: any) {
      console.error('[updateClothes] Error:', error);
      return rejectWithValue(
        error.response?.data?.error || '옷 정보 수정에 실패했습니다.'
      );
    }
  }
);

/**
 * 옷 삭제
 */
export const deleteClothes = createAsyncThunk(
  'closet/deleteClothes',
  async (id: number, { rejectWithValue }) => {
    try {
      await API.clothes.delete(id);
      return id;
    } catch (error: any) {
      console.error('[deleteClothes] Error:', error);
      return rejectWithValue(
        error.response?.data?.error || '옷 삭제에 실패했습니다.'
      );
    }
  }
);

// ============================================
// Slice
// ============================================

const closetSlice = createSlice({
  name: 'closet',
  initialState,
  reducers: {
    // 필터 설정
    setFilter: (state, action: PayloadAction<ClothingFilter>) => {
      state.currentFilter = action.payload;
      
      // 필터 적용
      state.filteredItems = state.items.filter(item => {
        if (action.payload.type && item.type !== action.payload.type) {
          return false;
        }
        if (action.payload.color && !item.color.toLowerCase().includes(action.payload.color.toLowerCase())) {
          return false;
        }
        return true;
      });
    },
    
    // 필터 초기화
    clearFilter: (state) => {
      state.currentFilter = {};
      state.filteredItems = state.items;
    },
    
    // 에러 초기화
    clearError: (state) => {
      state.error = null;
    },
    
    // 로컬 데이터 설정 (오프라인 지원용)
    setLocalClothingItems: (state, action: PayloadAction<ClothingItem[]>) => {
      state.items = action.payload;
      state.filteredItems = action.payload;
    },
  },
  
  extraReducers: (builder) => {
    // ========== fetchClothes ==========
    builder
      .addCase(fetchClothes.pending, (state, action) => {
        // meta.arg가 있으면 새로고침, 없으면 초기 로딩
        if (action.meta.arg === undefined) {
          state.isLoading = true;
        } else {
          state.isRefreshing = true;
        }
        state.error = null;
      })
      .addCase(fetchClothes.fulfilled, (state, action) => {
        state.items = action.payload;
        state.filteredItems = action.payload;
        state.isLoading = false;
        state.isRefreshing = false;
        state.lastFetch = Date.now();
        state.error = null;
      })
      .addCase(fetchClothes.rejected, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        state.error = action.payload as string;
      });
    
    // ========== createClothes ==========
    builder
      .addCase(createClothes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createClothes.fulfilled, (state, action) => {
        state.items.unshift(action.payload); // 최신순 정렬
        
        // 현재 필터에 맞으면 filteredItems에도 추가
        const filter = state.currentFilter;
        let shouldAdd = true;
        
        if (filter.type && action.payload.type !== filter.type) {
          shouldAdd = false;
        }
        if (filter.color && !action.payload.color.toLowerCase().includes(filter.color.toLowerCase())) {
          shouldAdd = false;
        }
        
        if (shouldAdd) {
          state.filteredItems.unshift(action.payload);
        }
        
        state.isLoading = false;
        state.error = null;
      })
      .addCase(createClothes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // ========== updateClothes ==========
    builder
      .addCase(updateClothes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateClothes.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        
        const filteredIndex = state.filteredItems.findIndex(item => item.id === action.payload.id);
        if (filteredIndex !== -1) {
          state.filteredItems[filteredIndex] = action.payload;
        }
        
        state.isLoading = false;
        state.error = null;
      })
      .addCase(updateClothes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // ========== deleteClothes ==========
    builder
      .addCase(deleteClothes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteClothes.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.filteredItems = state.filteredItems.filter(item => item.id !== action.payload);
        state.isLoading = false;
        state.error = null;
      })
      .addCase(deleteClothes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
    
    // ⭐ ========== RESET_ALL (로그아웃 시 상태 초기화) ==========
    // addMatcher는 모든 addCase 뒤에 와야 함
    builder.addMatcher(
      (action) => action.type === 'RESET_ALL',
      () => {
        console.log('🔄 [closetSlice] 상태 초기화');
        return initialState;
      }
    );
  },
});

// ============================================
// Actions & Reducer Export
// ============================================

export const {
  setFilter,
  clearFilter,
  clearError,
  setLocalClothingItems,
} = closetSlice.actions;

export default closetSlice.reducer;

// ============================================
// Selectors (옵션)
// ============================================

export const selectAllClothes = (state: { closet: ClosetState }) => state.closet.items;
export const selectFilteredClothes = (state: { closet: ClosetState }) => state.closet.filteredItems;
export const selectClosetLoading = (state: { closet: ClosetState }) => state.closet.isLoading;
export const selectClosetError = (state: { closet: ClosetState }) => state.closet.error;
export const selectCurrentFilter = (state: { closet: ClosetState }) => state.closet.currentFilter;