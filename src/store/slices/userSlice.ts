// src/store/slices/userSlice.ts
// 사용자 상태를 관리하는 Redux slice
// ⭐ v2.0: RESET_ALL 액션 처리 추가

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, UserPreferences } from '../../types/user';

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    updateUserPreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      if (state.currentUser) {
        state.currentUser.preferences = {
          ...state.currentUser.preferences,
          ...action.payload,
        };
      }
    },
    logout: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
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
        console.log('🔄 [userSlice] 상태 초기화');
        return initialState;
      }
    );
  },
});

export const { setUser, updateUserPreferences, logout, setLoading, setError } = userSlice.actions;
export default userSlice.reducer;