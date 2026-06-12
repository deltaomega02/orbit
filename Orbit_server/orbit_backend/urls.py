# orbit_backend/urls.py
# 메인 프로젝트 URL 설정

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static

# 이미지 리사이징을 위한 뷰 임포트
from accounts.views import serve_media

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),
    
    path('dashboard/', include('accounts.dashboard_urls')),
    path('api/dashboard/', include('accounts.dashboard_urls')),

    # ============================================
    # 미디어 파일 서빙 (동적 리사이징 지원)
    # ============================================
    re_path(r'^media/(?P<path>.*)$', serve_media, name='serve_media'),
]

# ============================================================================
# 개발 환경에서 MEDIA 파일 서빙
# ============================================================================
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)