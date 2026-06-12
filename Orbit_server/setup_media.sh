#!/bin/bash
# setup_media.sh
# MEDIA 디렉토리 설정 스크립트

echo "============================================"
echo "Orbit Backend - MEDIA 디렉토리 설정"
echo "============================================"

# 프로젝트 루트 디렉토리로 이동
cd "$(dirname "$0")"

# MEDIA 디렉토리 생성
echo "📁 MEDIA 디렉토리 생성 중..."
mkdir -p media/clothes
mkdir -p media/coordinations

# 권한 설정
echo "🔒 권한 설정 중..."
chmod 755 media
chmod 755 media/clothes
chmod 755 media/coordinations

echo ""
echo "✅ MEDIA 디렉토리 설정 완료!"
echo ""
echo "생성된 디렉토리:"
echo "  - media/"
echo "  - media/clothes/"
echo "  - media/coordinations/"
echo ""
echo "⚠️  주의사항:"
echo "  1. 프로덕션 환경에서는 별도의 파일 저장소 사용을 권장합니다"
echo "  2. .gitignore에 /media/ 추가를 권장합니다"
echo "  3. 정기적인 백업을 설정하세요"
echo ""