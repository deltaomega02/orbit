# Orbit 서버 아키텍처

이 문서는 Orbit Django 서버의 아키텍처를 설명합니다. (코드 기준 최신화: 2026-06-18)

## 프로젝트 구조

- `orbit_backend/`: 메인 Django 프로젝트 디렉토리.
  - `settings.py`: Django 설정 파일.
  - `urls.py`: 루트 URL 설정 (admin, `api/accounts/`, 미디어 리사이징 서빙).
  - `wsgi.py` & `asgi.py`: 서버 진입점.
- `accounts/`: 사용자, 의류 및 코디네이션을 관리하는 Django 앱.
  - `models.py`: 데이터베이스 스키마 정의.
  - `views.py`: API 엔드포인트 (함수 기반 뷰).
  - `urls.py`: 앱별 URL 라우팅.
  - `serializers.py`: DRF 직렬화 — User/Clothes/Coordination 등 직렬화 클래스가 정의되어 실제 사용 중.
  - `gemini_service.py` / `gemini_outfit_service.py` / `gemini_image_service.py`: Gemini 호출 서비스 3종.
- `manage.py`: Django의 명령줄 유틸리티.
- `reset_db.sh`: 데이터베이스를 초기화하는 스크립트.
- `.env`: 환경 변수 (DB 접속정보, `GEMINI_API_KEY`, `DJANGO_SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS` 등).

## 데이터베이스 모델 (`accounts/models.py`)

- **`User`**: 이메일을 `USERNAME_FIELD`로 사용하는 커스텀 사용자 모델. `google_id`, `profile_picture`, 성별/키/몸무게, 전신 사진(`body_photo`, ImageField) 저장.
- **`Clothes`**: 단일 의류 아이템. `main_category`(TOP/BOTTOM/OUTER), `sub_category`, 이름, 색상, AI 분석 결과(`detail`), 이미지(`image`, ImageField — **서버 MEDIA_ROOT에 파일로 저장**).
- **`Coordination`**: 의류 조합 코디. 이름, 설명(`detail`), 합성 이미지(`image`, ImageField — **서버에 저장**), 즐겨찾기(`is_favorite`).
- **`CoordinationItem`**: `Coordination`과 `Clothes` 간 N:M 중간 모델. `layer_order`(레이어 순서), `unique_together(coordination, clothes)`.

## AI 서비스 (`accounts/gemini_*.py`)

- `gemini_service.py`: **Gemini 2.5 Pro**(`gemini-2.5-pro`) — 의류 상세 분석.
- `gemini_outfit_service.py`: **Gemini 2.5 Pro**(`gemini-2.5-pro`) — 코디 추천.
- `gemini_image_service.py`: **Gemini 2.5 Flash Image**(`gemini-2.5-flash-image-preview`, 나노바나나) — 가상 착용 이미지 생성 (빠른 속도 위해 Flash 이미지 모델 선택).

가상 착용은 `generate_virtual_tryon` 뷰에서 **요청 내 동기 처리**된다(별도 작업 큐/스레드 없음). 비동기 사용자 경험은 클라이언트가 추천/생성 요청을 분리하고 폴링으로 갱신하는 방식으로 구현되어 있다.

## API 엔드포인트 (`accounts/urls.py`, prefix `/api/accounts/`)

| Path | Method | 설명 |
|---|---|---|
| `test/` | GET | 헬스 체크 |
| `auth/google/` | POST | Google 로그인(이메일 기반 간이 토큰 발급) |
| `auth/guest/` | DELETE | 게스트 계정 삭제 |
| `user/profile/` | GET/PUT/PATCH | 프로필 |
| `clothes/` | GET/POST | 의류 목록/등록 |
| `clothes/<pk>/` | GET/PUT/PATCH/DELETE | 의류 상세 |
| `clothes/stats/` | GET | 옷장 통계 |
| `clothes/analyze/` | POST | Gemini 의류 분석 (인증 필요) |
| `outfit/recommend/` | POST | AI 코디 추천 |
| `coordinations/` | GET/POST | 코디 목록/저장 |
| `coordinations/<pk>/` | GET/PUT/PATCH/DELETE | 코디 상세 |
| `coordinations/<pk>/favorite/` | POST | 즐겨찾기 토글 |
| `coordinations/<pk>/generate-tryon/` | POST | 가상 착용 생성(동기) |

## 인증 (`accounts/views.py` — `get_user_from_email_token`)

- 클라이언트가 Google Sign-In(OAuth 2.0)으로 로그인한 뒤, 서버는 `Authorization: Token <email>` 헤더의 이메일로 사용자를 식별한다.
- **졸업작품용 간이 인증**으로, 서명·만료가 없어 토큰 탈취·위조에 취약하다. 실서비스화 시 서명·만료가 있는 JWT(액세스/리프레시) 또는 DRF TokenAuth로 교체 대상.
- `settings.py`의 `DEFAULT_AUTHENTICATION_CLASSES`에 simplejwt가 등록되어 있으나 **실제 인증 경로에서는 사용되지 않는다**(각 뷰가 위 이메일 토큰을 직접 검증).

## 설정 (`orbit_backend/settings.py`)

- **데이터베이스**: MySQL (utf8mb4).
- **DEBUG / ALLOWED_HOSTS / CORS**: 환경변수 기반. 기본값은 보안값(DEBUG=False, localhost만 허용, CORS 전체 허용은 DEBUG에서만)이며 배포 시 `.env`로 주입.
- **이미지 저장**: 업로드 이미지·생성 이미지 모두 **서버 `MEDIA_ROOT`에 파일로 저장**(ImageField). `media/<path>`는 동적 리사이징을 지원하는 `serve_media`로 서빙.
- **커스텀 사용자 모델**: `AUTH_USER_MODEL = 'accounts.User'`.

## 스크립트

- **`reset_db.sh`**: 마이그레이션·테이블 초기화 후 재생성·적용, 선택적 슈퍼유저 생성. 개발 중 DB를 깨끗이 리셋하는 유틸리티.
