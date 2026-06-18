# Orbit Database Architecture

> **프로젝트:** Orbit - AI 스타일리스트 앱  
> **작성일:** 2024-11-12  
> **버전:** 2.1 - 카테고리 시스템 업데이트  
> **데이터베이스:** MySQL 8.0 (orbit_db)

---

## 목차

1. [개요](#개요)
2. [ERD (Entity Relationship Diagram)](#erd-entity-relationship-diagram)
3. [테이블 상세 설명](#테이블-상세-설명)
4. [관계 설명](#관계-설명)
5. [데이터 흐름](#데이터-흐름)
6. [설계 원칙](#설계-원칙)

---

## 개요

Orbit 앱의 데이터베이스는 **4개의 핵심 테이블**로 구성되어 있습니다:

1. **User** - 사용자 정보 및 인증
2. **Clothes** - 개별 의류 아이템
3. **Coordination** - 코디네이션 (여러 옷의 조합)
4. **CoordinationItem** - 코디네이션과 옷의 중간 연결 테이블

### 핵심 설계 철학

- **정규화**: 데이터 중복 최소화
- **확장성**: 새로운 기능 추가에 유연함
- **성능**: 인덱스 최적화 및 쿼리 효율성
- **보안**: 사용자별 데이터 격리
- **AI 연동**: AI 생성 데이터 저장 필드 포함
- **이미지 서버 저장**: ImageField를 사용한 실제 파일 저장

### ⭐ v2.1 주요 변경사항
- **카테고리 구조 개편**: `type` → `main_category` + `sub_category`
- **3단계 카테고리**: TOP, BOTTOM, OUTER로 간소화
- **세부 카테고리**: 각 메인 카테고리별 서브 카테고리 추가
- **성별 선택지**: M(Male), F(Female)로 단순화
- **이미지 크기 제한 제거**: 무제한 업로드 가능

### 파일 위치
```
/home/orbit_project/orbit_backend/          ← 프로젝트 루트 (manage.py 위치)
│
├── manage.py
├── .env
├── reset_db.sh        ⭐ DB 초기화 스크립트
├── setup_media.sh     ⭐ MEDIA 디렉토리 설정
│
├── media/                                   ← ⭐ 이미지 저장 위치
│   ├── clothes/
│   │   └── 2024/11/12/
│   │       ├── shirt_A1b2C3.jpg
│   │       └── pants_D4e5F6.jpg
│   └── coordinations/
│       └── 2024/11/12/
│           └── coord_X7y8Z9.jpg
│
├── orbit_backend/                          ← 프로젝트 설정 (Django 프로젝트 이름)
│   ├── __init__.py
│   ├── settings.py    ⭐ MEDIA 설정 추가
│   ├── urls.py        ⭐ MEDIA URL 패턴 추가
│   ├── wsgi.py
│   └── asgi.py
│
└── accounts/                                ← Django 앱 (사용자/의류/코디 관리)
    ├── __init__.py
    ├── models.py      ⭐ 카테고리 필드 추가
    ├── views.py       ⭐ 카테고리 필터링 업데이트
    ├── urls.py        
    ├── serializers.py ⭐ 카테고리 필드 반영
    ├── admin.py       ⭐ 카테고리 필드 표시
    └── migrations/
```

---

## ERD (Entity Relationship Diagram)

```
┌─────────────────────────────────────┐
│           User (사용자)              │
│─────────────────────────────────────│
│ PK  id (auto)                       │
│ UNI email                           │
│ UNI username                        │
│ UNI google_id                       │
│     profile_picture                 │
│     sex (M/F)          ⭐ 변경      │
│     height, weight                  │
│     body_photo (전신사진)           │
│     created_at, updated_at          │
└─────────────────────────────────────┘
         │                      │
         │ 1:N                  │ 1:N
         ▼                      ▼
┌───────────────────────┐  ┌──────────────────────┐
│  Clothes (의류)        │  │ Coordination (코디)  │
│───────────────────────│  │──────────────────────│
│ PK  id                │  │ PK  id               │
│ FK  user_id           │  │ FK  user_id          │
│     main_category ⭐  │  │     name             │
│     sub_category  ⭐  │  │     detail (AI 생성) │
│     name              │  │     image            │
│     color             │  │     is_favorite      │
│     detail            │  │     created_at       │
│     image             │  │     updated_at       │
│     created_at        │  └──────────────────────┘
│     updated_at        │           │
└───────────────────────┘           │ 1:N
         │                          ▼
         │          ┌───────────────────────────┐
         │          │ CoordinationItem (연결)   │
         │          │───────────────────────────│
         │          │ PK  id                    │
         └─────────▶│ FK  clothes_id            │
                    │ FK  coordination_id       │
                    │     layer_order           │
                    └───────────────────────────┘
```

---

## 테이블 상세 설명

### 1. User (사용자)

**목적:** 사용자 인증 정보 및 프로필 관리

```python
class User(AbstractUser):
    # 기본 로그인 정보
    email = models.EmailField(unique=True)  
    username = models.CharField(max_length=150, unique=True)
    google_id = models.CharField(max_length=255, unique=True, null=True)
    profile_picture = models.URLField(null=True, blank=True)
    
    # 사용자 정보
    SEX_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]  # ⭐ v2.1: 'Other' 제거
    sex = models.CharField(max_length=10, choices=SEX_CHOICES)
    height = models.FloatField(null=True)
    weight = models.FloatField(null=True)
    body_photo = models.ImageField(upload_to='body_photos/%Y/%m/%d/', null=True, blank=True)
    
    # 타임스탬프
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### 필드 설명

| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| **id** | Integer | PK, Auto | 사용자 고유 식별자 (Django 자동 생성) |
| **email** | EmailField | UNIQUE, NOT NULL | Google 로그인 이메일 (로그인 ID로 사용) |
| **username** | CharField(150) | UNIQUE, NOT NULL | 사용자 닉네임 (앱 내 표시명) |
| **google_id** | CharField(255) | UNIQUE, NULL | Google OAuth 고유 ID |
| **profile_picture** | URLField | NULL | Google 프로필 사진 URL |
| **password** | CharField(128) | NOT NULL | 비밀번호 (Django AbstractUser 상속) |
| **sex** | CharField(10) | NULL | 성별 (M/F) ⭐ v2.1: 단순화 |
| **height** | Float | NULL | 신장 (cm 단위) |
| **weight** | Float | NULL | 체중 (kg 단위) |
| **body_photo** | ImageField | NULL | 전신 사진 (가상 피팅용, 서버 저장) |
| **created_at** | DateTime | NOT NULL | 계정 생성일 |
| **updated_at** | DateTime | NOT NULL | 마지막 수정일 |

---

### 2. Clothes (의류)

**목적:** 사용자가 소유한 개별 의류 아이템 관리

```python
class Clothes(models.Model):
    # ⭐ v2.1: 메인 카테고리 (3개로 간소화)
    MAIN_CATEGORY_CHOICES = [
        ('TOP', '상의'),
        ('BOTTOM', '하의'),
        ('OUTER', '아우터'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    main_category = models.CharField(max_length=50, choices=MAIN_CATEGORY_CHOICES)
    sub_category = models.CharField(max_length=50)
    name = models.CharField(max_length=200)
    color = models.CharField(max_length=50)
    detail = models.TextField(null=True, blank=True)
    image = models.ImageField(upload_to='clothes/%Y/%m/%d/')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### 필드 설명

| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| **id** | Integer | PK, Auto | 의류 고유 식별자 |
| **user** | ForeignKey | FK → User, CASCADE | 의류 소유자 |
| **main_category** | CharField(50) | NOT NULL | ⭐ 메인 카테고리 (TOP/BOTTOM/OUTER) |
| **sub_category** | CharField(50) | NOT NULL | ⭐ 서브 카테고리 (TOP_TSHIRT_SHORT 등) |
| **name** | CharField(200) | NOT NULL | 의류 이름 (사용자 지정) |
| **color** | CharField(50) | NOT NULL | 주요 색상 |
| **detail** | TextField | NULL | 의류 상세 설명 (AI 자동 생성 또는 사용자 입력) |
| **image** | ImageField | NOT NULL | 이미지 파일 (서버에 실제 저장) |
| **created_at** | DateTime | NOT NULL | 등록일 |
| **updated_at** | DateTime | NOT NULL | 마지막 수정일 |

#### ⭐ 카테고리 구조 (v2.1)

**메인 카테고리 (3개)**
```python
MAIN_CATEGORY_CHOICES = [
    ('TOP', '상의'),
    ('BOTTOM', '하의'),
    ('OUTER', '아우터'),
]
```

**서브 카테고리 (세부 분류)**

**TOP (상의)**
- `TOP_TSHIRT_SHORT` - 반팔 티셔츠
- `TOP_TSHIRT_LONG` - 긴팔 티셔츠
- `TOP_SHIRT` - 셔츠/블라우스
- `TOP_KNIT` - 니트/스웨터
- `TOP_HOOD` - 후드/맨투맨
- `TOP_SLEEVELESS` - 민소매
- `TOP_VEST` - 조끼/베스트

**BOTTOM (하의)**
- `BOTTOM_DENIM` - 청바지
- `BOTTOM_COTTON` - 면바지
- `BOTTOM_SLACKS` - 슬랙스/정장바지
- `BOTTOM_TRAINING` - 트레이닝/조거
- `BOTTOM_SHORTS` - 반바지
- `BOTTOM_SKIRT` - 치마
- `BOTTOM_LEGGINGS` - 레깅스

**OUTER (아우터)**
- `OUTER_JACKET` - 재킷
- `OUTER_CARDIGAN` - 가디건
- `OUTER_COAT` - 코트
- `OUTER_PADDING` - 패딩/다운
- `OUTER_JUMPER` - 점퍼/블루종
- `OUTER_FLEECE` - 후리스/집업
- `OUTER_VEST` - 조끼/베스트

#### 사용 예시

```python
# ⭐ v2.1: 새 옷 등록 (카테고리 구조)
clothes = Clothes.objects.create(
    user=user,
    main_category='TOP',
    sub_category='TOP_TSHIRT_SHORT',
    name='화이트 반팔 티셔츠',
    color='흰색',
    detail='AI 분석: 면 100% 소재의 베이직 반팔 티셔츠',
    image=uploaded_file
)

# 메인 카테고리로 필터링
tops = Clothes.objects.filter(user=user, main_category='TOP')

# 서브 카테고리로 세밀한 필터링
tshirts = Clothes.objects.filter(user=user, sub_category='TOP_TSHIRT_SHORT')

# 이미지 URL 접근
print(clothes.image.url)  # → '/media/clothes/2024/11/12/shirt_A1b2C3.jpg'
```

#### ⭐ 이미지 저장 전략 (v2.1 - 크기 제한 제거)

```python
# serializers.py
def validate_image(self, value):
    """
    이미지 파일 유효성 검사 (크기 제한 없음)
    """
    # 파일 형식만 체크
    allowed_extensions = ['jpg', 'jpeg', 'png', 'webp']
    ext = value.name.split('.')[-1].lower()
    if ext not in allowed_extensions:
        raise serializers.ValidationError(
            f"지원하지 않는 이미지 형식입니다."
        )
    return value
```

**변경 내역:**
- v2.0: 10MB 크기 제한
- v2.1: **크기 제한 제거** (무제한 업로드)
- 파일 형식만 검사: jpg, jpeg, png, webp

---

### 3. Coordination (코디네이션)

**목적:** 여러 의류를 조합한 전체 코디 저장 및 관리

```python
class Coordination(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    detail = models.TextField()
    image = models.ImageField(upload_to='coordinations/%Y/%m/%d/')
    is_favorite = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
```

#### 필드 설명

| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| **id** | Integer | PK, Auto | 코디 고유 식별자 |
| **user** | ForeignKey | FK → User, CASCADE | 코디 소유자 |
| **name** | CharField(200) | NOT NULL | 코디 이름 (예: "출근룩", "데이트룩") |
| **detail** | TextField | NOT NULL | AI 생성 코디 설명 (TPO, 스타일 분석) |
| **image** | ImageField | NOT NULL | 전체 코디 합성 이미지 (서버 저장) |
| **is_favorite** | Boolean | DEFAULT False | 즐겨찾기 여부 |
| **created_at** | DateTime | NOT NULL | 코디 생성일 |
| **updated_at** | DateTime | NOT NULL | 마지막 수정일 |

---

### 4. CoordinationItem (중간 테이블)

**목적:** Coordination과 Clothes 간의 Many-to-Many 관계 구현

```python
class CoordinationItem(models.Model):
    coordination = models.ForeignKey(Coordination, on_delete=models.CASCADE)
    clothes = models.ForeignKey(Clothes, on_delete=models.CASCADE)
    layer_order = models.IntegerField(default=0)
```

#### 필드 설명

| 필드명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| **id** | Integer | PK, Auto | 관계 고유 식별자 |
| **coordination** | ForeignKey | FK → Coordination, CASCADE | 어떤 코디에 속하는지 |
| **clothes** | ForeignKey | FK → Clothes, CASCADE | 어떤 옷이 포함되는지 |
| **layer_order** | Integer | DEFAULT 0 | 레이어 순서 (착용 순서) |

---

## 데이터 흐름

### 시나리오 1: 신규 사용자 가입 (Google 로그인)

```
1. Google OAuth 인증
   ↓
2. User 생성
   - email: user@gmail.com
   - google_id: 1234567890
   - username: 자동 생성 또는 입력
   ↓
3. 온보딩 (선택 입력)
   - sex: M 또는 F ⭐ v2.1: 단순화
   - height, weight 입력
   ↓
4. 첫 옷 등록 유도
```

---

### 시나리오 2: 옷 등록 (v2.1 업데이트)

```
1. 사용자가 카메라로 옷 촬영
   ↓
2. React Native에서 이미지 파일 준비
   - URI: file:///storage/.../photo.jpg
   ↓
3. FormData로 서버에 업로드
   - Content-Type: multipart/form-data
   - main_category: TOP        ⭐ 추가
   - sub_category: TOP_TSHIRT_SHORT  ⭐ 추가
   - name: 화이트 티셔츠
   - color: 흰색
   - image: [파일]
   ↓
4. Django가 이미지 저장
   - 날짜별 폴더 자동 생성
   - 파일명 중복 자동 처리
   - 실제 경로: /media/clothes/2024/11/12/shirt_A1b2C3.jpg
   - ⭐ 크기 제한 없음
   ↓
5. AI 분석 (선택적)
   - detail: 'AI 생성 설명...'
   ↓
6. Clothes 레코드 생성
   - main_category, sub_category 저장  ⭐
   - image 필드에 파일 경로 저장
   ↓
7. 클라이언트에 image_url 반환
   - "http://YOUR_SERVER_IP:8000/media/clothes/2024/11/12/shirt_A1b2C3.jpg"
   ↓
8. 앱에서 이미지 표시
   - <Image source={{ uri: item.image_url }} />
```

---

## 설계 원칙

### 1. 데이터 정규화 (Normalization)

**제3정규화(3NF) 준수**
- 중복 데이터 최소화
- 각 테이블은 하나의 엔티티만 표현
- 외래 키를 통한 관계 표현

---

### 2. CASCADE 삭제 정책

**데이터 무결성 보장**
- User 삭제 → 모든 Clothes, Coordination 자동 삭제
- Clothes 삭제 → 해당 옷이 포함된 CoordinationItem 자동 삭제
- Coordination 삭제 → 모든 CoordinationItem 자동 삭제
- **이미지 파일도 함께 삭제** (views.py에서 처리)

```python
# views.py - DELETE 메서드
if clothes.image:
    clothes.image.delete(save=False)  # 파일 삭제
clothes.delete()  # DB 레코드 삭제
```

---

### 3. 인덱스 최적화

**쿼리 성능 향상**

```python
class Meta:
    indexes = [
        models.Index(fields=['user', 'main_category']),  # ⭐ v2.1
        models.Index(fields=['user', 'sub_category']),   # ⭐ v2.1
        models.Index(fields=['user', 'color']),
        models.Index(fields=['-created_at']),
    ]
```

---

## API 설계 (v2.1 업데이트)

### Clothes

```
GET    /api/accounts/clothes/                 # 내 옷 목록
       ?main_category=TOP                     # ⭐ 메인 카테고리 필터
       ?sub_category=TOP_TSHIRT_SHORT         # ⭐ 서브 카테고리 필터
       Response: { 
         "main_category": "TOP",
         "sub_category": "TOP_TSHIRT_SHORT",
         "image_url": "http://..."
       }

POST   /api/accounts/clothes/                 # 새 옷 등록
       Content-Type: multipart/form-data
       Body: {
         main_category: "TOP",                # ⭐ 필수
         sub_category: "TOP_TSHIRT_SHORT",    # ⭐ 필수
         name: "화이트 티셔츠",
         color: "흰색",
         detail: "설명...",                   # 선택
         image: File                          # 필수 (크기 제한 없음)
       }

GET    /api/accounts/clothes/{id}/            # 옷 상세
PUT    /api/accounts/clothes/{id}/            # 옷 수정
DELETE /api/accounts/clothes/{id}/            # 옷 삭제 (파일도 삭제)

GET    /api/accounts/clothes/stats/           # 옷장 통계
       Response: {
         "total": 50,
         "by_main_category": {              # ⭐ v2.1
           "TOP": { "name": "상의", "count": 20 },
           "BOTTOM": { "name": "하의", "count": 15 },
           "OUTER": { "name": "아우터", "count": 15 }
         }
       }
```

---

## 마이그레이션 가이드 (v2.0 → v2.1)

### 변경 사항 요약

1. **Clothes 모델**
   - `type` → `main_category` + `sub_category`
   - 인덱스 업데이트

2. **User 모델**
   - `SEX_CHOICES`: M, F만 남김 (Other 제거)

3. **이미지 업로드**
   - 크기 제한 제거 (무제한)

### 마이그레이션 방법

#### 개발 환경 (권장)

```bash
# 1. 파일 교체
cp models.py accounts/models.py
cp serializers.py accounts/serializers.py
cp views.py accounts/views.py
cp admin.py accounts/admin.py

# 2. 실행 권한 추가
chmod +x reset_db.sh

# 3. DB 완전 초기화
./reset_db.sh

# 4. 서버 재시작
python manage.py runserver 0.0.0.0:8000
```

---

## 주의사항

### 1. 파일 업로드 (v2.1)

```python
# serializers.py
# 크기 제한 제거
# 형식만 검사: jpg, jpeg, png, webp
```

### 2. CORS 설정

```python
# 개발 환경
CORS_ALLOW_ALL_ORIGINS = True

# 프로덕션 환경
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8081",
    "https://yourdomain.com",
]
```

---

## 다음 단계

1. **models.py 업데이트** - 카테고리 시스템
2. **serializers.py 업데이트** - 카테고리 필드
3. **views.py 업데이트** - 카테고리 필터링
4. **admin.py 업데이트** - 카테고리 표시
5. ⬜ **React Native 연동** - 카테고리 선택 UI
6. ⬜ **테스트** - 카테고리별 필터링 검증

---

**문서 끝 - v2.1 (2024-11-12 업데이트)**  
궁금한 점이 있다면 언제든 물어보세요! 