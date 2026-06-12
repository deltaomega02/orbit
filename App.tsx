// // App.tsx
// // 앱의 메인 진입점. Redux Provider와 Navigation Container를 설정합니다.

import 'react-native-gesture-handler'; 
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeCache } from './src/utils/initializeCache';

function AppContent() {
  useEffect(() => {
    // 앱 시작 시 캐시 초기화
    initializeCache();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor="#1A1A1A" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}