#!/bin/bash
# reset_db.sh
# 데이터베이스 초기화 및 마이그레이션 스크립트
# ⭐ v2.1: 모든 Django 테이블 완전 삭제

echo "======================================"
echo "🔄 Orbit DB 초기화 시작"
echo "======================================"

# 가상환경 활성화 확인
if [ -z "$VIRTUAL_ENV" ]; then
    echo "⚠️  가상환경이 활성화되지 않았습니다."
    echo "다음 명령어로 활성화하세요:"
    echo "source ~/orbitserver/bin/activate"
    exit 1
fi

# 프로젝트 디렉토리 확인
if [ ! -f "manage.py" ]; then
    echo "❌ manage.py 파일을 찾을 수 없습니다."
    echo "프로젝트 루트 디렉토리에서 실행하세요."
    exit 1
fi

echo ""
echo "⚠️  경고: 이 작업은 모든 데이터를 삭제합니다!"
read -p "계속하시겠습니까? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ 작업이 취소되었습니다."
    exit 0
fi

echo ""
echo "======================================"
echo "1️⃣  기존 마이그레이션 파일 삭제"
echo "======================================"

# accounts 앱의 마이그레이션 파일 삭제 (init 제외)
if [ -d "accounts/migrations" ]; then
    echo "🗑️  accounts/migrations/ 폴더의 마이그레이션 파일 삭제 중..."
    find accounts/migrations -name "*.py" ! -name "__init__.py" -delete
    find accounts/migrations -name "*.pyc" -delete
    echo "✅ 마이그레이션 파일 삭제 완료"
else
    echo "⚠️  accounts/migrations/ 폴더가 없습니다."
    mkdir -p accounts/migrations
    touch accounts/migrations/__init__.py
    echo "✅ migrations 폴더 생성 완료"
fi

echo ""
echo "======================================"
echo "2️⃣  데이터베이스 초기화"
echo "======================================"

# MySQL 접속 정보 (환경변수에서 읽기)
DB_NAME=${DB_NAME:-orbit_db}
DB_USER=${DB_USER:-orbit_admin}
DB_PASSWORD=${DB_PASSWORD:-YOUR_DB_PASSWORD}

echo "🗄️  데이터베이스: $DB_NAME"
echo "👤 사용자: $DB_USER"

# ⭐ 모든 테이블 완전 삭제 (Django 기본 테이블 포함)
echo "🗑️  기존 테이블 삭제 중..."
mysql -u $DB_USER -p$DB_PASSWORD $DB_NAME << EOF
SET FOREIGN_KEY_CHECKS = 0;

-- Orbit 앱 테이블
DROP TABLE IF EXISTS coordination_items;
DROP TABLE IF EXISTS coordinations;
DROP TABLE IF EXISTS clothes;
DROP TABLE IF EXISTS users;

-- Django 기본 인증 테이블
DROP TABLE IF EXISTS auth_group;
DROP TABLE IF EXISTS auth_group_permissions;
DROP TABLE IF EXISTS auth_permission;
DROP TABLE IF EXISTS auth_user;
DROP TABLE IF EXISTS auth_user_groups;
DROP TABLE IF EXISTS auth_user_user_permissions;

-- ⭐ User 모델의 ManyToMany 중간 테이블 (추가)
DROP TABLE IF EXISTS users_groups;
DROP TABLE IF EXISTS users_user_permissions;

-- Django 관리 테이블
DROP TABLE IF EXISTS django_admin_log;
DROP TABLE IF EXISTS django_content_type;
DROP TABLE IF EXISTS django_migrations;
DROP TABLE IF EXISTS django_session;

SET FOREIGN_KEY_CHECKS = 1;
EOF

if [ $? -eq 0 ]; then
    echo "✅ 기존 테이블 삭제 완료"
else
    echo "❌ 테이블 삭제 실패"
    echo "수동으로 MySQL에 접속하여 확인하세요:"
    echo "mysql -u $DB_USER -p $DB_NAME"
    exit 1
fi

echo ""
echo "======================================"
echo "3️⃣  새 마이그레이션 생성"
echo "======================================"

python manage.py makemigrations accounts

if [ $? -ne 0 ]; then
    echo "❌ 마이그레이션 생성 실패"
    exit 1
fi

echo "✅ 마이그레이션 파일 생성 완료"

echo ""
echo "======================================"
echo "4️⃣  마이그레이션 적용"
echo "======================================"

python manage.py migrate

if [ $? -ne 0 ]; then
    echo "❌ 마이그레이션 적용 실패"
    exit 1
fi

echo "✅ 마이그레이션 적용 완료"

echo ""
echo "======================================"
echo "5️⃣  슈퍼유저 생성 (선택사항)"
echo "======================================"

read -p "관리자 계정을 생성하시겠습니까? (yes/no): " create_superuser

if [ "$create_superuser" = "yes" ]; then
    echo "📝 관리자 정보를 입력하세요:"
    python manage.py createsuperuser
fi

echo ""
echo "======================================"
echo "✅ DB 초기화 완료!"
echo "======================================"
echo ""
echo "📊 데이터베이스 구조 확인:"
python manage.py showmigrations

echo ""
echo "🎉 모든 작업이 완료되었습니다!"
echo ""
echo "📝 참고사항:"
echo "- v2.1: main_category, sub_category 구조로 변경"
echo "- 이미지는 서버의 media/ 폴더에 저장됩니다"
echo "- DB에는 이미지 파일 경로가 저장됩니다"
echo ""
echo "다음 명령어로 서버를 시작할 수 있습니다:"
echo "python manage.py runserver 0.0.0.0:8000"
echo ""