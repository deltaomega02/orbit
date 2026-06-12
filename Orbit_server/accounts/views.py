# accounts/views.py
# API 뷰 정의 - 이메일 기반 인증 + 이미지 업로드 처리 + Gemini AI 분석
# v5.0 업데이트: Gemini 코디 추천을 DB에 저장 + 중복 체크

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import InMemoryUploadedFile
import logging
import io
from PIL import Image

from .serializers import (
    UserSerializer,
    ClothesSerializer,
    ClothesCreateSerializer,
    CoordinationSerializer,
    CoordinationCreateSerializer,
)
from .models import Clothes, Coordination, CoordinationItem

# Gemini 서비스 임포트
try:
    from .gemini_service import analyze_clothing_with_gemini
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logging.warning("Gemini service not available")

# 코디 추천 서비스 임포트
try:
    from .gemini_outfit_service import recommend_outfit_with_gemini
    OUTFIT_RECOMMENDATION_AVAILABLE = True
except ImportError:
    OUTFIT_RECOMMENDATION_AVAILABLE = False
    logging.warning("Gemini outfit recommendation service not available")

try:
    from .gemini_image_service import generate_virtual_tryon_with_gemini
    IMAGE_GENERATION_AVAILABLE = True
except ImportError:
    IMAGE_GENERATION_AVAILABLE = False
    logging.warning("Gemini image generation service not available")

User = get_user_model()
logger = logging.getLogger(__name__)


# ============================================
# 인증 헬퍼 함수
# ============================================

def get_user_from_email_token(request):
    """
    이메일 토큰으로 사용자 가져오기
    Authorization 헤더에서 이메일을 추출하여 사용자 조회
    """
    auth_header = request.headers.get('Authorization', '')
    
    if not auth_header:
        return None
    
    # "Token email@example.com" 형식에서 이메일 추출
    parts = auth_header.split()
    if len(parts) != 2 or parts[0] != 'Token':
        return None
    
    email = parts[1]
    
    try:
        user = User.objects.get(email=email)
        return user
    except User.DoesNotExist:
        return None


# ============================================
# 연결 테스트
# ============================================

@api_view(['GET'])
@permission_classes([AllowAny])
def test_connection(request):
    """연결 테스트 엔드포인트"""
    return Response({
        "message": "Orbit Server Connected!",
        "status": "OK",
        "version": "5.0.0 - Coordination DB Storage",
        "gemini_available": GEMINI_AVAILABLE,
        "outfit_recommendation_available": OUTFIT_RECOMMENDATION_AVAILABLE
    })


# ============================================
# 인증 관련
# ============================================

@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    """Google 로그인 - 이메일을 토큰으로 사용"""
    try:
        email = request.data.get('email')
        name = request.data.get('name', '')
        
        if not email:
            return Response(
                {'error': '이메일이 필요합니다'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # 사용자 찾기 또는 생성
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': name if name else email.split('@')[0],
            }
        )
        
        # 사용자 정보 업데이트 (이름이 변경되었을 수 있음)
        if not created and name:
            user.username = name
            user.save()
        
        return Response({
            'success': True,
            'token': email,  # 이메일을 토큰으로 사용
            'user': UserSerializer(user, context={'request': request}).data,
            'created': created,
            'message': '로그인 성공'  
        })

    except Exception as e:
        logger.error(f"Google login error: {str(e)}")
        return Response(
            {'error': '로그인 실패'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET', 'PUT', 'PATCH'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def user_profile(request):
    """
    사용자 프로필 조회 및 수정
    이메일 토큰으로 사용자 인증
    
    PATCH 요청 시:
    - JSON 데이터: sex, height, weight 등
    - multipart/form-data: body_photo 파일 포함 가능
    """
    user = get_user_from_email_token(request)
    if not user:
        return Response({'error': '인증 실패'}, status=status.HTTP_401_UNAUTHORIZED)
    
    if request.method == 'GET':
        serializer = UserSerializer(user, context={'request': request})  
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        
        # body_photo 파일이 있는 경우 로깅
        if 'body_photo' in request.FILES:
            logger.info(f"[User Profile] body_photo 파일 업로드: {request.FILES['body_photo'].name}")
        
        serializer = UserSerializer(user, data=request.data, partial=partial, context={'request': request})  
        
        if serializer.is_valid():
            serializer.save()
            logger.info(f"[User Profile] 프로필 업데이트 성공: {user.email}")  
            return Response(serializer.data)
        
        logger.error(f"[User Profile] 프로필 업데이트 실패: {serializer.errors}")  
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ============================================
# 게스트 계정 삭제
# ============================================
@api_view(['DELETE'])
def delete_guest_account(request):
    """
    게스트 계정 삭제
    
    - 게스트 계정만 삭제 가능 (@orbit.guest 이메일)
    - CASCADE로 연관된 Clothes, Coordination 자동 삭제
    - Google 계정은 삭제 불가
    
    응답:
    {
        "success": true,
        "message": "게스트 계정이 삭제되었습니다",
        "deleted_user": "Guest_xxx"
    }
    """
    # 토큰으로 사용자 확인
    user = get_user_from_email_token(request)
    
    if not user:
        return Response(
            {'error': '인증 실패'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # 게스트 계정 확인 (@orbit.guest 도메인)
    if not user.email.endswith('@orbit.guest'):
        logger.warning(f"Non-guest user {user.email} tried to delete account")
        return Response(
            {
                'success': False,
                'error': '게스트 계정만 삭제할 수 있습니다.'
            },
            status=status.HTTP_403_FORBIDDEN
        )
    
    # 삭제 전 정보 저장
    username = user.username
    user_email = user.email
    
    # 연관 데이터 개수 확인 (로깅용)
    clothes_count = user.clothes.count()
    coordinations_count = user.coordinations.count()
    
    try:
        # 계정 삭제 (CASCADE로 Clothes, Coordination 자동 삭제)
        user.delete()
        
        logger.info(f"Guest account deleted: {username} ({user_email})")
        logger.info(f"   - Deleted {clothes_count} clothes items")
        logger.info(f"   - Deleted {coordinations_count} coordinations")
        
        return Response({
            'success': True,
            'message': '게스트 계정이 삭제되었습니다.',
            'deleted_user': username,
            'deleted_items': {
                'clothes': clothes_count,
                'coordinations': coordinations_count
            }
        })
        
    except Exception as e:
        logger.error(f"Failed to delete guest account {username}: {str(e)}")
        return Response(
            {
                'success': False,
                'error': f'계정 삭제 중 오류가 발생했습니다: {str(e)}'
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================
# 의류 관련
# ============================================

@api_view(['GET', 'POST'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def clothes_list(request):
    """
    의류 목록 조회 및 생성
    이메일 토큰으로 사용자 인증
    
    POST 요청 시 multipart/form-data로 이미지 파일 전송:
    - main_category: 메인 카테고리 (TOP, BOTTOM, OUTER)
    - sub_category: 서브 카테고리 (TOP_TSHIRT_SHORT, etc.)
    - name: 의류 이름
    - color: 색상
    - detail: 설명 (선택)
    - image: 이미지 파일 (선택)
    
    v2.1: main_category, sub_category로 필터링
    v3.0: 이미지 없이도 등록 가능 (detail 필수)
    """
    user = get_user_from_email_token(request)
    if not user:
        return Response({'error': '인증 실패'}, status=status.HTTP_401_UNAUTHORIZED)
    
    if request.method == 'GET':
        # 쿼리 파라미터로 필터링
        main_category = request.query_params.get('main_category', None)
        sub_category = request.query_params.get('sub_category', None)
        
        queryset = Clothes.objects.filter(user=user)
        
        if main_category:
            queryset = queryset.filter(main_category=main_category.upper())
        
        if sub_category:
            queryset = queryset.filter(sub_category=sub_category.upper())
        
        # request를 context에 전달하여 절대 URL 생성
        serializer = ClothesSerializer(queryset, many=True, context={'request': request})
        
        return Response({
            'count': len(serializer.data),
            'results': serializer.data
        })
    
    elif request.method == 'POST':
        # request를 context에 전달
        serializer = ClothesCreateSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            clothes = serializer.save(user=user)
            # 응답에 image_url 포함
            response_serializer = ClothesSerializer(clothes, context={'request': request})
            
            logger.info(f"New clothes created: {clothes.name} for user {user.email}")
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        
        logger.error(f"Clothes creation failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def analyze_clothing_image(request):
    """
    새로운 엔드포인트: Gemini AI를 사용하여 옷 이미지 분석
    
    클라이언트가 이 엔드포인트를 호출하여 실시간 AI 분석 진행 상황을 받습니다.
    
    요청 파라미터:
    - image: 이미지 파일
    - main_category: TOP, BOTTOM, OUTER
    - sub_category: 세부 카테고리
    - name: 옷 이름
    - color: 색상
    
    응답:
    - status: 'processing' | 'completed' | 'error'
    - progress: 0-100
    - message: 진행 상황 메시지
    - detail: 분석 결과 (completed일 때)
    - analysis: AI 분석 JSON (completed일 때)
    """
    if not GEMINI_AVAILABLE:
        return Response({
            'status': 'error',
            'message': 'Gemini AI 서비스를 사용할 수 없습니다'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    try:
        # 파라미터 추출
        image_file = request.FILES.get('image')
        main_category = request.data.get('main_category', '')
        sub_category = request.data.get('sub_category', '')
        name = request.data.get('name', '')
        color = request.data.get('color', '')
        
        if not all([image_file, main_category, sub_category, name, color]):
            return Response({
                'status': 'error',
                'message': '필수 파라미터가 누락되었습니다'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Gemini 분석 시작
        logger.info(f"Starting AI analysis for {name}")
        
        result = analyze_clothing_with_gemini(
            image_file=image_file,
            main_category=main_category,
            sub_category=sub_category,
            name=name,
            color=color
        )
        
        if not result or 'detail' not in result:
            raise Exception("AI 분석 결과가 비어있습니다")
        
        logger.info(f"AI analysis completed for {name}")
        
        return Response({
            'status': 'completed',
            'progress': 100,
            'message': 'AI 분석이 완료되었습니다',
            'detail': result['detail'],
            'analysis': result.get('analysis', {})
        })
        
    except Exception as e:
        logger.error(f"AI analysis error: {str(e)}")
        return Response({
            'status': 'error',
            'message': f'분석 중 오류가 발생했습니다: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def clothes_detail(request, pk):
    """
    의류 상세 조회, 수정, 삭제
    이메일 토큰으로 사용자 인증
    """
    user = get_user_from_email_token(request)
    if not user:
        return Response({'error': '인증 실패'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        clothes = Clothes.objects.get(pk=pk, user=user)
    except Clothes.DoesNotExist:
        return Response(
            {'error': '의류를 찾을 수 없습니다'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = ClothesSerializer(clothes, context={'request': request})
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = ClothesCreateSerializer(
            clothes, 
            data=request.data, 
            partial=partial,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            response_serializer = ClothesSerializer(clothes, context={'request': request})
            return Response(response_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # 이미지 파일도 함께 삭제
        if clothes.image:
            clothes.image.delete(save=False)
        
        clothes.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def clothes_detail(request, pk):
    """
    의류 상세 조회, 수정, 삭제
    이메일 토큰으로 사용자 인증
    
    PUT/PATCH: 옷 이름, 서브카테고리 등 수정 가능
    """
    user = get_user_from_email_token(request)
    if not user:
        return Response({'error': '인증 실패'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        clothes = Clothes.objects.get(pk=pk, user=user)
    except Clothes.DoesNotExist:
        return Response(
            {'error': '의류를 찾을 수 없습니다'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = ClothesSerializer(clothes, context={'request': request})
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = ClothesCreateSerializer(
            clothes,
            data=request.data,
            partial=partial,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            # 수정된 데이터를 ClothesSerializer로 반환
            response_serializer = ClothesSerializer(clothes, context={'request': request})
            logger.info(f"Clothes updated: {clothes.id} - {clothes.name} by user {user.email}")
            return Response(response_serializer.data)
        
        logger.error(f"Clothes update failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # 이미지 파일도 함께 삭제
        if clothes.image:
            clothes.image.delete(save=False)
        
        logger.info(f"Clothes deleted: {clothes.id} - {clothes.name} by user {user.email}")
        clothes.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
def closet_stats(request):
    """
    옷장 통계 조회
    이메일 토큰으로 사용자 인증
    
    v2.1: main_category 기준으로 통계 계산
    """
    user = get_user_from_email_token(request)
    if not user:
        return Response({'error': '인증 실패'}, status=status.HTTP_401_UNAUTHORIZED)
    
    # 메인 카테고리별 옷 개수
    category_counts = {}
    for choice in Clothes.MAIN_CATEGORY_CHOICES:
        category_code = choice[0]
        category_name = choice[1]
        count = Clothes.objects.filter(user=user, main_category=category_code).count()
        category_counts[category_code] = {
            'name': category_name,
            'count': count
        }
    
    return Response({
        'total': Clothes.objects.filter(user=user).count(),
        'by_main_category': category_counts
    })


# ============================================
# v5.3: 코디 추천 API + DB 저장 + 중복 체크 + 즐겨찾기 참고
# ============================================
# 
# 이 파일은 views.py의 recommend_outfit 함수만 포함합니다.
# 기존 views.py의 recommend_outfit 함수 (약 528줄 ~ 782줄)를 이 코드로 교체하세요.
#

@api_view(['POST'])
def recommend_outfit(request):
    """
    AI 기반 코디 추천 엔드포인트 + DB 저장
    
    v5.3 업데이트: 즐겨찾기(좋아요) 코디를 참고하여 사용자 취향 반영
    
    요청 본문 (JSON):
    {
        "recommendation_type": "weather" | "schedule" | "ai",
        "weather_data": {
            "temp": 15,
            "feels_like": 13,
            "description": "맑음",
            "humidity": 65,
            "wind_speed": 3.5
        },
        "calendar_events": [
            {
                "title": "회의",
                "start_time": "14:00",
                "end_time": "15:00",
                "description": "..."
            }
        ]
    }
    
    응답:
    {
        "success": true,
        "coordination_id": 123,
        "recommendation": {
            "outfit_title": "코디 제목",
            "outfit_description": "코디 설명",
            "top": { "id": 1, "name": "화이트 티셔츠", "color": "흰색" },
            "bottom": { "id": 2, "name": "블루 청바지", "color": "남색" },
            "outer": { "id": 3, "name": "네이비 가디건", "color": "네이비" } | null,
            "reason": "추천 이유",
            "style_tips": "스타일링 팁"
        }
    }
    """
    if not OUTFIT_RECOMMENDATION_AVAILABLE:
        return Response({
            'success': False,
            'error': 'AI 코디 추천 서비스를 사용할 수 없습니다'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    user = get_user_from_email_token(request)
    if not user:
        return Response({'error': '인증 실패'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        # 요청 데이터 추출
        recommendation_type = request.data.get('recommendation_type', 'weather')
        weather_data = request.data.get('weather_data', None)
        calendar_events = request.data.get('calendar_events', None)
        style_preference = request.data.get('style_preference', None)  # 스타일 선호도
        
        logger.info(f"Outfit recommendation request from {user.email} (type: {recommendation_type})")
        
        # 사용자의 모든 옷장 데이터 가져오기
        clothes_queryset = Clothes.objects.filter(user=user)
        
        if clothes_queryset.count() == 0:
            return Response({
                'success': False,
                'error': '옷장이 비어있습니다. 옷을 먼저 등록해주세요.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 옷장 데이터를 딕셔너리 리스트로 변환
        clothes_data = []
        for clothes in clothes_queryset:
            clothes_data.append({
                'id': clothes.id,
                'main_category': clothes.main_category,
                'sub_category': clothes.sub_category,
                'name': clothes.name,
                'color': clothes.color,
                'detail': clothes.detail or '상세 정보 없음'
            })
        
        logger.info(f"Fetched {len(clothes_data)} clothes items from closet")
        from django.utils import timezone
        from datetime import timedelta

        # 오늘 이미 추천받은 조합들 확인
        today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)
        
        today_coordinations = Coordination.objects.filter(
            user=user,
            created_at__gte=today_start,
            created_at__lt=today_end
        ).prefetch_related('items__clothes')
        
        existing_combinations = []
        for coord in today_coordinations:
            combo = []
            for item in coord.items.all():
                combo.append(f"{item.clothes.main_category}:{item.clothes.id}")
            if combo:
                existing_combinations.append(", ".join(combo))
        
        if existing_combinations:
            logger.info(f"Found {len(existing_combinations)} existing outfits today")
        
        # v5.3: 즐겨찾기(좋아요) 코디 조회
        favorite_outfits = []
        try:
            favorite_coordinations = Coordination.objects.filter(
                user=user,
                is_favorite=True
            ).prefetch_related('items__clothes').order_by('-updated_at')[:10]  # 최근 10개
            
            for coord in favorite_coordinations:
                outfit_info = {
                    'id': coord.id,
                    'name': coord.name,
                    'detail': coord.detail,
                    'items': []
                }
                
                for item in coord.items.all():
                    outfit_info['items'].append({
                        'category': item.clothes.main_category,
                        'name': item.clothes.name,
                        'color': item.clothes.color,
                        'sub_category': item.clothes.sub_category
                    })
                
                favorite_outfits.append(outfit_info)
            
            if favorite_outfits:
                logger.info(f"Found {len(favorite_outfits)} favorite outfits for style reference")
        except Exception as fav_error:
            logger.warning(f"Failed to fetch favorite outfits: {str(fav_error)}")
            # 즐겨찾기 조회 실패해도 추천은 계속 진행
        
        # 사용자 성별 정보
        user_gender = user.sex if hasattr(user, 'sex') else None

        # 사용자 성별 정보 가져오기
        user_gender = user.sex if hasattr(user, 'sex') else None
        if user_gender:
            logger.info(f"User gender: {user_gender}")
        
        # Gemini AI로 코디 추천 (v5.3: favorite_outfits 추가)
        result = recommend_outfit_with_gemini(
            clothes_data=clothes_data,
            weather_data=weather_data,
            calendar_events=calendar_events,
            recommendation_type=recommendation_type,
            user_gender=user_gender,
            existing_combinations=existing_combinations,
            favorite_outfits=favorite_outfits,  # v5.3: 즐겨찾기 코디 전달
            style_preference=style_preference  # v5.4: 스타일 선호도 전달
        )
        
        # 에러 체크
        if result.get('error'):
            return Response({
                'success': False,
                'error': result.get('message', '코디 추천에 실패했습니다')
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # ===== v5.0: DB에 저장 전 중복 체크 =====
        coordination_id = None
        try:
            from django.utils import timezone
            from datetime import timedelta
            
            today_start = timezone.now().replace(hour=0, minute=0, second=0, microsecond=0)
            today_end = today_start + timedelta(days=1)
            
            # 오늘 생성된 코디네이션 중 같은 의류 조합이 있는지 확인
            clothing_ids = set()
            if result.get('top_id'):
                clothing_ids.add(result.get('top_id'))
            if result.get('bottom_id'):
                clothing_ids.add(result.get('bottom_id'))
            if result.get('outer_id'):
                clothing_ids.add(result.get('outer_id'))
            
            # 오늘 생성된 모든 코디네이션 확인
            today_coordinations = Coordination.objects.filter(
                user=user,
                created_at__gte=today_start,
                created_at__lt=today_end
            ).prefetch_related('items__clothes')
            
            is_duplicate = False
            for coord in today_coordinations:
                existing_ids = set(item.clothes.id for item in coord.items.all())
                if existing_ids == clothing_ids:
                    is_duplicate = True
                    logger.info(f"Duplicate outfit found: {coord.name}")
                    break
            
            # 중복이면 클라이언트가 재시도하도록 지시
            if is_duplicate:
                logger.warning("Duplicate outfit detected, asking client to retry")
                return Response({
                    'success': False,
                    'error': 'duplicate',
                    'message': '중복된 코디입니다. 다른 조합을 추천받으세요.',
                    'retry': True
                }, status=status.HTTP_409_CONFLICT)
            
            # ===== Coordination DB에 저장 =====
            coordination = Coordination.objects.create(
                user=user,
                name=result.get('outfit_title', 'AI 추천 코디'),
                detail=f"{result.get('outfit_description', '')}\n\n추천 이유: {result.get('reason', '')}\n\n스타일 팁: {result.get('style_tips', '')}"
            )
            
            coordination_id = coordination.id
            
            # CoordinationItem 레코드들 생성 (layer_order: 0=상의, 1=하의, 2=아우터)
            layer_items = []
            
            if result.get('top_id'):
                top_clothes = Clothes.objects.get(id=result.get('top_id'), user=user)
                CoordinationItem.objects.create(
                    coordination=coordination,
                    clothes=top_clothes,
                    layer_order=0
                )
                layer_items.append(f"상의: {top_clothes.name}")
            
            if result.get('bottom_id'):
                bottom_clothes = Clothes.objects.get(id=result.get('bottom_id'), user=user)
                CoordinationItem.objects.create(
                    coordination=coordination,
                    clothes=bottom_clothes,
                    layer_order=1
                )
                layer_items.append(f"하의: {bottom_clothes.name}")
            
            if result.get('outer_id'):
                outer_clothes = Clothes.objects.get(id=result.get('outer_id'), user=user)
                CoordinationItem.objects.create(
                    coordination=coordination,
                    clothes=outer_clothes,
                    layer_order=2
                )
                layer_items.append(f"아우터: {outer_clothes.name}")
            
            logger.info(f"Coordination saved to DB: {coordination.name} (ID: {coordination.id})")
            logger.info(f"   Items: {', '.join(layer_items)}")
            
        except Exception as db_error:
            logger.error(f"Failed to save coordination to DB: {str(db_error)}")
            # DB 저장 실패해도 추천 결과는 반환
        
        # 응답 포맷팅
        response_data = {
            'success': True,
            'coordination_id': coordination_id,
            'recommendation': {
                'outfit_title': result.get('outfit_title'),
                'outfit_description': result.get('outfit_description'),
                'top': {
                    'id': result.get('top_id'),
                    'name': result.get('top_name'),
                    'color': result.get('top_color')
                } if result.get('top_id') else None,
                'bottom': {
                    'id': result.get('bottom_id'),
                    'name': result.get('bottom_name'),
                    'color': result.get('bottom_color')
                } if result.get('bottom_id') else None,
                'outer': {
                    'id': result.get('outer_id'),
                    'name': result.get('outer_name'),
                    'color': result.get('outer_color')
                } if result.get('outer_id') else None,
                'reason': result.get('reason'),
                'style_tips': result.get('style_tips')
            }
        }
        
        logger.info(f"Outfit recommendation completed: {result.get('outfit_title')}")
        
        return Response(response_data)
        
    except Exception as e:
        logger.error(f"Outfit recommendation error: {str(e)}")
        return Response({
            'success': False,
            'error': f'코디 추천 중 오류가 발생했습니다: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================
# 코디네이션 관련
# ============================================

@api_view(['GET', 'POST'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def coordination_list(request):
    """
    코디네이션 목록 조회 및 생성
    이메일 토큰으로 사용자 인증
    """
    user = get_user_from_email_token(request)
    if not user:
        return Response({'error': '인증 실패'}, status=status.HTTP_401_UNAUTHORIZED)
    
    if request.method == 'GET':
        queryset = Coordination.objects.filter(user=user)
        serializer = CoordinationSerializer(queryset, many=True, context={'request': request})
        
        return Response({
            'count': len(serializer.data),
            'results': serializer.data
        })
    
    elif request.method == 'POST':
        serializer = CoordinationCreateSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            coordination = serializer.save(user=user)
            response_serializer = CoordinationSerializer(
                coordination, 
                context={'request': request}
            )
            
            logger.info(f"New coordination created: {coordination.name} for user {user.email}")
            return Response(
                response_serializer.data, 
                status=status.HTTP_201_CREATED
            )
        
        logger.error(f"Coordination creation failed: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@parser_classes([MultiPartParser, FormParser, JSONParser])
def coordination_detail(request, pk):
    """
    코디네이션 상세 조회, 수정, 삭제
    이메일 토큰으로 사용자 인증
    """
    user = get_user_from_email_token(request)
    if not user:
        return Response({'error': '인증 실패'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        coordination = Coordination.objects.get(pk=pk, user=user)
    except Coordination.DoesNotExist:
        return Response(
            {'error': '코디네이션을 찾을 수 없습니다'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    if request.method == 'GET':
        serializer = CoordinationSerializer(coordination, context={'request': request})
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        partial = request.method == 'PATCH'
        serializer = CoordinationCreateSerializer(
            coordination,
            data=request.data,
            partial=partial,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            response_serializer = CoordinationSerializer(
                coordination, 
                context={'request': request}
            )
            return Response(response_serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        # 이미지 파일도 함께 삭제
        if coordination.image:
            coordination.image.delete(save=False)
        
        coordination.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['POST'])
def generate_virtual_tryon(request, pk):
    """
    기존 코디네이션의 가상 착용 이미지 생성
    
    사용자가 "입어보기" 버튼을 누르면 호출되는 엔드포인트
    
    응답:
    {
        "success": true,
        "coordination_id": 123,
        "image_url": "http://...../coordinations/2024/01/01/virtual_tryon.jpg",
        "message": "가상 착용 이미지가 생성되었습니다"
    }
    """
    if not IMAGE_GENERATION_AVAILABLE:
        return Response({
            'success': False,
            'error': '이미지 생성 서비스를 사용할 수 없습니다'
        }, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    user = get_user_from_email_token(request)
    if not user:
        return Response({'error': '인증 실패'}, status=status.HTTP_401_UNAUTHORIZED)
    
    # 사용자의 전신 사진 확인
    if not user.body_photo:
        return Response({
            'success': False,
            'error': '전신 사진을 먼저 업로드해주세요'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # 코디네이션 조회
        coordination = Coordination.objects.get(pk=pk, user=user)
    except Coordination.DoesNotExist:
        return Response(
            {'error': '코디네이션을 찾을 수 없습니다'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # 이미 이미지가 있는 경우
    if coordination.image:
        logger.info(f"Coordination {pk} already has an image")
        serializer = CoordinationSerializer(coordination, context={'request': request})
        return Response({
            'success': True,
            'coordination_id': coordination.id,
            'image_url': serializer.data['image_url'],
            'message': '이미 생성된 이미지가 있습니다'
        })
    
    try:
        logger.info(f"Starting virtual try-on generation for coordination {pk}")
        
        # 코디네이션의 의류 아이템들 가져오기
        items = coordination.items.all().select_related('clothes')
        
        if items.count() == 0:
            return Response({
                'success': False,
                'error': '코디에 의류가 없습니다'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 의류 이미지 정보 수집
        clothing_images = []
        for item in items:
            clothes = item.clothes
            clothing_images.append({
                'category': clothes.main_category,
                'path': clothes.image.path,
                'name': clothes.name,
                'color': clothes.color,
                'detail': clothes.detail or ''
            })
        
        logger.info(f"Collected {len(clothing_images)} clothing items")
        
        # 이미지 생성 호출
        generated_image = generate_virtual_tryon_with_gemini(
            body_photo_path=user.body_photo.path,
            clothing_images=clothing_images,
            outfit_description=coordination.name,
            outfit_details=coordination.detail,
            user_gender=user.sex if user.sex else 'M'
        )
        
        if not generated_image:
            return Response({
                'success': False,
                'error': '이미지 생성에 실패했습니다'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # 생성된 이미지를 Coordination에 저장
        coordination.image = generated_image
        coordination.save()
        
        logger.info(f"Virtual try-on image saved for coordination {coordination.id}")
        
        # 응답 반환
        serializer = CoordinationSerializer(coordination, context={'request': request})
        return Response({
            'success': True,
            'coordination_id': coordination.id,
            'image_url': serializer.data['image_url'],
            'message': '가상 착용 이미지가 생성되었습니다'
        })
        
    except Exception as e:
        logger.error(f"Failed to generate virtual try-on image: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        
        return Response({
            'success': False,
            'error': f'이미지 생성 중 오류가 발생했습니다: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def toggle_favorite(request, pk):
    """
    코디네이션 즐겨찾기 토글
    이메일 토큰으로 사용자 인증
    """
    user = get_user_from_email_token(request)
    if not user:
        return Response({'error': '인증 실패'}, status=status.HTTP_401_UNAUTHORIZED)
    
    try:
        coordination = Coordination.objects.get(pk=pk, user=user)
    except Coordination.DoesNotExist:
        return Response(
            {'error': '코디네이션을 찾을 수 없습니다'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # 즐겨찾기 토글
    coordination.is_favorite = not coordination.is_favorite
    coordination.save()
    
    serializer = CoordinationSerializer(coordination, context={'request': request})
    return Response(serializer.data)


# ============================================
# 이미지 리사이징 (캐시 최적화용)
# ============================================

from django.http import HttpResponse, Http404
from django.views.decorators.http import require_http_methods
from django.views.decorators.cache import cache_page
import os

@require_http_methods(["GET"])
@cache_page(60 * 60 * 24 * 7)  # 7일간 캐시
def serve_resized_image(request, path):
    """
    동적 이미지 리사이징 엔드포인트
    
    사용법:
    - 원본: /media/clothes/image.jpg
    - 썸네일: /media/clothes/image.jpg?size=200
    - 썸네일: /media/clothes/image.jpg?width=200&height=200
    
    쿼리 파라미터:
    - size: 정사각형 크기 (예: size=200 → 200x200)
    - width, height: 개별 지정 (예: width=300&height=200)
    - quality: JPEG 품질 (기본값: 85)
    """
    try:
        # 원본 파일 경로
        from django.conf import settings
        file_path = os.path.join(settings.MEDIA_ROOT, path)
        
        if not os.path.exists(file_path):
            raise Http404("파일을 찾을 수 없습니다")
        
        # 쿼리 파라미터 추출
        size = request.GET.get('size')
        width = request.GET.get('width')
        height = request.GET.get('height')
        quality = int(request.GET.get('quality', 85))
        
        # 원본 이미지 열기
        img = Image.open(file_path)
        
        # 리사이징 처리
        if size:
            size = int(size)
            img.thumbnail((size, size), Image.Resampling.LANCZOS)
        elif width or height:
            new_width = int(width) if width else img.width
            new_height = int(height) if height else img.height
            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        
        # 이미지를 메모리 버퍼에 저장
        buffer = io.BytesIO()
        img_format = img.format if img.format else 'JPEG'
        img.save(buffer, format=img_format, quality=quality, optimize=True)
        buffer.seek(0)
        
        # HTTP 응답 생성
        content_type = f'image/{img_format.lower()}'
        response = HttpResponse(buffer.getvalue(), content_type=content_type)
        response['Cache-Control'] = 'public, max-age=604800'  # 7일
        
        return response
        
    except Exception as e:
        logger.error(f"Image resizing error for {path}: {str(e)}")
        raise Http404("이미지 처리 실패")


@require_http_methods(["GET"])
def serve_media(request, path):
    """
    미디어 파일 서빙 (개발용)
    프로덕션에서는 Nginx/Apache로 대체해야 합니다.
    """
    # 쿼리 파라미터가 있으면 리사이징 뷰로 전달
    if request.GET:
        return serve_resized_image(request, path)
    
    # 쿼리 파라미터 없으면 원본 반환
    try:
        from django.conf import settings
        file_path = os.path.join(settings.MEDIA_ROOT, path)
        
        if not os.path.exists(file_path):
            raise Http404("파일을 찾을 수 없습니다")
        
        # 파일 타입 결정
        content_type = 'application/octet-stream'
        if file_path.lower().endswith(('.jpg', '.jpeg')):
            content_type = 'image/jpeg'
        elif file_path.lower().endswith('.png'):
            content_type = 'image/png'
        elif file_path.lower().endswith('.gif'):
            content_type = 'image/gif'
        elif file_path.lower().endswith('.webp'):
            content_type = 'image/webp'
        
        with open(file_path, 'rb') as f:
            response = HttpResponse(f.read(), content_type=content_type)
            response['Cache-Control'] = 'public, max-age=604800'
            return response
            
    except Exception as e:
        logger.error(f"Media serving error for {path}: {str(e)}")
        raise Http404("파일을 찾을 수 없습니다")