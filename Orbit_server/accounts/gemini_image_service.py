# accounts/gemini_image_service.py
# Gemini GenAI SDK(최신)를 사용한 가상 착용 이미지 생성 서비스
# v1.3: 최신 google-genai 패키지 마이그레이션 + 원본 유지(Identity Preservation) 강화

import os
import logging
import io
from typing import Dict, List, Optional
from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile

# 신규 SDK 임포트
from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

# API 설정
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if GEMINI_API_KEY:
    # 신규 클라이언트 방식
    client = genai.Client(api_key=GEMINI_API_KEY)
    GEMINI_IMAGE_AVAILABLE = True
    logger.info("New Gemini GenAI SDK configured successfully")
else:
    GEMINI_IMAGE_AVAILABLE = False
    logger.error("GEMINI_API_KEY not found!")


class GeminiImageGenerator:
    """
    최신 Gemini SDK를 사용하여 배경/인물 정체성을 유지하며 의류만 교체
    """
    
    def __init__(self):
        if not GEMINI_IMAGE_AVAILABLE:
            raise ValueError("Gemini API key not configured")
        # 모델명 유지
        self.model_id = 'gemini-3-pro-image-preview'

    def generate_virtual_tryon_image(
        self,
        body_photo_path: str,
        clothing_images: List[Dict],
        outfit_description: str,
        outfit_details: str,
        user_gender: str
    ) -> Optional[InMemoryUploadedFile]:
        """
        가상 착용 이미지 생성 (리사이징 및 최적화 로직 포함)
        """
        try:
            logger.info("Starting high-fidelity virtual try-on (Identity Preservation Mode)...")
            
            inputs_for_gemini = []
            
            # 1. 사용자 전신 사진 로드 및 리사이징 (기존 로직 100% 복원)
            try:
                body_image = Image.open(body_photo_path).convert('RGB')
                if body_image.width > 768:
                    ratio = 768 / body_image.width
                    new_height = int(body_image.height * ratio)
                    body_image = body_image.resize((768, new_height), Image.Resampling.LANCZOS)
                
                inputs_for_gemini.append(body_image)
            except Exception as e:
                logger.error(f"Failed to load body photo: {str(e)}")
                return None
            
            # 2. 의류 이미지 로드 및 리사이징 + 설명 생성
            clothing_descriptions = []
            for idx, clothing in enumerate(clothing_images):
                try:
                    c_img = Image.open(clothing['path']).convert('RGB')
                    if c_img.width > 768:
                        ratio = 768 / c_img.width
                        new_height = int(c_img.height * ratio)
                        c_img = c_img.resize((768, new_height), Image.Resampling.LANCZOS)

                    inputs_for_gemini.append(c_img)
                    
                    # 카테고리 매핑 (기존 로직)
                    category_kr = {'TOP': '상의', 'BOTTOM': '하의', 'OUTER': '아우터'}.get(
                        clothing['category'], clothing['category']
                    )
                    detail_text = f", Features: {clothing.get('detail', '')}" if clothing.get('detail') else ""
                    clothing_desc = f"{category_kr}: {clothing['name']} (Color: {clothing['color']}{detail_text})"
                    clothing_descriptions.append(clothing_desc)
                    
                except Exception as e:
                    logger.error(f"Failed to load clothing image {idx+1}: {str(e)}")
                    continue
            
            if len(inputs_for_gemini) < 2:
                logger.error("Not enough images for try-on")
                return None
            
            # 3. 프롬프트 생성 (Identity Preservation 강화)
            gender_text = "남성" if user_gender == 'M' else "여성"
            prompt = self._create_image_generation_prompt(
                gender_text,
                clothing_descriptions,
                outfit_description,
                outfit_details
            )

# 4. 최신 SDK 방식으로 API 호출
            logger.info("Calling Gemini API with Identity Preservation config...")
            
            # 
            
            response = client.models.generate_content(
                model=self.model_id,
                contents=[prompt] + inputs_for_gemini,
                config=types.GenerateContentConfig(
                    # 400 에러의 원인이었던 response_mime_type은 제외
                    # 배경/자세 유지를 위한 핵심 옵션
                    response_modalities=["IMAGE"],
                    candidate_count=1,
                    temperature=0.7,
                )
            )
            
            # 5. 응답에서 이미지 데이터 추출 (구조가 바뀜)
            generated_image_data = None
            if response.candidates and response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if part.inline_data:
                        generated_image_data = part.inline_data.data
                        break
            
            if not generated_image_data:
                logger.error("No image data in Gemini response")
                return None
            
            # 6. Django 파일로 변환 및 저장
            return self._convert_to_django_file(generated_image_data)
            
        except Exception as e:
            logger.error(f"General Error in try-on service: {str(e)}")
            return None

    def _create_image_generation_prompt(self, gender, clothing_descriptions, outfit_desc, outfit_details):
        """가상 착용을 위한 정교한 프롬프트"""
        clothing_list = "\n".join([f"- {desc}" for desc in clothing_descriptions])
        
        return f"""
ROLE: Professional Fashion AI Stylist.
TASK: Virtual Try-on by replacing the person's current outfit with the provided items.

INPUT DATA:
- Person: {gender} (Source photo provided)
- Target Clothes:
{clothing_list}
- Concept: {outfit_desc}

CRITICAL INSTRUCTIONS (IDENTITY PRESERVATION):
1. BACKGROUND: Keep the background 100% identical to the original photo. Do not change any objects or lighting in the background.
2. PERSON: Keep the person's face, hair, body shape, and pose EXACTLY as they are. The only change should be the clothing.
3. FIT: Naturally drape the new clothes over the person's body shape and pose.
4. COMPOSITION: Full-body vertical shot (portrait mode). The final image MUST be tall (9:16 aspect ratio). Ensure the entire person from head to toe is visible within the vertical frame.

Output only the resulting image.
"""

    def _convert_to_django_file(self, image_data: bytes) -> InMemoryUploadedFile:
        """결과 이미지를 Django 모델에 저장 가능한 형태로 변환 (기존 로직 복원)"""
        image = Image.open(io.BytesIO(image_data))
        if image.mode == 'RGBA':
            image = image.convert('RGB')
        
        if image.width > 768:
            ratio = 768 / image.width
            new_height = int(image.height * ratio)
            image = image.resize((768, new_height), Image.Resampling.LANCZOS)

        output = io.BytesIO()
        image.save(output, format='JPEG', quality=90) # 퀄리티 약간 상향
        output.seek(0)
        
        return InMemoryUploadedFile(
            output, 'ImageField', 'virtual_tryon.jpg', 'image/jpeg',
            output.getbuffer().nbytes, None
        )

# 싱글톤 인스턴스
image_generator = GeminiImageGenerator() if GEMINI_IMAGE_AVAILABLE else None

def generate_virtual_tryon_with_gemini(body_photo_path, clothing_images, outfit_description, outfit_details, user_gender):
    if not image_generator:
        return None
    return image_generator.generate_virtual_tryon_image(
        body_photo_path, clothing_images, outfit_description, outfit_details, user_gender
    )