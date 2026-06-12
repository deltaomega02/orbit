# accounts/serializers.py
# API Serializers - 이메일 기반 인증 + 이미지 업로드 + Gemini AI 분석
# v3.0 업데이트: Gemini 2.5 Pro 연동 추가
# v3.1 업데이트: body_photo 필드 추가

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Clothes, Coordination, CoordinationItem
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

# Gemini 서비스 임포트
try:
    from .gemini_service import analyze_clothing_with_gemini
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("Gemini service not available in serializers")


# ============================================
# User Serializers
# ============================================

class UserSerializer(serializers.ModelSerializer):
    """
    사용자 기본 정보 Serializer
    v3.1 업데이트: body_photo 필드 추가
    """
    name = serializers.CharField(source='username')
    body_photo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 
            'email', 
            'name', 
            'sex',
            'height',
            'weight',
            'body_photo',       # 추가: 파일 경로
            'body_photo_url',   # 추가: 전체 URL
            'created_at'
        ]
        read_only_fields = ['id', 'email', 'created_at', 'body_photo_url']
    
    def get_body_photo_url(self, obj):
        """
        body_photo의 전체 URL 반환
        파일이 없으면 None 반환
        """
        if obj.body_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.body_photo.url)
            return obj.body_photo.url
        return None


# ============================================
# Clothes Serializers
# ============================================

class ClothesSerializer(serializers.ModelSerializer):
    """
    의류 조회용 Serializer
    - 이미지 URL을 포함한 모든 정보 반환
    - main_category_display: 한글 카테고리명
    """
    image_url = serializers.SerializerMethodField()
    main_category_display = serializers.CharField(source='get_main_category_display', read_only=True)
    
    class Meta:
        model = Clothes
        fields = [
            'id',
            'main_category',
            'main_category_display',
            'sub_category',
            'name',
            'color',
            'detail',
            'image',
            'image_url',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        """이미지의 전체 URL 반환"""
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class ClothesCreateSerializer(serializers.ModelSerializer):
    """
    의류 생성 전용 Serializer
    - user는 request.user에서 자동으로 설정
    - image는 multipart/form-data로 업로드
    - 이미지 크기 제한 없음 (원본 해상도 유지)
    - Gemini AI 분석은 선택적 (analyze_with_ai 필드)
    
    v3.0: Gemini AI 통합
    """
    # AI 분석 여부를 제어하는 선택적 필드
    analyze_with_ai = serializers.BooleanField(default=False, write_only=True)
    
    class Meta:
        model = Clothes
        fields = [
            'main_category',
            'sub_category',
            'name',
            'color',
            'detail',
            'image',
            'analyze_with_ai',  # 새 필드
        ]
    
    def validate_image(self, value):
        """
        이미지 파일 유효성 검사
        - 이미지는 선택사항 (없어도 됨)
        - 파일이 있으면 형식만 체크 (크기 제한 없음)
        """
        if not value:
            return value  # 이미지 없어도 OK
        
        allowed_extensions = ['jpg', 'jpeg', 'png', 'webp']
        ext = value.name.split('.')[-1].lower()
        if ext not in allowed_extensions:
            raise serializers.ValidationError(
                f"지원하지 않는 이미지 형식입니다. 허용: {', '.join(allowed_extensions)}"
            )
        
        logger.info(f"Image validated: {value.name}, size: {value.size} bytes")
        return value
    
    def create(self, validated_data):
        """
        의류 아이템 생성
        - user는 views에서 전달됨
        - analyze_with_ai=True이고 GEMINI_AVAILABLE이면 AI 분석 실행
        """
        # analyze_with_ai 플래그 추출 (DB에 저장되지 않음)
        analyze_with_ai = validated_data.pop('analyze_with_ai', False)
        
        # user는 views.py에서 전달됨
        user = validated_data.pop('user', None)
        if not user:
            raise serializers.ValidationError("사용자 정보가 필요합니다")
        
        # Clothes 객체 생성
        clothes = Clothes.objects.create(user=user, **validated_data)
        logger.info(f"Clothes created: {clothes.id} - {clothes.name}")
        
        # AI 분석 (선택적)
        if analyze_with_ai and GEMINI_AVAILABLE:
            try:
                logger.info(f"Starting Gemini AI analysis for {clothes.name}...")
                
                # 이미지 파일을 다시 열어서 분석 (파일 포인터 리셋)
                clothes.image.seek(0)
                
                # Gemini 분석 실행
                result = analyze_clothing_with_gemini(
                    image_file=clothes.image,
                    main_category=clothes.main_category,
                    sub_category=clothes.sub_category,
                    name=clothes.name,
                    color=clothes.color
                )
                
                # detail 필드 업데이트
                if result and 'detail' in result:
                    clothes.detail = result['detail']
                    clothes.save()
                    logger.info(f"AI analysis completed and saved for {clothes.name}")
                
            except Exception as e:
                # AI 분석 실패해도 의류 아이템 생성은 성공으로 처리
                logger.error(f"Gemini analysis failed for {clothes.name}: {str(e)}")
                logger.info("Continuing without AI analysis...")
        
        return clothes
    
    def update(self, instance, validated_data):
        """
        의류 아이템 수정
        - 이미지 변경 시에만 파일 업로드
        - analyze_with_ai=True이면 재분석
        """
        # analyze_with_ai 플래그 추출
        analyze_with_ai = validated_data.pop('analyze_with_ai', False)
        
        # 기존 이미지 삭제 (새 이미지가 업로드되는 경우)
        if 'image' in validated_data and instance.image:
            old_image = instance.image
            instance.image = validated_data['image']
            old_image.delete(save=False)
            logger.info(f"Old image deleted for {instance.name}")
        
        # 필드 업데이트
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        logger.info(f"Clothes updated: {instance.id} - {instance.name}")
        
        # 재분석 (선택적)
        if analyze_with_ai and GEMINI_AVAILABLE and instance.image:
            try:
                logger.info(f"Re-analyzing with Gemini AI for {instance.name}...")
                
                instance.image.seek(0)
                
                result = analyze_clothing_with_gemini(
                    image_file=instance.image,
                    main_category=instance.main_category,
                    sub_category=instance.sub_category,
                    name=instance.name,
                    color=instance.color
                )
                
                if result and 'detail' in result:
                    instance.detail = result['detail']
                    instance.save()
                    logger.info(f"AI re-analysis completed for {instance.name}")
                
            except Exception as e:
                logger.error(f"Gemini re-analysis failed for {instance.name}: {str(e)}")
        
        return instance


# ============================================
# Coordination Serializers
# ============================================

class CoordinationItemSerializer(serializers.ModelSerializer):
    """코디 아이템 Serializer (의류 정보 포함)"""
    clothes_detail = ClothesSerializer(source='clothes', read_only=True)
    
    class Meta:
        model = CoordinationItem
        fields = ['id', 'clothes', 'clothes_detail']


class CoordinationSerializer(serializers.ModelSerializer):
    """
    코디 조회용 Serializer
    v5.1 업데이트: image, image_url 필드 추가
    """
    items = CoordinationItemSerializer(many=True, read_only=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Coordination
        fields = [
            'id', 
            'name', 
            'detail', 
            'image',           # 추가
            'image_url',       # 추가
            'is_favorite',
            'items', 
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['id', 'image_url', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        """코디 이미지의 전체 URL 반환"""
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class CoordinationCreateSerializer(serializers.ModelSerializer):
    """
    코디 생성 전용 Serializer
    - items: 의류 ID 리스트
    """
    items = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        allow_empty=False
    )
    
    class Meta:
        model = Coordination
        fields = ['name', 'date', 'items']
    
    def validate_items(self, value):
        """의류 ID 리스트 유효성 검사"""
        if not value:
            raise serializers.ValidationError("최소 1개의 의류가 필요합니다")
        
        # 중복 체크
        if len(value) != len(set(value)):
            raise serializers.ValidationError("중복된 의류가 있습니다")
        
        return value
    
    def create(self, validated_data):
        """코디 생성 및 아이템 연결"""
        items_data = validated_data.pop('items')
        user = validated_data.pop('user')
        
        # Coordination 생성
        coordination = Coordination.objects.create(user=user, **validated_data)
        
        # CoordinationItem 생성
        for clothes_id in items_data:
            try:
                clothes = Clothes.objects.get(id=clothes_id, user=user)
                CoordinationItem.objects.create(
                    coordination=coordination,
                    clothes=clothes
                )
            except Clothes.DoesNotExist:
                coordination.delete()
                raise serializers.ValidationError(
                    f"의류 ID {clothes_id}를 찾을 수 없습니다"
                )
        
        logger.info(f"Coordination created: {coordination.id} - {coordination.name}")
        return coordination