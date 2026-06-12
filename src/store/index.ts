// src/store/index.ts
// Redux store 설정을 정의

import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import closetReducer from './slices/closetSlice';
import outfitReducer from './slices/outfitSlice';
import uiReducer from './slices/uiSlice';
import cacheReducer from './slices/cacheSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    closet: closetReducer,
    outfit: outfitReducer,
    ui: uiReducer,
    cache: cacheReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;