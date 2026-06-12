# accounts/models.py
# 사용자, 의류, 코디네이션 모델 정의
# v2.1 업데이트: main_category, sub_category 필드 추가

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    커스텀 사용자 모델
    Google 로그인을 통해 생성되며, 의류와 코디네이션의 소유자
    """
    
    # 기본 로그인 정보
    email = models.EmailField(
        unique=True,
        verbose_name='이메일',
        help_text='Google 로그인 이메일 (고유 식별자)'
    )
    google_id = models.CharField(
        max_length=255,
        unique=True,
        null=True,
        blank=True,
        verbose_name='Google ID',
        help_text='Google OAuth 고유 ID'
    )
    profile_picture = models.URLField(
        max_length=500,
        null=True,
        blank=True,
        verbose_name='프로필 사진',
        help_text='Google 프로필 사진 URL'
    )
    
    # 사용자 정보
    SEX_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]
    sex = models.CharField(
        max_length=10,
        choices=SEX_CHOICES,
        null=True,
        blank=True,
        verbose_name='성별'
    )
    height = models.FloatField(
        null=True,
        blank=True,
        verbose_name='신장(cm)',
        help_text='사용자 신장 (cm 단위)'
    )
    weight = models.FloatField(
        null=True,
        blank=True,
        verbose_name='체중(kg)',
        help_text='사용자 체중 (kg 단위)'
    )
    body_photo = models.ImageField(
        upload_to='body_photos/%Y/%m/%d/',
        null=True,
        blank=True,
        verbose_name='전신 사진',
        help_text='사용자 전신 사진 (가상 피팅용)'
    )
    
    # 타임스탬프
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='생성일'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='수정일'
    )
    
    # email을 username으로 사용
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'users'
        verbose_name = '사용자'
        verbose_name_plural = '사용자 목록'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.username} ({self.email})"


class Clothes(models.Model):
    """
    의류 아이템 모델
    사용자가 소유한 개별 의류 정보 저장
    
    v2.1 업데이트: main_category + sub_category 구조로 변경
    - main_category: TOP, BOTTOM, OUTER (3개로 간소화)
    - sub_category: 세부 카테고리 (예: TOP_TSHIRT_SHORT, BOTTOM_DENIM)
    """
    
    # 메인 카테고리 선택지 (3개로 간소화)
    MAIN_CATEGORY_CHOICES = [
        ('TOP', '상의'),
        ('BOTTOM', '하의'),
        ('OUTER', '아우터'),
    ]
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='clothes',
        verbose_name='소유자'
    )
    
    # 메인 카테고리
    main_category = models.CharField(
        max_length=50,
        choices=MAIN_CATEGORY_CHOICES,
        verbose_name='메인 카테고리',
        help_text='TOP, BOTTOM, OUTER 중 선택'
    )
    
    # 서브 카테고리
    sub_category = models.CharField(
        max_length=50,
        verbose_name='서브 카테고리',
        help_text='예: TOP_TSHIRT_SHORT, BOTTOM_DENIM, OUTER_JACKET'
    )
    
    name = models.CharField(
        max_length=200,
        verbose_name='의류 이름'
    )
    color = models.CharField(
        max_length=50,
        verbose_name='색상'
    )
    detail = models.TextField(
        null=True,
        blank=True,
        verbose_name='상세 설명',
        help_text='AI 자동 생성 또는 사용자 입력'
    )
    image = models.ImageField(
        upload_to='clothes/%Y/%m/%d/',
        verbose_name='의류 이미지',
        help_text='서버에 저장되는 실제 이미지 파일',
        null=True,
        blank=True
    )
    
    # 타임스탬프
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='등록일'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='수정일'
    )
    
    class Meta:
        db_table = 'clothes'
        verbose_name = '의류'
        verbose_name_plural = '의류 목록'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'main_category']),  # type → main_category
            models.Index(fields=['user', 'sub_category']),   # sub_category 인덱스 추가
            models.Index(fields=['user', 'color']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_main_category_display()} - {self.name}"


class Coordination(models.Model):
    """
    코디네이션 모델
    여러 의류를 조합한 전체 코디 정보 저장
    
    변경: 합성 이미지를 서버에 직접 저장 (ImageField)
    - 파일은 MEDIA_ROOT/coordinations/YYYY/MM/DD/ 경로에 저장
    """
    
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='coordinations',
        verbose_name='소유자'
    )
    name = models.CharField(
        max_length=200,
        verbose_name='코디 이름',
        help_text='예: 출근룩, 데이트룩'
    )
    detail = models.TextField(
        verbose_name='코디 설명',
        help_text='AI 생성 코디 설명 (TPO 분석)'
    )
    image = models.ImageField(
        upload_to='coordinations/%Y/%m/%d/',
        verbose_name='코디 이미지',
        help_text='서버에 저장되는 코디 합성 이미지'
    )
    is_favorite = models.BooleanField(
        default=False,
        verbose_name='즐겨찾기',
        help_text='즐겨찾기 여부'
    )
    
    # 타임스탬프
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='생성일'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='수정일'
    )
    
    class Meta:
        db_table = 'coordinations'
        verbose_name = '코디네이션'
        verbose_name_plural = '코디네이션 목록'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_favorite']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} by {self.user.username}"


class CoordinationItem(models.Model):
    """
    코디네이션 아이템 중간 테이블
    코디네이션과 의류 간의 Many-to-Many 관계 구현
    """
    
    coordination = models.ForeignKey(
        Coordination,
        on_delete=models.CASCADE,
        related_name='items',
        verbose_name='코디네이션'
    )
    clothes = models.ForeignKey(
        Clothes,
        on_delete=models.CASCADE,
        related_name='coordination_items',
        verbose_name='의류'
    )
    layer_order = models.IntegerField(
        default=0,
        verbose_name='레이어 순서',
        help_text='0:언더, 1:이너, 2:미들, 3:아우터, 4:하의, 5:신발, 6:악세서리'
    )
    
    class Meta:
        db_table = 'coordination_items'
        verbose_name = '코디네이션 아이템'
        verbose_name_plural = '코디네이션 아이템 목록'
        ordering = ['layer_order']
        indexes = [
            models.Index(fields=['coordination', 'layer_order']),
        ]
        # 같은 코디에 같은 옷이 중복으로 들어가지 않도록
        unique_together = [['coordination', 'clothes']]
    
    def __str__(self):
        return f"{self.coordination.name} - {self.clothes.name} (Layer {self.layer_order})"