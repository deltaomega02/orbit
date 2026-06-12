// src/types/user.ts
// 사용자 관련 TypeScript 타입을 정의

import { StylePreference } from './outfit';

export interface User {
  id: string;
  email: string;
  username: string;
  profile: UserProfile;
  preferences: UserPreferences;
  subscription: SubscriptionInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  displayName: string;
  avatarUri?: string;
  fullBodyImageUri?: string;
  bio?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  birthYear?: number;
  location?: Location;
  bodyMeasurements?: BodyMeasurements;
}

export interface Location {
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  timezone: string;
}

export interface BodyMeasurements {
  height?: number; // in cm
  weight?: number; // in kg
  chest?: number;
  waist?: number;
  hip?: number;
  shoeSize?: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  stylePreferences: StylePreference;
}

export interface NotificationSettings {
  dailyOutfit: boolean;
  weatherAlerts: boolean;
  styleRecommendations: boolean;
  promotions: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  notificationTime?: string; // HH:MM format
}

export interface PrivacySettings {
  shareOutfits: boolean;
  allowAnalytics: boolean;
  publicProfile: boolean;
}

export interface SubscriptionInfo {
  tier: 'free' | 'premium' | 'pro';
  status: 'active' | 'expired' | 'cancelled';
  expiresAt?: Date;
  features: string[];
}

export interface OnboardingData {
  step: number;
  completed: boolean;
  styleQuizCompleted: boolean;
  bodyImageUploaded: boolean;
  firstOutfitCreated: boolean;
}
