# accounts/gemini_outfit_service.py
# Gemini 3.0 Flash (High Thinking Mode)를 사용한 AI 코디 추천 서비스
# v5.7: v5.4(2.5 Pro)와 100% 기능 동일성 확보 + Gemini 3.0 엔진 최적화

import os
# [중요] 최신 google-genai SDK 사용 및 타입 시스템 활용
from google import genai
from google.genai import types
import json
import logging
import re
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

# 환경 변수에서 API 키 로드
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

class GeminiOutfitRecommender:
    """
    Gemini 3.0 Flash를 사용하여 사용자의 옷장에서
    날씨, 일정, 성별에 맞는 최적의 코디를 추천하는 서비스.
    Thinking Level: HIGH 설정을 통해 2.5 Pro 이상의 스타일링 지능을 발휘합니다.
    """
    
    def __init__(self):
        # google-genai SDK 클라이언트 초기화
        if GEMINI_API_KEY:
            try:
                self.client = genai.Client(api_key=GEMINI_API_KEY)
                logger.info("Gemini 3.0 Flash Outfit Client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini Client: {str(e)}")
                self.client = None
        else:
            logger.error("GEMINI_API_KEY not found in environment variables!")
            self.client = None
            
        # 3.0 Flash 최신 모델 ID
        self.model_id = 'gemini-3-flash-preview'
    
    def recommend_outfit(
        self,
        clothes_data: List[Dict],
        weather_data: Optional[Dict] = None,
        calendar_events: Optional[List[Dict]] = None,
        recommendation_type: str = 'weather',
        user_gender: Optional[str] = None,
        existing_combinations: Optional[List[str]] = None,
        favorite_outfits: Optional[List[Dict]] = None,
        style_preference: Optional[str] = None
    ) -> Dict:
        """
        옷장 데이터를 기반으로 코디 추천 (v5.4의 모든 비즈니스 로직 유지)
        """
        if not self.client:
            return self._get_fallback_result("Gemini API가 설정되지 않았습니다.")

        try:
            # 카테고리별 의류 분류
            tops = [c for c in clothes_data if c['main_category'] == 'TOP']
            bottoms = [c for c in clothes_data if c['main_category'] == 'BOTTOM']
            outers = [c for c in clothes_data if c['main_category'] == 'OUTER']
            
            logger.info(f"Start Rec: Type={recommendation_type}, Items={len(clothes_data)} (T:{len(tops)}/B:{len(bottoms)}/O:{len(outers)})")
            
            if not tops or not bottoms:
                return self._get_fallback_result("옷장에 상의 또는 하의가 부족합니다.")
            
            # Gemini 프롬프트 생성 (v5.4와 동일한 컨텍스트 구성)
            prompt = self._create_recommendation_prompt(
                tops, bottoms, outers,
                weather_data, calendar_events,
                recommendation_type, user_gender,
                existing_combinations, favorite_outfits,
                style_preference
            )
            
            # Gemini 3.0 전용 구조화된 Config 설정 적용
            # temperature는 3.0 권장값인 1.0으로 설정하여 지능을 극대화합니다.
            generate_config = types.GenerateContentConfig(
                temperature=1.0, 
                response_mime_type="application/json",
                thinking_config=types.ThinkingConfig(
                    include_thoughts=False,
                    thinking_level="HIGH"
                )
            )
            
            logger.info("Calling Gemini 3.0 Flash API (Thinking: HIGH)...")
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=prompt,
                config=generate_config
            )
            
            response_text = response.text.strip() if response.text else ""
            result = self._parse_recommendation_response(response_text)
            
            logger.info(f"Rec Completed: {result.get('outfit_title', 'Unknown')}")
            return result
            
        except Exception as e:
            logger.error(f"Error in outfit recommendation: {str(e)}")
            return self._get_fallback_result(str(e))
    
    def _create_recommendation_prompt(
        self, tops, bottoms, outers, weather_data, calendar_events,
        recommendation_type, user_gender, existing_combinations,
        favorite_outfits, style_preference
    ) -> str:
        """v5.4의 프롬프트 엔지니어링 로직을 완벽하게 계승"""
        
        # 1. Context Block
        context_lines = []
        gender_str = "여성" if user_gender == 'F' else "남성" if user_gender == 'M' else "Unspecified"
        context_lines.append(f"User Info: {gender_str}")
        
        if style_preference:
            context_lines.append(f"Style Preference: {style_preference}")
        
        # 날씨 데이터 압축 (v5.4와 동일)
        if weather_data and recommendation_type in ['weather', 'ai']:
            w = weather_data
            context_lines.append(f"Weather: {w.get('description','')} / Temp: {w.get('temp','')}°C (Feels {w.get('feels_like','')}°C) / Hum: {w.get('humidity','')}%")
        
        # 일정 데이터 (상위 3개)
        if calendar_events and recommendation_type in ['schedule', 'ai']:
            events_str = ", ".join([f"{e.get('title','')} ({e.get('start_time','')})" for e in calendar_events[:3]])
            context_lines.append(f"Schedule: {events_str}")

        context_block = "\n".join(context_lines)

        # 2. Avoidance Block (중복 제외)
        avoid_text = ""
        if existing_combinations:
            avoid_text = f"Exclude these exact combinations: {', '.join(existing_combinations)}"

        # 3. Preference Block (좋아요 코디 참조)
        style_ref_text = ""
        if favorite_outfits:
            fav_summary = []
            for fo in favorite_outfits[:3]:
                items = [f"{i.get('color')} {i.get('name')}" for i in fo.get('items', [])]
                fav_summary.append(f"- Style: {fo.get('name')} ({', '.join(items)})")
            style_ref_text = "User Preferences (Reference these styles): " + " / ".join(fav_summary)

        # 추천 목표 설정
        goal_map = {
            'weather': "Focus mainly on thermal comfort and weather appropriateness.",
            'schedule': "Focus mainly on TPO (Time, Place, Occasion) and etiquette.",
            'ai': "Balance style, weather, and schedule perfectly."
        }
        goal = goal_map.get(recommendation_type, goal_map['ai'])
        
        # 의류 리스트 압축 (v5.4와 동일 포맷)
        tops_text = self._format_clothes_list_compact(tops, "TOPS")
        bottoms_text = self._format_clothes_list_compact(bottoms, "BOTTOMS")
        outers_text = self._format_clothes_list_compact(outers, "OUTERS") if outers else "OUTERS: None"

        # 최종 프롬프트 구성 (명령어 중심)
        prompt = f"""
Act as a high-end fashion stylist who values visual freshness and creative layering. Your goal is to provide a stylish, functional outfit that breaks the user's repetitive dressing patterns.

[CONTEXT]
{context_block}
{style_ref_text}
{avoid_text}
Target: {goal}

[WARDROBE INVENTORY]
Format: [ID] Name (Color, SubCategory) : Detail
{tops_text}
{bottoms_text}
{outers_text}

[STYLING RULES]
1. BREAK THE MONOTONY: Do not just pick the warmest item (like a heavy puffer) every time it's cold. If weather allows, prioritize stylish layering (e.g., a turtleneck under a shirt, or a coat with a light vest) to create a more sophisticated look.
2. VISUAL VARIETY: Actively avoid IDs mentioned in the [Avoidance Block]. Explore new color palettes and silhouette combinations that the user hasn't tried recently.
3. TPO OVER TEMPERATURE: If a schedule event exists, prioritize the etiquette and mood of the occasion over simple thermal comfort.
4. QUALITY REASONING: In the 'reason' field, explain the "Styling Logic" (e.g., color matching, layering benefits) to convince the user why this fresh combination is better than their usual "safe" choices.

[INSTRUCTION]
Select one Top, one Bottom, and optionally one Outer from the inventory using their IDs.
Return ONLY a JSON object. No markdown phrasing.

Required JSON Structure:
{{
  "outfit_title": "Styling Title (Korean, Creative & Catchy)",
  "outfit_description": "2-3 sentences describing the overall look and mood (Korean)",
  "top_id": Integer,
  "top_name": "String",
  "top_color": "String",
  "bottom_id": Integer,
  "bottom_name": "String",
  "bottom_color": "String",
  "outer_id": Integer or null,
  "outer_name": "String or null",
  "outer_color": "String or null",
  "reason": "Detailed logic why this fresh combination works better than a simple/obvious choice (Korean, Professional tone)",
  "style_tips": "Practical advice for layering, accessories, or shoes (Korean)"
}}
"""
        return prompt
    
    def _format_clothes_list_compact(self, clothes: List[Dict], category_label: str) -> str:
        """의류 리스트 압축 포맷 (v5.4 로직 100% 동일)"""
        if not clothes:
            return f"{category_label}: None"
        lines = [f"=== {category_label} ==="]
        for item in clothes:
            detail = item.get('detail', '').replace('\n', ' ').strip()[:60]
            lines.append(f"[{item['id']}] {item['name']} ({item['color']}, {item['sub_category']}) : {detail}")
        return "\n".join(lines)
    
    def _parse_recommendation_response(self, response_text: str) -> Dict:
        """응답 파싱 및 필드 검증"""
        try:
            cleaned_text = re.sub(r'```json\s*|\s*```', '', response_text).strip()
            result = json.loads(cleaned_text)
            
            # 필수 필드 체크
            required = ['outfit_title', 'top_id', 'bottom_id', 'reason']
            for field in required:
                if field not in result:
                    logger.warning(f"Missing field {field} in response")
            
            return result
        except Exception as e:
            logger.error(f"JSON parsing failed: {str(e)}")
            return self._get_fallback_result("응답 형식을 처리하는 중 오류가 발생했습니다.")
    
    def _get_fallback_result(self, error_message: str) -> Dict:
        """v5.4와 동일한 폴백 결과 반환"""
        return {
            'error': True,
            'message': error_message,
            'outfit_title': '추천 실패',
            'outfit_description': 'AI 추천을 생성할 수 없습니다.',
            'top_id': None, 'top_name': None, 'top_color': None,
            'bottom_id': None, 'bottom_name': None, 'bottom_color': None,
            'outer_id': None, 'outer_name': None, 'outer_color': None,
            'reason': error_message,
            'style_tips': '잠시 후 다시 시도해주세요.'
        }

# 싱글톤 인스턴스
recommender = GeminiOutfitRecommender()

def recommend_outfit_with_gemini(
    clothes_data: List[Dict],
    weather_data: Optional[Dict] = None,
    calendar_events: Optional[List[Dict]] = None,
    recommendation_type: str = 'weather',
    user_gender: Optional[str] = None,
    existing_combinations: Optional[List[str]] = None,
    favorite_outfits: Optional[List[Dict]] = None,
    style_preference: Optional[str] = None
) -> Dict:
    """편의 함수 인터페이스 (v5.4와 100% 호환)"""
    if not recommender or not recommender.client:
        return {
            'error': True,
            'message': 'Gemini API가 설정되지 않았습니다.',
            'outfit_title': '추천 불가',
            'reason': 'AI 서비스를 사용할 수 없습니다.'
        }
    
    return recommender.recommend_outfit(
        clothes_data, weather_data, calendar_events, 
        recommendation_type, user_gender, existing_combinations,
        favorite_outfits, style_preference
    )