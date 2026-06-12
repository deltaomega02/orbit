// src/types/outfit.ts  
// 코디 및 스타일링 관련 TypeScript 타입을 정의

import { ClothingItem, Occasion, Season } from './clothes';

export interface Outfit {
  id: string;
  name?: string;
  items: OutfitItem[];
  occasion: Occasion;
  season: Season;
  weather?: WeatherCondition;
  rating?: number;
  notes?: string;
  imageUri?: string;
  virtualTryOnUri?: string;
  createdAt: Date;
  wornAt?: Date;
  isFavorite: boolean;
}

export interface OutfitItem {
  clothingItem: ClothingItem;
  category: string;
  layerOrder?: number;
}

export interface OutfitRecommendation {
  id: string;
  outfit: Outfit;
  score: number;
  reason: string;
  weatherMatch: number;
  occasionMatch: number;
  styleMatch: number;
}

export interface WeatherCondition {
  temperature: number;
  feelsLike: number;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'windy';
  humidity: number;
  windSpeed: number;
  precipitation: number;
}

export interface StylePreference {
  userId: string;
  preferredStyles: string[];
  avoidStyles: string[];
  colorPreferences: ColorPreference;
  fitPreferences: FitPreference;
  occasionFrequency: Record<Occasion, number>;
}

export interface ColorPreference {
  favorite: string[];
  neutral: string[];
  avoid: string[];
}

export interface FitPreference {
  top: 'tight' | 'regular' | 'loose' | 'oversized';
  bottom: 'skinny' | 'slim' | 'regular' | 'wide';
  overall: 'fitted' | 'balanced' | 'relaxed';
}

export interface VirtualTryOnRequest {
  userImageUri: string;
  outfitItems: ClothingItem[];
  backgroundType?: 'original' | 'studio' | 'outdoor';
}

export interface VirtualTryOnResult {
  id: string;
  originalImageUri: string;
  generatedImageUri: string;
  outfit: Outfit;
  confidence: number;
  processingTime: number;
  createdAt: Date;
}
