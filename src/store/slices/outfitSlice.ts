// src/store/slices/outfitSlice.ts
// 코디 추천 및 착용 이력을 관리하는 Redux slice
// ⭐ v2.0: RESET_ALL 액션 처리 추가

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Outfit, OutfitRecommendation, WeatherCondition } from '../../types/outfit';

interface OutfitState {
  outfits: Outfit[];
  recommendations: OutfitRecommendation[];
  todayOutfit: Outfit | null;
  currentWeather: WeatherCondition | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: OutfitState = {
  outfits: [],
  recommendations: [],
  todayOutfit: null,
  currentWeather: null,
  isLoading: false,
  error: null,
};

const outfitSlice = createSlice({
  name: 'outfit',
  initialState,
  reducers: {
    setOutfits: (state, action: PayloadAction<Outfit[]>) => {
      state.outfits = action.payload;
      state.error = null;
    },
    addOutfit: (state, action: PayloadAction<Outfit>) => {
      state.outfits.push(action.payload);
    },
    updateOutfit: (state, action: PayloadAction<Outfit>) => {
      const index = state.outfits.findIndex(outfit => outfit.id === action.payload.id);
      if (index !== -1) {
        state.outfits[index] = action.payload;
      }
    },
    removeOutfit: (state, action: PayloadAction<string>) => {
      state.outfits = state.outfits.filter(outfit => outfit.id !== action.payload);
    },
    setRecommendations: (state, action: PayloadAction<OutfitRecommendation[]>) => {
      state.recommendations = action.payload;
    },
    setTodayOutfit: (state, action: PayloadAction<Outfit>) => {
      state.todayOutfit = action.payload;
    },
    setCurrentWeather: (state, action: PayloadAction<WeatherCondition>) => {
      state.currentWeather = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    // ⭐ ========== RESET_ALL (로그아웃 시 상태 초기화) ==========
    builder.addMatcher(
      (action) => action.type === 'RESET_ALL',
      () => {
        console.log('🔄 [outfitSlice] 상태 초기화');
        return initialState;
      }
    );
  },
});

export const {
  setOutfits,
  addOutfit,
  updateOutfit,
  removeOutfit,
  setRecommendations,
  setTodayOutfit,
  setCurrentWeather,
  setLoading,
  setError,
} = outfitSlice.actions;

export default outfitSlice.reducer;