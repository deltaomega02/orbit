# accounts/admin.py
# Django Admin 페이지 설정
# v2.1 업데이트: main_category, sub_category 필드 표시

from django.contrib import admin
from .models import User, Clothes, Coordination, CoordinationItem


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    """사용자 관리"""
    list_display = ['email', 'username', 'sex', 'height', 'weight', 'created_at']
    list_filter = ['sex', 'created_at']
    search_fields = ['email', 'username']
    ordering = ['-created_at']


@admin.register(Clothes)
class ClothesAdmin(admin.ModelAdmin):
    """의류 관리"""
    list_display = ['id', 'name', 'main_category', 'sub_category', 'color', 'user', 'created_at']
    list_filter = ['main_category', 'sub_category', 'color', 'created_at']
    search_fields = ['name', 'user__email', 'detail']
    ordering = ['-created_at']
    
    # 이미지 미리보기 (선택사항)
    readonly_fields = ['image_preview']
    
    def image_preview(self, obj):
        if obj.image:
            return f'<img src="{obj.image.url}" width="200" />'
        return "No Image"
    image_preview.allow_tags = True
    image_preview.short_description = '이미지 미리보기'


@admin.register(Coordination)
class CoordinationAdmin(admin.ModelAdmin):
    """코디네이션 관리"""
    list_display = ['id', 'name', 'user', 'is_favorite', 'created_at']
    list_filter = ['is_favorite', 'created_at']
    search_fields = ['name', 'user__email', 'detail']
    ordering = ['-created_at']


@admin.register(CoordinationItem)
class CoordinationItemAdmin(admin.ModelAdmin):
    """코디네이션 아이템 관리"""
    list_display = ['coordination', 'clothes', 'layer_order']
    list_filter = ['layer_order']
    ordering = ['coordination', 'layer_order']