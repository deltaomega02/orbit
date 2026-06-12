// src/services/auth/AuthService.ts
// 인증 상태 관리 서비스

import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export interface UserInfo {
  user: {
    name: string;
    email: string;
    photo?: string;
    id?: string;
  };
  idToken?: string;
  serverAuthCode?: string;
}

class AuthServiceClass {
  private isGoogleConfigured: boolean = false;

  constructor() {
    // 서비스 초기화 시 Google Sign-In 설정
    this.initializeGoogleSignIn();
  }

  /**
   * Google Sign-In 초기화
   */
  private async initializeGoogleSignIn() {
    try {
      if (!this.isGoogleConfigured) {
        GoogleSignin.configure({
          webClientId: '1012500755271-5ko4k21dmno7ekr5a1kb9hcqki0orud2.apps.googleusercontent.com',
          offlineAccess: true,
          scopes: [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
          ],
        });
        this.isGoogleConfigured = true;
        console.log('[Auth] ✅ Google Sign-In configured');
      }
    } catch (error) {
      console.error('[Auth] ❌ Google Sign-In configuration error:', error);
    }
  }

  /**
   * 로그인 상태 확인
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem('isLoggedIn');
      return value === 'true';
    } catch (error) {
      console.error('[Auth] Check login status error:', error);
      return false;
    }
  }

  /**
   * 로그인 타입 확인 (google | guest)
   */
  async getLoginType(): Promise<'google' | 'guest' | null> {
    try {
      const type = await AsyncStorage.getItem('loginType');
      return type as 'google' | 'guest' | null;
    } catch (error) {
      console.error('[Auth] Get login type error:', error);
      return null;
    }
  }

  /**
   * 사용자 정보 가져오기
   */
  async getUserInfo(): Promise<UserInfo | null> {
    try {
      const userInfoString = await AsyncStorage.getItem('userInfo');
      if (userInfoString) {
        return JSON.parse(userInfoString);
      }
      return null;
    } catch (error) {
      console.error('[Auth] Get user info error:', error);
      return null;
    }
  }

  /**
   * 사용자 정보 저장
   */
  async saveUserInfo(userInfo: UserInfo, loginType: 'google' | 'guest'): Promise<void> {
    try {
      await AsyncStorage.setItem('userInfo', JSON.stringify(userInfo));
      await AsyncStorage.setItem('isLoggedIn', 'true');
      await AsyncStorage.setItem('loginType', loginType);
      console.log('[Auth] ✅ User info saved');
    } catch (error) {
      console.error('[Auth] ❌ Save user info error:', error);
      throw error;
    }
  }

  /**
   * 게스트 계정 생성 (일회성)
   * 타임스탬프 + 랜덤으로 중복 불가능한 ID 생성
   */
  async createGuestAccount(): Promise<UserInfo> {
    try {
      // 타임스탬프(13자리) + 랜덤 4자리 = 총 17자리
      const timestamp = Date.now(); // 예: 1705312345678
      const random = Math.floor(1000 + Math.random() * 9000); // 1000~9999
      const guestId = `guest_${timestamp}${random}`;
      
      const guestUserInfo: UserInfo = {
        user: {
          name: 'Guest User',
          email: `${guestId}@orbit.guest`,
          id: guestId,
        },
      };

      // 로컬에 저장
      await this.saveUserInfo(guestUserInfo, 'guest');
      await AsyncStorage.setItem('guestSessionId', guestId);
      
      console.log('[Auth] ✅ Guest account created:', guestId);
      return guestUserInfo;
      
    } catch (error) {
      console.error('[Auth] ❌ Guest account creation error:', error);
      throw error;
    }
  }

  /**
   * 게스트 세션 ID 확인
   */
  async getGuestSessionId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('guestSessionId');
    } catch (error) {
      console.error('[Auth] Get guest session error:', error);
      return null;
    }
  }

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    try {
      // 로그인 타입 확인
      const loginType = await this.getLoginType();
      console.log('[Auth] Logout - Login type:', loginType);

      // Google 로그아웃
      if (loginType === 'google') {
        try {
          // Google Sign-In이 설정되지 않았다면 다시 설정
          await this.initializeGoogleSignIn();
          
          // getCurrentUser로 현재 사용자 확인
          try {
            const currentUser = await GoogleSignin.getCurrentUser();
            console.log('[Auth] Current Google user:', currentUser?.user?.email);
            
            if (currentUser) {
              // revokeAccess와 signOut을 순차적으로 시도
              try {
                await GoogleSignin.revokeAccess();
                console.log('[Auth] ✅ Google access revoked');
              } catch (revokeError) {
                console.log('[Auth] Could not revoke access:', revokeError);
              }
              
              await GoogleSignin.signOut();
              console.log('[Auth] ✅ Google sign out success');
            } else {
              console.log('[Auth] No Google user currently signed in');
            }
          } catch (userError) {
            console.log('[Auth] Could not get current user, attempting signOut anyway');
            
            // getCurrentUser가 실패해도 signOut 시도
            try {
              await GoogleSignin.signOut();
              console.log('[Auth] ✅ Google sign out success (forced)');
            } catch (signOutError) {
              console.log('[Auth] Google sign out error:', signOutError);
            }
          }
        } catch (googleError) {
          console.error('[Auth] Google logout process error:', googleError);
          // Google 로그아웃이 실패해도 계속 진행
        }
      }

      // AsyncStorage 초기화 (Google 로그아웃 성공/실패와 관계없이 항상 실행)
      await AsyncStorage.multiRemove([
        'isLoggedIn',
        'loginType',
        'userInfo',
        'guestSessionId', // ⭐ 게스트 세션 ID 추가
      ]);

      // 온보딩 상태는 유지 (선택사항)
      // await AsyncStorage.removeItem('onboarding_complete');

      console.log('[Auth] ✅ Logout complete - all local data cleared');
    } catch (error) {
      console.error('[Auth] ❌ Logout error:', error);
      
      // 마지막 안전장치: 어떤 에러가 발생해도 로컬 데이터는 삭제
      try {
        await AsyncStorage.multiRemove([
          'isLoggedIn',
          'loginType',
          'userInfo',
          'guestSessionId', // ⭐ 게스트 세션 ID 추가
        ]);
        console.log('[Auth] ✅ Local data cleared (fallback)');
      } catch (clearError) {
        console.error('[Auth] ❌ Critical: Failed to clear local data:', clearError);
        throw clearError;
      }
    }
  }

  /**
   * Google Calendar Access Token 가져오기
   */
  async getCalendarAccessToken(): Promise<string | null> {
    try {
      const loginType = await this.getLoginType();
      
      if (loginType !== 'google') {
        console.warn('[Auth] Calendar access only available for Google users');
        return null;
      }

      // Google Sign-In 초기화 확인
      await this.initializeGoogleSignIn();
      
      const tokens = await GoogleSignin.getTokens();
      return tokens.accessToken;
    } catch (error) {
      console.error('[Auth] Get calendar token error:', error);
      return null;
    }
  }

  /**
   * 캘린더 접근 가능 여부 확인
   */
  async hasCalendarAccess(): Promise<boolean> {
    const loginType = await this.getLoginType();
    return loginType === 'google';
  }

  /**
   * 토큰 갱신
   */
  async refreshToken(): Promise<boolean> {
    try {
      const loginType = await this.getLoginType();
      
      if (loginType !== 'google') {
        return false;
      }

      // Google Sign-In 초기화 확인
      await this.initializeGoogleSignIn();

      // 현재 사용자 확인
      const currentUser = await GoogleSignin.getCurrentUser();
      if (!currentUser) {
        console.warn('[Auth] No user signed in for token refresh');
        return false;
      }

      // Google 토큰 갱신
      const tokens = await GoogleSignin.getTokens();
      console.log('[Auth] ✅ Token refreshed');
      return true;
    } catch (error) {
      console.error('[Auth] ❌ Token refresh error:', error);
      return false;
    }
  }

  /**
   * Google 로그인 상태 확인
   */
  async isGoogleSignedIn(): Promise<boolean> {
    try {
      await this.initializeGoogleSignIn();
      const currentUser = await GoogleSignin.getCurrentUser();
      return currentUser !== null;
    } catch (error) {
      console.error('[Auth] Check Google sign-in status error:', error);
      return false;
    }
  }

  /**
   * 로그인 상태 초기화 (디버깅용)
   */
  async clearAllData(): Promise<void> {
    try {
      // Google 로그아웃 시도
      try {
        await this.initializeGoogleSignIn();
        await GoogleSignin.signOut();
      } catch (error) {
        console.log('[Auth] Google signOut during clear:', error);
      }

      // 모든 AsyncStorage 데이터 삭제
      await AsyncStorage.clear();
      console.log('[Auth] ✅ All data cleared');
    } catch (error) {
      console.error('[Auth] ❌ Clear data error:', error);
    }
  }
}

export const AuthService = new AuthServiceClass();