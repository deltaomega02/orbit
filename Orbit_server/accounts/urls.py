# accounts/urls.py
# API URL 라우팅 설정
# v4.0: 코디 추천 엔드포인트 추가

from django.urls import path
from . import views

urlpatterns = [
    # 테스트
    path('test/', views.test_connection, name='test_connection'),
    
    # 인증
    path('auth/google/', views.google_login, name='google_login'),
    path('auth/guest/', views.delete_guest_account, name='delete_guest_account'),  # 로그아웃 후 계정 삭제
    
    # 사용자 프로필
    path('user/profile/', views.user_profile, name='user_profile'),
    
    # 의류 관리
    path('clothes/', views.clothes_list, name='clothes_list'),
    path('clothes/<int:pk>/', views.clothes_detail, name='clothes_detail'),
    path('clothes/stats/', views.closet_stats, name='closet_stats'),
    path('clothes/analyze/', views.analyze_clothing_image, name='analyze_clothing_image'),
    
    # 코디 추천
    path('outfit/recommend/', views.recommend_outfit, name='recommend_outfit'),
    
    # 코디네이션
    path('coordinations/', views.coordination_list, name='coordination_list'),
    path('coordinations/<int:pk>/', views.coordination_detail, name='coordination_detail'),
    path('coordinations/<int:pk>/favorite/', views.toggle_favorite, name='toggle_favorite'),
    path('coordinations/<int:pk>/generate-tryon/', views.generate_virtual_tryon, name='generate-virtual-tryon'),
]