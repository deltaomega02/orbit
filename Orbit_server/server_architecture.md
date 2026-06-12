# Orbit 서버 아키텍처

이 문서는 Orbit Django 서버의 아키텍처를 설명합니다.

## 프로젝트 구조

- `orbit_backend/`: 메인 Django 프로젝트 디렉토리.
  - `settings.py`: Django 설정 파일.
  - `urls.py`: 루트 URL 설정.
  - `wsgi.py` & `asgi.py`: 서버 진입점.
- `accounts/`: 사용자, 의류 및 코디네이션을 관리하는 Django 앱.
  - `models.py`: 데이터베이스 스키마 정의.
  - `views.py`: API 엔드포인트.
  - `urls.py`: 앱별 URL 라우팅.
  - `serializers.py`: 데이터 직렬화 (현재 비어 있음).
- `manage.py`: Django의 명령줄 유틸리티.
- `reset_db.sh`: 데이터베이스를 초기화하는 스크립트.
- `.env`: 환경 변수.

## 데이터베이스 모델 (`accounts/models.py`)

- **`User`**: 이메일을 사용자 이름으로 사용하는 커스텀 사용자 모델. 성별, 키, 몸무게와 같은 사용자 정보를 저장합니다.
- **`Clothes`**: 단일 의류 아이템을 나타냅니다. 종류, 이름, 색상 및 클라이언트 장치에 저장된 이미지 경로를 포함합니다.
- **`Coordination`**: `Clothes` 아이템 컬렉션인 코디네이션을 나타냅니다. 또한 클라이언트 장치에 있는 합성 이미지 경로를 저장합니다.
- **`CoordinationItem`**: `Coordination`과 `Clothes` 간의 다대다 관계를 위한 중간 모델로, 레이어 순서를 지정합니다.

## API 엔드포인트 (`accounts/urls.py` & `accounts/views.py`)

- **`/api/accounts/test/`**: 서버가 실행 중인지 확인하는 테스트 엔드포인트.

## 설정 (`orbit_backend/settings.py`)

- **데이터베이스**: MySQL을 사용하도록 구성되었습니다.
- **인증**: JWT 기반 인증을 위해 `rest_framework_simplejwt`를 사용합니다.
- **CORS**: 개발용으로 `CORS_ALLOW_ALL_ORIGINS = True`로 설정되었습니다.
- **커스텀 사용자 모델**: `AUTH_USER_MODEL = 'accounts.User'`.
- **이미지 처리**: 이미지는 클라이언트 측에 저장되며, 서버는 경로만 저장한다고 명시적으로 언급되어 있습니다.

## 스크립트

- **`reset_db.sh`**: 다음을 수행하는 쉘 스크립트:
  1. 기존 마이그레이션 삭제.
  2. 데이터베이스의 모든 테이블 삭제.
  3. 새 마이그레이션 생성.
  4. 마이그레이션 적용.
  5. 선택적으로 슈퍼유저 생성.

이 스크립트는 개발 중 데이터베이스를 깨끗한 상태로 빠르게 초기화하는 편리한 유틸리티입니다.