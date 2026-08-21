// src/store/slices/uiSlice.ts
// UI 상태 (모달, 로딩, 테마 등)를 관리하는 Redux slice
// ⭐ v2.0: RESET_ALL 액션 처리 추가

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  theme: 'light' | 'dark' | 'auto';
  isModalOpen: boolean;
  modalContent: string | null;
  isBottomSheetOpen: boolean;
  bottomSheetContent: string | null;
  globalLoading: boolean;
  toastMessage: string | null;
  toastType: 'success' | 'error' | 'info' | 'warning' | null;
}

const initialState: UIState = {
  theme: 'dark',
  isModalOpen: false,
  modalContent: null,
  isBottomSheetOpen: false,
  bottomSheetContent: null,
  globalLoading: false,
  toastMessage: null,
  toastType: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'auto'>) => {
      state.theme = action.payload;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.isModalOpen = true;
      state.modalContent = action.payload;
    },
    closeModal: (state) => {
      state.isModalOpen = false;
      state.modalContent = null;
    },
    openBottomSheet: (state, action: PayloadAction<string>) => {
      state.isBottomSheetOpen = true;
      state.bottomSheetContent = action.payload;
    },
    closeBottomSheet: (state) => {
      state.isBottomSheetOpen = false;
      state.bottomSheetContent = null;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
    showToast: (state, action: PayloadAction<{
      message: string;
      type: 'success' | 'error' | 'info' | 'warning';
    }>) => {
      state.toastMessage = action.payload.message;
      state.toastType = action.payload.type;
    },
    hideToast: (state) => {
      state.toastMessage = null;
      state.toastType = null;
    },
  },
  extraReducers: (builder) => {
    // ⭐ ========== RESET_ALL (로그아웃 시 상태 초기화) ==========
    builder.addMatcher(
      (action) => action.type === 'RESET_ALL',
      () => {
        return initialState;
      }
    );
  },
});

export const {
  setTheme,
  openModal,
  closeModal,
  openBottomSheet,
  closeBottomSheet,
  setGlobalLoading,
  showToast,
  hideToast,
} = uiSlice.actions;

export default uiSlice.reducer;