# Orbit

![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) ![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white) ![Redux](https://img.shields.io/badge/Redux-764ABC?style=for-the-badge&logo=redux&logoColor=white) ![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white) ![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white) ![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)

AI 기반 패션 코디네이션 및 가상 착용 시뮬레이터를 제공하는 모바일 애플리케이션입니다. 사용자의 옷장을 디지털화하고, 날씨와 일정 데이터를 분석하여 최적의 코디를 추천합니다. Google Gemini AI를 활용한 의류 상세 분석, 스타일 추천, 가상 착용 이미지 생성 기능을 통해 개인 맞춤형 패션 경험을 제공합니다.

## Screenshots

| 홈 (날씨·일정 기반 추천) | AI 추천 상세 | 가상 착용 결과 |
|:---:|:---:|:---:|
| <img src="docs/screenshots/01-home.jpg" width="240"> | <img src="docs/screenshots/03-ai-recommend-detail.jpg" width="240"> | <img src="docs/screenshots/05-tryon-result.jpg" width="240"> |
| **홈 — 데일리 룩 카드** | **코디 상세 (가상 착용)** | **스타일 로그** |
| <img src="docs/screenshots/02-home-daily-card.jpg" width="240"> | <img src="docs/screenshots/04-coordination-tryon.jpg" width="240"> | <img src="docs/screenshots/06-style-log.jpg" width="240"> |

가상 착용 이미지는 사용자의 전신 사진과 옷장 속 실제 의류를 Gemini 이미지 생성 모델로 합성한 결과물입니다.
캡스톤디자인 결과보고서(발표자료)는 [`docs/`](docs/)에 있습니다.


## Table of Contents

- [Tech Stack](#tech-stack)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)

## Tech Stack

### Frontend

**Language & Framework**
- TypeScript 5.8.3
- React 19.0.0
- React Native 0.79.5
- Expo SDK 53

**State Management**
- Redux Toolkit 2.9.0
- React Redux 9.2.0

**Navigation**
- React Navigation 6.x (Native Stack, Bottom Tabs, Stack)

**UI & Animation**
- React Native Reanimated 3.17.4
- Expo Linear Gradient 14.1.5
- React Native Community Blur 4.4.1
- Expo Blur 14.1.5
- React Native Gesture Handler 2.24.0

**Image & Media**
- Expo Image 2.4.1
- Expo Image Picker 16.1.4
- React Native Vision Camera 4.7.2
- React Native SVG 15.14.0

**Storage & Cache**
- AsyncStorage 2.2.0

**Utilities**
- Axios 1.13.2
- Expo Location 18.1.6
- Expo Network 7.1.5
- React Native Worklets Core 1.6.2

### Backend

**Language & Framework**
- Python 3.10+ (Django 5.2 요구사항)
- Django 5.2
- Django REST Framework

**Database**
- MySQL 8.0

**AI Services**
- Google Gemini 3 Flash (`gemini-3-flash-preview`) — 의류 상세 분석 및 코디 추천
- Google Gemini 3 Pro Image (`gemini-3-pro-image-preview`) — 가상 착용 이미지 생성

**Image Processing**
- Pillow (Python Imaging Library)

**Authentication**
- 클라이언트: Google Sign-In (Google OAuth 2.0) 로 로그인
- 서버: 이메일 기반 간이 토큰(`Authorization: Token <email>`)으로 사용자 식별 — **졸업작품용 단순 인증**(서명·만료 없음). 실서비스화 시 서명·만료가 있는 JWT 또는 DRF TokenAuth 로 교체 대상. (현재 simplejwt는 설정만 되어 있고 실사용되지 않음)

### Infrastructure

**Hosting**
- GCP Compute Engine + Django Admin Interface

**Development Tools**
- Expo Dev Client 5.2.4
- TypeScript Compiler
- Babel 7.25.2
- NativeWind 2.0.11 (Tailwind CSS for React Native)

## Key Features

### AI 기반 코디 추천
- **날씨 기반 추천**: 실시간 날씨 데이터(온도, 체감온도, 습도, 날씨 상태)를 분석하여 기후에 적합한 옷차림 제안
- **일정 기반 추천**: 캘린더 이벤트를 분석하여 TPO(Time, Place, Occasion)에 맞는 코디 추천
- **스타일 선호도 반영**: 사용자가 입력한 스타일 선호도를 AsyncStorage에 캐싱하고 추천 알고리즘에 적용
- **AI 통합 추천**: Gemini 3 Flash를 활용하여 날씨, 일정, 스타일 선호도를 종합적으로 고려한 최적의 코디 제안

### 가상 착용 시뮬레이션
- Gemini 3 Pro Image를 활용한 가상 착용 이미지 생성
- 사용자의 전신 사진과 선택한 의류를 AI 기반으로 합성
- 생성은 서버에서 동기 처리되며, 클라이언트가 추천/생성 요청을 분리하고 폴링으로 갱신하는 **클라이언트 주도 비동기**로 대기 경험 최적화 (추천 결과 즉시 표시)
- 9:16 세로 비율 최적화로 모바일 화면에 적합한 결과물 제공

### 디지털 옷장 관리
- 카메라 촬영 또는 갤러리에서 의류 이미지 업로드
- 3단계 카테고리 시스템: TOP, BOTTOM, OUTER + 세부 서브 카테고리
- Gemini 3 Flash AI 자동 분석을 통한 의류 상세 정보 생성
  - 소재, 핏, 길이, 패턴, 스타일, 계절성 등 카테고리별 맞춤 분석
  - 코디 추천을 위한 구체적이고 실용적인 정보 제공
- 그리드/리스트 뷰 전환 가능한 직관적인 UI
- Django 서버에 이미지 파일 저장 및 관리

### 스타일 로그
- 음악 플레이어 스타일의 독특한 인터페이스로 과거 코디 기록 관리
- 저장된 코디네이션의 상세 정보 및 가상 착용 이미지 확인
- 즐겨찾기 기능을 통한 선호 코디 관리

### 데이터 캐싱 시스템
- AsyncStorage 기반의 로컬 캐싱으로 API 호출 최소화
- 캘린더 일정 데이터·스타일 선호도를 자정 기준 일별 캐시 관리 (날씨는 항상 실시간 조회)
- 네트워크 의존성 감소 및 응답 속도 향상

## Architecture

본 프로젝트는 Feature-Sliced 구조를 지향하며, 각 화면(Screen)이 필요한 리소스를 자체 포함하여 높은 응집도와 낮은 결합도를 유지합니다.

### System Architecture

```mermaid
flowchart LR
    subgraph Client["Frontend - React Native App"]
        direction TB
        A1[Home Screen]
        A2[Closet Screen]
        A3[Outfit Screen]
        A4[Recommend Screen]
        A5[Settings Screen]
        A6[Camera Screen]
    end

    subgraph Server["Backend - Django REST Framework"]
        direction TB
        B1[Auth Service<br/>Email Token & OAuth 2.0]
        B2[Gemini 3 Flash<br/>의류 분석 & 코디 추천]
        B3[Gemini 3 Pro Image<br/>가상 착용 생성]
        B4[Clothes & Outfit CRUD]
    end

    subgraph DB["Database - MySQL 8.0"]
        direction TB
        C1[(Users)]
        C2[(Clothes)]
        C3[(Coordination)]
        C4[(CoordinationItem)]
    end

    Client <-->|REST API| Server
    Server <-->|SQL| DB

    C1 -->|1:N| C2
    C1 -->|1:N| C3
    C2 -->|N:M| C4
    C3 -->|1:N| C4

    style Client fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    style Server fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style DB fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
```

### Data Flow

**단방향 데이터 흐름 원칙 (Redux Pattern)**
1. User Interaction → Dispatch Action (예: 옷 추가 요청)
2. Async Thunk → API Call to Django Backend
3. Backend Processing:
   - 이미지 저장 (Django Media Storage)
   - Gemini 3 Flash AI 분석 (의류 상세 정보 추출)
   - MySQL Database 저장
4. Response → Redux Reducer → Update State
5. React Component Re-render → UI Update

**코디 추천 Flow**
1. 사용자가 추천 요청 (날씨/일정/AI 기반)
2. Frontend → 날씨 데이터, 일정 데이터, 스타일 선호도 수집
3. Backend → Gemini 3 Flash에 의류 목록 + 컨텍스트 전달
4. Gemini AI → 최적의 코디 조합 및 스타일 팁 생성
5. Backend → Coordination 저장 (MySQL) → 추천 결과 즉시 응답
6. Frontend → 추천 결과 즉시 표시 (여기까지가 코디 추천 Flow)

**가상 착용 Flow (별도 — 사용자가 '입어보기' 선택 시)**
1. Frontend → 가상 착용 생성 엔드포인트(`coordinations/{id}/generate-tryon/`)로 별도 요청
2. Backend → Gemini 3 Pro Image 호출로 이미지 생성 후 저장 (**요청 내 동기 처리**)
3. Frontend → 비동기는 클라이언트 주도: 추천 화면을 막지 않고, 생성 완료를 coordination 상세 polling으로 확인해 이미지 갱신

## Database Schema

### ERD Overview

```mermaid
erDiagram
    USER ||--o{ CLOTHES : owns
    USER ||--o{ COORDINATION : creates
    CLOTHES ||--o{ COORDINATION_ITEM : contains
    COORDINATION ||--o{ COORDINATION_ITEM : includes

    USER {
        int id PK
        string email UK
        string username UK
        string google_id UK
        string profile_picture
        string sex
        int height
        int weight
        string body_photo
        datetime created_at
        datetime updated_at
    }

    CLOTHES {
        int id PK
        int user_id FK
        string main_category
        string sub_category
        string name
        string color
        text detail
        string image
        datetime created_at
        datetime updated_at
    }

    COORDINATION {
        int id PK
        int user_id FK
        string name
        text detail
        string image
        boolean is_favorite
        datetime created_at
        datetime updated_at
    }

    COORDINATION_ITEM {
        int id PK
        int clothes_id FK
        int coordination_id FK
        int layer_order
    }
```

### Category System (v2.1)

**Main Categories**
- TOP: 상의
- BOTTOM: 하의
- OUTER: 아우터

**Sub Categories Examples**
- TOP: TSHIRT_SHORT, TSHIRT_LONG, SHIRT, KNIT, HOOD, SLEEVELESS, VEST
- BOTTOM: DENIM, COTTON, SLACKS, TRAINING, SHORTS, SKIRT, LEGGINGS
- OUTER: JACKET, COAT, PADDING, CARDIGAN, HOODIE, VEST

## Getting Started

### Prerequisites

**Frontend**
- Node.js 18.x or higher
- npm 9.x or yarn 1.22.x
- Expo CLI
- iOS Simulator (for macOS) or Android Emulator

**Backend**
- Python 3.10 or higher (required by Django 5.2)
- MySQL 8.0
- pip 21.x or higher

**API Keys (Required)**
- Google Gemini API Key (https://aistudio.google.com/)
- Google OAuth 2.0 Client ID (https://console.cloud.google.com/)

**API Keys (Optional)**
- OpenWeatherMap API Key (for weather features)

### Installation

**1. Clone Repository**

```bash
git clone https://github.com/deltaomega02/orbit.git
cd orbit-app
```

**2. Frontend Setup**

```bash
# Install dependencies
npm install

# Configure environment variables
# Create .env file in root directory
echo "API_BASE_URL=http://localhost:8000" > .env
echo "GOOGLE_CLIENT_ID=your_google_oauth_client_id" >> .env

# Start Expo development server
npx expo start

# Run on iOS
npx expo run:ios

# Run on Android
npx expo run:android
```

**3. Backend Setup**

```bash
# Navigate to backend directory
cd Orbit_server

# Create virtual environment
python -m venv orbitserver
source orbitserver/bin/activate  # On Windows: orbitserver\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Create .env file
echo "DB_NAME=orbit_db" > .env
echo "DB_USER=orbit_admin" >> .env
echo "DB_PASSWORD=<your-password>" >> .env
echo "GEMINI_API_KEY=your_gemini_api_key_here" >> .env
echo "DJANGO_SECRET_KEY=your_django_secret_key_here" >> .env

# Initialize database
chmod +x reset_db.sh
./reset_db.sh

# Setup media directories
chmod +x setup_media.sh
./setup_media.sh

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver 0.0.0.0:8000
```

**4. Database Setup (MySQL)**

```bash
# Login to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE orbit_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'orbit_admin'@'localhost' IDENTIFIED BY '<your-password>';
GRANT ALL PRIVILEGES ON orbit_db.* TO 'orbit_admin'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Usage

**Running the Application**

```bash
# Frontend (Expo)
npm start

# Backend (Django)
cd Orbit_server
source orbitserver/bin/activate
python manage.py runserver 0.0.0.0:8000

# Access Django Admin
# Navigate to: http://localhost:8000/admin
```

**Key API Endpoints**

```
# Authentication
POST   /api/accounts/auth/google/           # Google 로그인 (이메일 기반 간이 토큰 발급)
DELETE /api/accounts/auth/guest/            # 게스트 계정 삭제 (로그아웃 시)

# User Profile
GET    /api/accounts/user/profile/          # 프로필 조회
PUT    /api/accounts/user/profile/          # 프로필 전체 수정
PATCH  /api/accounts/user/profile/          # 부분 수정 (body_photo 업로드 지원)

# Clothes Management
GET    /api/accounts/clothes/               # 의류 목록
POST   /api/accounts/clothes/               # 의류 등록
GET    /api/accounts/clothes/{id}/          # 의류 상세
PUT    /api/accounts/clothes/{id}/          # 의류 수정
DELETE /api/accounts/clothes/{id}/          # 의류 삭제
GET    /api/accounts/clothes/stats/         # 옷장 통계 (카테고리별 개수)
POST   /api/accounts/clothes/analyze/       # Gemini 의류 이미지 분석 (인증 필요)

# Outfit Recommendations
POST   /api/accounts/outfit/recommend/      # AI 코디 추천 (날씨/일정/스타일 선호 반영)

# Coordinations
POST   /api/accounts/coordinations/         # 코디 생성/저장
GET    /api/accounts/coordinations/         # 코디 목록
GET    /api/accounts/coordinations/{id}/    # 코디 상세
DELETE /api/accounts/coordinations/{id}/    # 코디 삭제
POST   /api/accounts/coordinations/{id}/favorite/        # 즐겨찾기 토글

# Virtual Try-On
POST   /api/accounts/coordinations/{id}/generate-tryon/  # 가상 착용 이미지 생성

# Utility
GET    /api/accounts/test/                  # 서버 헬스 체크
```

## Project Structure

### Frontend Directory Structure

```
OrbitApp/
├── src/
│   ├── api/                    # API client configuration
│   │   └── client.ts
│   │
│   ├── assets/                 # Static resources
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   │
│   ├── constants/              # Global constants
│   │   ├── colors.ts
│   │   ├── dimensions.ts
│   │   ├── typography.ts
│   │   └── config.ts
│   │
│   ├── navigation/             # Navigation logic
│   │   ├── AppNavigator.tsx
│   │   ├── TabNavigator.tsx
│   │   └── types.ts
│   │
│   ├── screens/                # Feature screens
│   │   ├── Auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── LoginScreen.styles.ts
│   │   ├── Camera/
│   │   │   ├── CameraScreen.tsx
│   │   │   ├── CameraScreen.styles.ts
│   │   │   └── components/
│   │   │       ├── CameraView.tsx
│   │   │       ├── PermissionView.tsx
│   │   │       └── PhotoReview.tsx
│   │   ├── Closet/
│   │   │   ├── ClosetScreen.tsx
│   │   │   └── components/
│   │   │       ├── ClothingGridItem.tsx
│   │   │       └── ClothingListItem.tsx
│   │   ├── Home/
│   │   │   ├── HomeScreen.tsx
│   │   │   └── components/
│   │   │       ├── OutfitCard.tsx
│   │   │       └── WeatherWidget.tsx
│   │   ├── Onboarding/
│   │   │   ├── OnboardingScreen.tsx
│   │   │   └── components/
│   │   │       └── OnboardingStep.tsx
│   │   ├── Outfit/
│   │   │   ├── OutfitScreen.tsx
│   │   │   └── components/
│   │   │       ├── OutfitGridModal.tsx
│   │   │       └── OutfitMainDisplay.tsx
│   │   ├── Recommend/
│   │   │   ├── RecommendScreen.tsx
│   │   │   └── components/
│   │   │       ├── RecommendGeneratingModal.tsx
│   │   │       ├── ClothingRequirementModal.tsx
│   │   │       └── StylePreferenceModal.tsx
│   │   └── Settings/
│   │       ├── SettingsScreen.tsx
│   │       └── components/
│   │           ├── BodyMetricsForm.tsx
│   │           └── BodyPhotoUpload.tsx
│   │
│   ├── services/               # External API services
│   │   ├── auth/
│   │   │   └── AuthServices.ts
│   │   ├── weather/
│   │   │   └── weatherService.ts
│   │   └── calendar/
│   │       └── calendarService.ts
│   │
│   ├── store/                  # Redux state management
│   │   ├── index.ts
│   │   └── slices/
│   │       ├── userSlice.ts
│   │       ├── closetSlice.ts
│   │       ├── outfitSlice.ts
│   │       ├── weatherSlice.ts
│   │       ├── uiSlice.ts
│   │       └── cacheSlice.ts
│   │
│   ├── types/                  # TypeScript type definitions
│   │   ├── user.ts
│   │   ├── clothes.ts
│   │   ├── outfit.ts
│   │   └── cache.ts
│   │
│   └── utils/                  # Utility functions
│       ├── cacheManager.ts
│       └── colorUtils.ts
│
├── App.tsx                     # Root component
├── app.json                    # Expo configuration
├── package.json                # Dependencies
└── tsconfig.json               # TypeScript configuration
```

### Backend Directory Structure

```
orbit_backend/
├── accounts/                   # Main Django app
│   ├── migrations/
│   ├── models.py              # Database models
│   ├── views.py               # API endpoints
│   ├── serializers.py         # DRF serializers
│   ├── urls.py                # URL routing
│   ├── admin.py               # Django admin config
│   ├── gemini_service.py         # Gemini 3 Flash - 의류 상세 분석
│   ├── gemini_outfit_service.py  # Gemini 3 Flash - 코디 추천
│   └── gemini_image_service.py   # Gemini 3 Pro Image - 가상 착용
│
├── orbit_backend/             # Project settings
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
│
├── media/                     # User uploaded files
│   ├── clothes/
│   └── coordinations/
│
├── manage.py
├── reset_db.sh               # Database reset script
├── setup_media.sh            # Media directory setup
└── requirements.txt          # Python dependencies
```

---

## 내가 한 것 / 팀이 한 것

3인 팀의 팀장으로 진행했다. 기여 범위를 정확히 적어 둔다.

| | 담당 |
|---|---|
| 박시우 (팀장) | 전체 아키텍처 설계, AI 파이프라인(Gemini 연동·프롬프트·이미지 생성 흐름) 구축, 서버 전반 |
| 팀원 1 (Full-Stack) | **DB 저장·관리 로직과 클라이언트–서버 데이터 통신 흐름을 함께 구현** |
| 팀원 2 (Frontend) | UI/UX 디테일 |

"백엔드를 혼자 다 짰다"는 사실이 아니다. 결과보고서 slide 6 의 역할 분담과 같다.

## 알려진 한계

졸업작품이라 실서비스 기준으로는 빠진 것이 많다. 알고 남겨 둔 것들이다.

- **인증이 약하다.** 서버는 이메일 기반 간이 토큰(`Authorization: Token <email>`)으로 사용자를
  식별한다. 서명도 만료도 없다. simplejwt 는 설정만 되어 있고 실사용되지 않는다.
  실서비스라면 서명·만료가 있는 JWT 나 DRF TokenAuth 로 교체해야 한다.
- **비동기가 클라이언트 주도다.** 이미지 생성처럼 수십 초 걸리는 작업을 서버는 동기로 처리하고,
  클라이언트가 폴링해서 대기 경험만 분리했다. 서버 측 작업 큐가 없다.
- **배포가 개발 서버였다.** `manage.py runserver` 를 `nohup` 으로 띄워 운영했다.
  WSGI/ASGI 서버(gunicorn·uvicorn)와 리버스 프록시가 없었다. 이 한계를 알고 나서
  다음 프로젝트([orbit-local](https://github.com/deltaomega02/orbit-local))에서 배포 형태를 다시 잡았다.
- **테스트가 없다.** 이것도 orbit-local 에서 237개를 채우며 갚았다.
- 캐싱은 캘린더 일정에만 적용된다. 날씨는 매번 실시간 조회다.

---

**Developed by**: 3인 팀 · 팀장 박시우(ΔΩ)
