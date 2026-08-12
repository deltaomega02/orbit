# accounts/gemini_service.py
# Gemini 3.0 Flash API (High Thinking Mode)를 사용하여 옷 이미지 분석
# 상세한 옷 정보 추출 서비스
# v5.4: v4.0의 모든 기능 유지 + Gemini 3.0 Flash 엔진 교체 (안정화 버전)

import os
# [중요] 최신 google-genai SDK 사용 (pip install -U google-genai)
from google import genai
from google.genai import types
from PIL import Image
import io
import logging
import json
import re

logger = logging.getLogger(__name__)

# 환경 변수에서 API 키 로드
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

class GeminiClothingAnalyzer:
    """
    Gemini 3.0 Flash를 사용하여 옷 이미지를 분석하고 상세 정보를 추출하는 서비스.
    동작이 확인된 v4.0의 프롬프트와 파싱 로직을 100% 보존하며 엔진만 교체함.
    """
    
    def __init__(self):
        # [해결] google-genai SDK의 새로운 클라이언트 초기화 방식
        if GEMINI_API_KEY:
            try:
                self.client = genai.Client(api_key=GEMINI_API_KEY)
                logger.info("Gemini 3.0 Flash Client initialized")
            except Exception as e:
                logger.error(f"Failed to initialize Gemini Client: {str(e)}")
                self.client = None
        else:
            logger.error("GEMINI_API_KEY not found in environment variables!")
            self.client = None
            
        # 3.0 Flash 최신 모델 ID
        self.model_id = 'gemini-3-flash-preview'
    
    def analyze_clothing_image(self, image_file, main_category: str, sub_category: str, 
                               name: str, color: str) -> dict:
        if not self.client:
            return self._get_fallback_result(main_category, sub_category, name, color)

        try:
            logger.info(f"Starting Gemini 3.0 Flash analysis for {name}")
            
            # 이미지 로드
            image = Image.open(image_file)
            
            # 프롬프트 생성 (기존 v4.0 로직)
            prompt = self._create_analysis_prompt(main_category, sub_category, name, color)
            
            # [핵심 수정] Gemini 3.0 Thinking 설정 적용
            response = self.client.models.generate_content(
                model=self.model_id,
                contents=[prompt, image],
                config=types.GenerateContentConfig(
                    temperature=1.0, # 3.0 Flash 권장값
                    # Thinking 모드 활성화 설정
                    thinking_config=types.ThinkingConfig(
                        include_thoughts=False, # True로 하면 사고 과정 텍스트도 반환됨 (디버깅용)
                        thinking_level="HIGH"   # "MEDIUM", "HIGH" 등 지능 수준 설정
                    )
                )
            )
            
            # 응답 파싱
            result = self._parse_response(response.text, main_category)
            logger.info(f"Analysis completed for {name}")
            return result
            
        except Exception as e:
            logger.error(f"Error in Gemini 3.0 analysis: {str(e)}")
            return self._get_fallback_result(main_category, sub_category, name, color)

    def _create_analysis_prompt(self, main_category: str, sub_category: str, 
                               name: str, color: str) -> str:
        category_korean = {'TOP': '상의', 'BOTTOM': '하의', 'OUTER': '아우터'}
        if main_category == 'TOP':
            return self._create_top_prompt(category_korean, main_category, sub_category, name, color)
        elif main_category == 'BOTTOM':
            return self._create_bottom_prompt(category_korean, main_category, sub_category, name, color)
        else:
            return self._create_outer_prompt(category_korean, main_category, sub_category, name, color)

    def _create_top_prompt(self, category_korean, main_category, sub_category, name, color):
        return f"""
당신은 전문 패션 스타일리스트입니다. 이 상의를 매우 상세하게 분석하여 나중에 코디 추천 시 활용할 수 있도록 해주세요.

**기본 정보:**
- 카테고리: {category_korean.get(main_category, main_category)} ({sub_category})
- 이름: {name}
- 색상: {color}

**아래 항목들을 구체적이고 자세하게 분석해주세요:**
1. 소재(Material), 2. 핏(Fit), 3. 길이(Length), 4. 패턴(Pattern), 5. 스타일(Style), 6. 계절(Season), 7. 목라인(Neckline), 8. 소매(Sleeve), 9. 두께(Thickness)

**응답 형식 (JSON):**
```json
{{
  "material": "소재 상세 설명",
  "fit": "핏 상세 설명",
  "length": "길이 상세 설명",
  "pattern": "패턴 상세 설명",
  "style": "스타일 상세 설명",
  "season": "계절 및 온도 상세 설명",
  "neckline": "목라인 상세 설명",
  "sleeve_length": "소매 상세 설명",
  "thickness": "두께 상세 설명"
}}
```
"""

    def _create_bottom_prompt(self, category_korean, main_category, sub_category, name, color):
        return f"""
당신은 전문 패션 스타일리스트입니다. 이 하의를 매우 상세하게 분석하여 나중에 코디 추천 시 활용할 수 있도록 해주세요.

**기본 정보:**
- 카테고리: {category_korean.get(main_category, main_category)} ({sub_category})
- 이름: {name}
- 색상: {color}

**아래 항목들을 구체적이고 자세하게 분석해주세요:**
1. 소재(Material), 2. 핏(Fit), 3. 길이(Length), 4. 패턴(Pattern), 5. 스타일(Style), 6. 계절(Season), 7. 허리 라인(Waistline), 8. 밑단 스타일(Hem), 9. 두께(Thickness)

**응답 형식 (JSON):**
```json
{{
  "material": "소재 상세 설명",
  "fit": "핏 상세 설명",
  "length": "길이 상세 설명",
  "pattern": "패턴 상세 설명",
  "style": "스타일 상세 설명",
  "season": "계절 및 온도 상세 설명",
  "waistline": "허리 라인 상세 설명",
  "hem_style": "밑단 스타일 상세 설명",
  "thickness": "두께 상세 설명"
}}
```
"""

    def _create_outer_prompt(self, category_korean, main_category, sub_category, name, color):
        return f"""
당신은 전문 패션 스타일리스트입니다. 이 아우터를 매우 상세하게 분석하여 나중에 코디 추천 시 활용할 수 있도록 해주세요.

**기본 정보:**
- 카테고리: {category_korean.get(main_category, main_category)} ({sub_category})
- 이름: {name}
- 색상: {color}

**아래 항목들을 구체적이고 자세하게 분석해주세요:**
1. 소재(Material), 2. 핏(Fit), 3. 길이(Length), 4. 패턴(Pattern), 5. 스타일(Style), 6. 계절(Season), 7. 여밈 방식(Closure), 8. 칼라/후드(Collar), 9. 보온성(Warmth)

**응답 형식 (JSON):**
```json
{{
  "material": "소재 상세 설명",
  "fit": "핏 상세 설명",
  "length": "길이 상세 설명",
  "pattern": "패턴 상세 설명",
  "style": "스타일 상세 설명",
  "season": "계절 및 온도 상세 설명",
  "closure": "여밈 방식 상세 설명",
  "collar_hood": "칼라/후드 상세 설명",
  "warmth": "보온성 상세 설명"
}}
```
"""

    def _parse_response(self, response_text: str, main_category: str) -> dict:
        try:
            json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
            json_str = json_match.group(1) if json_match else response_text
            analysis = json.loads(json_str)
            
            detail_lines = []
            fields = {'material': '소재', 'fit': '핏', 'length': '길이', 'pattern': '패턴', 'style': '스타일', 'season': '계절'}
            for key, label in fields.items():
                if key in analysis: detail_lines.append(f"{label}\n{analysis[key]}")
            
            if main_category == 'TOP':
                for k, l in {'neckline': '목라인', 'sleeve_length': '소매', 'thickness': '두께'}.items():
                    if k in analysis: detail_lines.append(f"{l}\n{analysis[k]}")
            elif main_category == 'BOTTOM':
                for k, l in {'waistline': '허리', 'hem_style': '밑단', 'thickness': '두께'}.items():
                    if k in analysis: detail_lines.append(f"{l}\n{analysis[k]}")
            else:
                for k, l in {'closure': '여밈', 'collar_hood': '칼라', 'warmth': '보온성'}.items():
                    if k in analysis: detail_lines.append(f"{l}\n{analysis[k]}")
            
            return {'detail': "\n\n".join(detail_lines), 'analysis': analysis}
        except Exception:
            return {'detail': response_text, 'analysis': {}}

    def _get_fallback_result(self, main_category, sub_category, name, color) -> dict:
        cat = {'TOP': '상의', 'BOTTOM': '하의', 'OUTER': '아우터'}.get(main_category, main_category)
        return {
            'detail': f"기본 정보\n{cat} - {name}\n색상: {color}\n\n※ AI 분석을 완료하지 못했습니다.",
            'analysis': {}
        }

# 싱글톤 인스턴스
analyzer = GeminiClothingAnalyzer()

def analyze_clothing_with_gemini(image_file, main_category: str, sub_category: str,
                                 name: str, color: str) -> dict:
    return analyzer.analyze_clothing_image(image_file, main_category, sub_category, name, color)