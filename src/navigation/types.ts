// src/navigation/types.ts

import { NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { ClothingItem } from '../types/clothes';
import { Outfit } from '../types/outfit';

// Root Stack Navigator
export type RootStackParamList = {
  Login: undefined;
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Camera: { mode: 'clothes' | 'body' | 'outfit' };
  Recommend: undefined;
  AddClothing: undefined;
  ClothingPhoto: undefined;
  ClothingDetail: { item: ClothingItem };
  OutfitDetail: { outfit: Outfit };
  VirtualTryOn: { outfit: Outfit };
  Settings: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: { isHomeExpanded?: boolean } | undefined;
  Closet: undefined;
  AddClothes: undefined;
  Outfits: undefined;
  Profile: undefined;
};

// Stack navigators for each tab
export type HomeStackParamList = {
  HomeScreen: undefined;
  DailyOutfit: { date: string };
  WeatherDetail: undefined;
};

export type ClosetStackParamList = {
  ClosetScreen: undefined;
  ClothingDetail: { item: ClothingItem };
  EditClothing: { item: ClothingItem };
  CategoryView: { category: string };
};

export type OutfitsStackParamList = {
  OutfitsScreen: undefined;
  OutfitDetail: { outfit: Outfit };
  CreateOutfit: undefined;
  VirtualTryOn: { outfit: Outfit };
};

export type ProfileStackParamList = {
  ProfileScreen: undefined;
  EditProfile: undefined;
  StylePreferences: undefined;
  Settings: undefined;
  Subscription: undefined;
};

// Screen props types
export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  StackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = 
  BottomTabScreenProps<MainTabParamList, T>;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> = 
  StackScreenProps<HomeStackParamList, T>;

export type ClosetStackScreenProps<T extends keyof ClosetStackParamList> = 
  StackScreenProps<ClosetStackParamList, T>;

export type OutfitsStackScreenProps<T extends keyof OutfitsStackParamList> = 
  StackScreenProps<OutfitsStackParamList, T>;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = 
  StackScreenProps<ProfileStackParamList, T>;