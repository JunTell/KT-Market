# KT Market — CLAUDE.md

이 파일은 Claude Code가 이 프로젝트를 작업할 때 참조하는 컨텍스트 문서입니다.

---

## 프로젝트 개요

- **프론트엔드**: Framer (https://ktmarket.co.kr) — 노코드 퍼블리시 환경
- **백엔드 API**: Next.js App Router (https://kt-market-puce.vercel.app) — Vercel 배포
- **데이터베이스**: Supabase (PostgreSQL + Auth)
- **인증**: 카카오 OAuth (Supabase 연동)

프론트엔드(Framer)와 API 서버(Next.js)가 **완전히 다른 도메인**에 있어 크로스 도메인 쿠키 인증을 사용합니다.

---

## 기술 스택

```
Next.js ^16 (App Router)    React 19
TypeScript ^5               Tailwind CSS v4
Supabase SSR (@supabase/ssr ^0.8)
TanStack Query v5           Zustand v5
React Hook Form v7          Zod v4
Lucide React                Recharts
```

---

## 디렉토리 구조

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── kakao/route.ts         ← 카카오 OAuth 시작 (GET)
│   │   │   ├── callback/route.ts      ← OAuth 콜백, 세션 발급 (GET)
│   │   │   ├── me/route.ts            ← 로그인 상태 확인 (GET)
│   │   │   ├── logout/route.ts        ← 로그아웃 (POST)
│   │   │   └── withdraw/route.ts      ← 회원탈퇴 (DELETE)
│   │   ├── my/
│   │   │   ├── summary/route.ts       ← 마이페이지 카운트 요약 (GET)
│   │   │   ├── orders/route.ts        ← 주문 내역 (GET)
│   │   │   ├── wishlist/route.ts      ← 찜 목록 (GET, DELETE)
│   │   │   ├── viewed/route.ts        ← 최근 본 기기 (GET)
│   │   │   ├── consultations/route.ts ← 상담 접수 내역 (GET)
│   │   │   ├── preorders/route.ts     ← 사전예약 내역 (GET)
│   │   │   ├── restock/route.ts       ← 재입고 알림 신청 내역 (GET)
│   │   │   └── referrals/route.ts     ← 지인 추천 내역 (GET)
│   │   └── kakao/
│   │       └── sync-channel/route.ts  ← 카카오 채널 추가 검증 (POST)
│   └── (기타 페이지들)
├── proxy.ts                           ← 세션 갱신 + CORS + 어드민 라우트 보호 (Next.js 16)
├── features/
│   └── admin/                         ← 관리자 기능 (applications, consultations, posts, products, reviews)
└── shared/
    ├── lib/
    │   ├── cors.ts                    ← CORS 헤더 헬퍼
    │   ├── upsertProfile.ts           ← 카카오 프로필 DB 동기화
    │   ├── auth.ts                    ← 클라이언트 인증 유틸
    │   ├── auth/
    │   │   ├── admin.ts               ← 관리자 권한 체크
    │   │   ├── server-auth.ts         ← 서버 인증 유틸
    │   │   └── session.ts             ← 유저+관리자 세션 조회
    │   └── supabase/
    │       ├── client.ts              ← 브라우저 Supabase 클라이언트
    │       ├── server.ts              ← 서버 Supabase 클라이언트 (쿠키 기반)
    │       └── admin.ts              ← Service Role 키 클라이언트 (서버 전용)
    ├── stores/
    │   ├── auth-store.ts              ← Zustand 인증 상태
    │   └── useUserStore.ts
    └── types/
        ├── supabase.ts                ← Supabase 자동생성 타입
        └── (기타 타입 파일들)
```

---

## 인증 플로우

```
Framer 버튼 클릭
  → GET /api/auth/kakao
  → Supabase signInWithOAuth (카카오)
  → 카카오 로그인 페이지
  → GET /api/auth/callback?code=...
  → exchangeCodeForSession (세션 쿠키 Set-Cookie)
  → upsertProfile (profiles 테이블 동기화)
  → 302 redirect → https://ktmarket.co.kr/mypage
```

**Framer에서 상태 확인:**
```
GET /api/auth/me  (credentials: 'include')
→ { isLoggedIn: true, user: { id, full_name, avatar_url, phone, kakao_id } }
```

---

## 환경 변수

### 필수
```bash
NEXT_PUBLIC_SUPABASE_URL=           # Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Supabase anon key (공개 가능)
SUPABASE_SERVICE_ROLE_KEY=          # Supabase service role key ← 절대 NEXT_PUBLIC_ 사용 금지
NEXT_PUBLIC_FRAMER_SITE_URL=https://ktmarket.co.kr
NEXT_PUBLIC_API_URL=https://kt-market-puce.vercel.app
```

### 선택
```bash
KAKAO_ADMIN_KEY=                    # 회원탈퇴 시 카카오 연동 해제용
COOKIE_DOMAIN=                      # 서브도메인 공유 쿠키 (현재 미사용 — 도메인이 달라 불필요)
```

### 보안 규칙
- `SUPABASE_SERVICE_ROLE_KEY`는 **서버 사이드 전용** — `NEXT_PUBLIC_` 접두사 절대 금지
- `KAKAO_ADMIN_KEY`도 서버 사이드 전용
- `.env` 파일은 절대 커밋하지 않음

---

## API 엔드포인트 명세

### 인증 API

| Method | 경로 | 역할 | 인증 |
|--------|------|------|------|
| GET | `/api/auth/kakao` | 카카오 OAuth 시작 | 불필요 |
| GET | `/api/auth/callback` | OAuth 콜백 처리 | 불필요 (code 파라미터) |
| GET | `/api/auth/me` | 로그인 상태·유저 정보 | 쿠키 세션 |
| POST | `/api/auth/logout` | 로그아웃 | 쿠키 세션 |
| DELETE | `/api/auth/withdraw` | 회원탈퇴 | 쿠키 세션 |

### 마이페이지 API (`/api/my/*`)

모든 엔드포인트는 쿠키 세션 인증 필요. phone 기반 조회는 profiles.phone으로 연결.

| Method | 경로 | 역할 | 조회 기준 |
|--------|------|------|-----------|
| GET | `/api/my/summary` | 각 섹션 카운트 요약 | profile_id + phone |
| GET | `/api/my/orders` | 주문 내역 (online_order + iphone17_order + call_order + s26_orders) | profile_id |
| GET | `/api/my/wishlist` | 찜 목록 (devices join) | profile_id |
| DELETE | `/api/my/wishlist?id=:id` | 찜 항목 제거 | profile_id |
| GET | `/api/my/viewed?limit=5` | 최근 본 기기 (중복 제거, 최대 20) | profile_id |
| GET | `/api/my/consultations` | 상담 접수 내역 | phone |
| GET | `/api/my/preorders` | 사전예약 내역 (s26 + galaxy26 + iphone17e) | phone |
| GET | `/api/my/restock` | 재입고 알림 신청 내역 | phone |
| GET | `/api/my/referrals` | 지인 추천 내역 (buyer_phone 마스킹) | referrer_phone |
| POST | `/api/kakao/sync-channel` | 카카오 채널 추가 여부 검증 | 쿠키 세션 |

**Framer에서 호출 시 반드시 `credentials: 'include'` 포함:**
```js
fetch('https://kt-market-puce.vercel.app/api/my/summary', {
  credentials: 'include'
})
```

**`/api/my/summary` 응답 형태:**
```ts
{
  wishlistCount:  number  // user_wishlists
  viewedCount:   number  // user_viewed_devices
  orderCount:    number  // online_order + iphone17_order + call_order + s26_orders
  consultCount:  number  // customer_consultations
  preorderCount: number  // preorder_s26_orders + preorder-galaxy26 + preorder_iphone17e
  restockCount:  number  // restock_notification
  referralCount: number  // referral_consultation
}
```

---

## Supabase 설정 요구사항

### Authentication → URL Configuration
```
Site URL: https://ktmarket.co.kr
Redirect URLs:
  https://kt-market-puce.vercel.app/api/auth/callback
  http://localhost:3000/api/auth/callback  (개발용)
```

### Providers → Kakao
```
Client ID:     카카오 REST API 키
Client Secret: 카카오 보안 코드
```

---

## 데이터베이스 스키마 (Supabase / PostgreSQL)

### 핵심 테이블

#### `profiles` — 유저 프로필
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
email         text UNIQUE
full_name     text
avatar_url    text
provider      text              -- 'kakao'
kakao_id      text UNIQUE       -- 카카오 고유 ID (upsert onConflict 기준)
naver_id      text UNIQUE
phone         text              -- 01012345678 형식 (하이픈 없음)
birthday      text              -- YYYYMMDD 형식
nickname      text
marketing_agreed boolean DEFAULT false
is_active     boolean DEFAULT true
deleted_at    timestamptz
last_login_at timestamptz
created_at    timestamptz NOT NULL DEFAULT now()
updated_at    timestamptz NOT NULL DEFAULT now()
```
> `kakao_id`에 UNIQUE 제약이 없으면 upsertProfile이 실패합니다.

#### `kakao_channel_status` — 카카오 채널 추가 여부
```sql
id               uuid PRIMARY KEY
profile_id       uuid UNIQUE REFERENCES profiles(id)
kakao_user_id    text UNIQUE
relation         text              -- 'added' | 'blocked' | 'none'
channel_added_at timestamptz
channel_updated_at timestamptz
last_checked_at  timestamptz
created_at / updated_at timestamptz
```

---

### 단말기·요금제 관련 테이블

#### `devices` — 단말기 마스터
```sql
model        text PRIMARY KEY
pet_name     text              -- 표시용 이름 (예: 갤S26울트라)
category     text              -- 'smartphone' | 'tablet' | 'watch' 등
category_kr  text
company      text              -- 'samsung' | 'apple' 등
capacity     text
network_type text
colors_kr    text[]
colors_en    text[]
colors_code  text[]
capacities   text[]
paths        text[]            -- 이미지 경로 배열
images       jsonb
thumbnail    text
price        integer           -- 출고가
subsidy      integer           -- 공시지원금
plan_id      text
form_link    text
video_link   text
is_available boolean
priority     smallint
release_date date
```
> `devices_duplicate`는 운영용 스테이징 복사본

#### `device_plans_new` / `device_plans_mnp` / `device_plans_chg` — 가입유형별 요금제 플랜
```sql
id                uuid PRIMARY KEY
model             text REFERENCES devices(model)
pet_name          text
plan_id           text
name              text           -- 요금제명
model_price       bigint         -- 출고가
disclosure_subsidy bigint        -- 공시지원금
price             bigint         -- 최종 단말 가격
```
- `new`: 신규가입, `mnp`: 번호이동, `chg`: 기기변경
- 각각 `_duplicate` 스테이징 테이블 존재

#### `ktmarket_subsidy` — KT마켓 추가지원금 (가입유형×요금제 구간별)
```sql
model    text PRIMARY KEY REFERENCES devices(model)
network  text
company  text
-- 컬럼 명명 규칙: {plan|device}_discount_{new|mnp|chg}_{구간}
-- 구간: gte_110000 / gte_100000 / gte_90000 / gte_61000 / gte_37000 / lt_37000
plan_discount_new_gte_110000 bigint  -- 요금제 할인 (신규, 11만원 이상)
device_discount_mnp_gte_61000 bigint  -- 단말 할인 (번이, 6.1만원 이상)
-- ... (총 42개 컬럼)
```

#### `freebies` — 사은품 목록
```sql
no             bigint IDENTITY PRIMARY KEY
sort           integer
title          text
origin_price   bigint
discount_price bigint
installment    integer DEFAULT 24
monthly_price  bigint
plans          text[]   -- 적용 요금제 목록
is_available   boolean DEFAULT true
```

#### `watch_tablet` — 워치·태블릿 단말기
```sql
model          text PRIMARY KEY
pet_name       text
category       text
company        text
capacity       text
colors_kr/en/code text[]
capacities / paths text[]
images         jsonb
price          integer
disclosure_subsidy integer
ktmakret_subsidy   integer
isBundle       boolean
isAvailable    boolean
```

---

### 주문 관련 테이블

#### `online_order` — 온라인 주문
```sql
no             bigint IDENTITY PRIMARY KEY UNIQUE
datetime       timestamptz DEFAULT now() AT TIME ZONE 'Asia/Seoul'
device         text
model          text
"petName"      text
capacity       text
color          text
register       text    -- 가입 유형 (신규/번이/기변)
name           text
phone          text UNIQUE
birthday       text
plan           text
freebie        text
installment    text
installment_principal text
discount       text
benefit        text
carrier        text
is_processed   boolean DEFAULT false
is_consultation boolean DEFAULT false
profile_id     uuid REFERENCES profiles(id)
kakao_friend_rewarded boolean DEFAULT false
kakao_friend_checked_at timestamptz
```

#### `iphone17_order` — 아이폰17 주문
```sql
-- online_order와 유사, 추가 컬럼:
pet_name             text    -- (online_order는 "petName" 따옴표 필요)
is_guaranteed_return boolean
guardian             text
guardian_birthday    text
guardian_phone       text
```

#### `s26_orders` — 갤럭시 S26 주문
```sql
-- online_order와 동일 구조
```

#### `call_order` — 전화 주문
```sql
-- online_order와 유사, profile_id 컬럼 없음
```

#### `preorder_s26_orders` — S26 사전예약 주문
```sql
-- online_order와 동일 구조 (profile_id, kakao_friend_* 포함)
```

#### `preorder_17e_orders` — 아이폰17e 사전예약 주문
```sql
-- online_order와 유사 (profile_id, kakao_friend_* 포함)
```

---

### 사전예약 테이블

#### `preorder-galaxy26` — 갤럭시 S26 사전예약 (심플)
```sql
id             uuid PRIMARY KEY
name           text
phone          varchar
birthday       text
model          text
color          text
mobile_carrier text
funnel         text
is_colors      boolean
is_processed   boolean
created_at / updated_at timestamptz
```

#### `preorder-galaxy26-other` — 해외 갤럭시 S26 사전예약
```sql
-- preorder-galaxy26 + country text
```

#### `preorder_iphone17e` — 아이폰17e 사전예약 (심플)
```sql
id             bigint IDENTITY PRIMARY KEY
model          text DEFAULT 'iPhone 17e'
name / phone / birthday text
mobile_carrier text
description    text
status         text DEFAULT '접수'
created_at     timestamptz
```

#### `preorder_iPhone17` — 아이폰17 사전예약 (초기)
```sql
no     bigint IDENTITY PRIMARY KEY UNIQUE
name / phone / carrier / device / register text
datetime timestamptz
```

#### `preorder_foldable7` — 폴더블7 사전예약
```sql
no / name / phone / birthday / plan / freebie text
device / capacity / color / register / funnel text
installment smallint
datetime timestamptz
```

#### `preorder_a37` — A37 사전예약
```sql
-- preorder-galaxy26과 동일 구조
```

#### `preorder_secret` — 비밀 사전예약 이벤트
```sql
id             bigint IDENTITY PRIMARY KEY
event_id       text
name / phone / model / plan text
register_type / concern / competitor text
current_carrier / preorder_elsewhere text
is_processed / is_consultation boolean
created_at     timestamptz
```

---

### 상담·문의 테이블

#### `customer_consultations` — 고객 상담 접수
```sql
id             bigint IDENTITY PRIMARY KEY
name / phone / birthday text
mobile_carrier text
description    text
is_processed   boolean DEFAULT false
created_at     timestamptz
```

#### `consultation_requests` — 상담 신청 (간단)
```sql
id         bigint IDENTITY PRIMARY KEY
name / phone text
birth_date date
is_processed boolean DEFAULT false
created_at timestamptz
```

#### `consultation_rrn` — 주민번호 포함 상담 신청
```sql
id         bigint IDENTITY PRIMARY KEY
name / phone / rrn / carrier / birthday text
is_processed boolean
created_at timestamptz
```

#### `s26_customer_consultations` — S26 고객 상담 (입금 정보 포함)
```sql
id             bigint IDENTITY PRIMARY KEY
name / phone / model / pet_name text
bank_name / account_number text
description / mobile_carrier text
zip_code / address / detail_address text
is_processed   boolean
created_at     timestamptz
```

#### `referral_consultation` — 지인 추천 상담
```sql
id             uuid PRIMARY KEY
referrer_name / referrer_phone text
buyer_name / buyer_phone / buyer_relation text
phone_model / join_type text
current_carrier / change_timing text
phone_inquiry / internet_inquiry text
need_phone_consult / need_internet_consult boolean
need_internet_consult boolean
current_internet / internet_service / install_region text
privacy_agreed boolean
is_self_purchase boolean
is_processed   boolean DEFAULT false
created_at     timestamptz
```

---

### 유저 행동 테이블

#### `user_wishlists` — 찜 목록
```sql
id           uuid PRIMARY KEY
profile_id   uuid REFERENCES profiles(id)
device_model text REFERENCES devices(model)
created_at   timestamptz DEFAULT now() AT TIME ZONE 'Asia/Seoul'
```

#### `user_viewed_devices` — 최근 본 기기
```sql
id           bigint IDENTITY PRIMARY KEY
profile_id   uuid REFERENCES profiles(id)
device_model text REFERENCES devices(model)
viewed_at    timestamptz DEFAULT now() AT TIME ZONE 'Asia/Seoul'
```

---

### 기타 테이블

#### `reviews` — 구매 후기
```sql
id        uuid PRIMARY KEY
name      text
rating    integer DEFAULT 5
content   text
image_url text
image_urls text[]
created_at timestamptz
```

#### `restock_notification` — 재입고 알림 신청
```sql
no / name / phone / birthday text (UNIQUE phone)
device / model / "petName" / capacity / color text
plan / discount / benefit / freebie text
installment / installment_principal text
carrier text
is_processed / is_consultation boolean
datetime timestamptz
```

#### `customer_survey` — 고객 설문
```sql
id              uuid PRIMARY KEY
name / phone / birth / address_dong text
current_carrier text DEFAULT '미입력'
target_model / purchase_period / monthly_fee text
purchase_plan / internet_tv / family_skt text
preferences     text[]
memo            text
is_processed    boolean
created_at      timestamptz
```

#### `link_product` — 링크 상품 신청
```sql
id             bigint IDENTITY PRIMARY KEY
name / phone / birthday text
selections     jsonb
marketing_agreed / privacy_agreed boolean
is_processed   boolean
created_at     timestamptz
```

#### `official_form_errors` — 공식 폼 오류 로그
```sql
id           uuid PRIMARY KEY
name / phone / birthday text
error_details / discount_type text
is_processed boolean
created_at   timestamptz
```

#### `usim_apply` — 유심 신청
```sql
id       bigint PRIMARY KEY
carrier / name / birthday / phone text
funnel   text DEFAULT 'usim'
is_processed boolean
created_at timestamptz
```

#### `watch8_reservations` — 워치8 예약
```sql
id       uuid PRIMARY KEY
name / birthday / phone text
is_processed boolean
created_at   timestamptz
```

#### `s26-color` — S26 컬러 알림 신청
```sql
id       bigint IDENTITY PRIMARY KEY
model / color / name / phone text
is_processed boolean
created_at   timestamptz
```

#### `s26_cancellations` — S26 취소 신청
```sql
id          uuid PRIMARY KEY
name / birthday / phone text
device_model text
cancel_reason text
is_processed boolean
created_at   timestamptz
```

#### `gonggu-asamo` — 공구 아사모
```sql
id       bigint PRIMARY KEY
company / device / capacity / color text
name / birthday / phone / funnel text
is_agreed_tos boolean
form_data jsonb
is_processed boolean
created_at timestamptz
```

---

### 테이블 관계 요약

```
profiles (1) ──< online_order        (N)  via profile_id
profiles (1) ──< iphone17_order      (N)  via profile_id
profiles (1) ──< s26_orders          (N)  via profile_id
profiles (1) ──< preorder_s26_orders (N)  via profile_id
profiles (1) ──< preorder_17e_orders (N)  via profile_id
profiles (1) ──< user_wishlists      (N)  via profile_id
profiles (1) ──< user_viewed_devices (N)  via profile_id
profiles (1) ──< kakao_channel_status(1)  via profile_id

devices  (1) ──< device_plans_new    (N)  via model
devices  (1) ──< device_plans_mnp    (N)  via model
devices  (1) ──< device_plans_chg    (N)  via model
devices  (1) ──< user_wishlists      (N)  via device_model
devices  (1) ──< user_viewed_devices (N)  via device_model
```

### phone 기반 연결 (FK 없음, 비정규화)
마이페이지에서 phone 기준으로 조회하는 테이블들:
- `customer_consultations`, `restock_notification`
- `call_order` (profile_id 없음)
- `preorder-galaxy26`, `preorder_iphone17e`
- `referral_consultation` (referrer_phone)

### `_duplicate` 테이블
운영용 스테이징 복사본. `devices_duplicate`, `device_plans_*_duplicate`, `ktmarket_subsidy_duplicate`, `freebies_duplicate`, `watch_tablet_duplicate` 존재. 실제 서비스는 원본 테이블 사용.

---

## 크로스 도메인 쿠키 설정

`ktmarket.co.kr` (Framer) ↔ `kt-market-puce.vercel.app` (Next.js)는 **다른 도메인**이므로:

- 쿠키: `sameSite=none; secure=true` (프로덕션)
- 쿠키: `sameSite=lax; secure=false` (개발 — localhost)
- `COOKIE_DOMAIN`은 **설정하지 않음** (공통 상위 도메인 없음)
- 미들웨어에서 `/api/auth/*` 경로에 CORS 헤더 자동 추가

---

## Framer 코드 컴포넌트 연동

### AuthStore 모듈 URL
```
https://framer.com/m/AuthStore-jiikDX.js
```
버전 해시 없이 사용하면 항상 최신 버전을 가져옵니다.

### export 목록
```ts
userState       // Data() 전역 상태 (isLoggedIn, isLoading, id, fullName, ...)
checkAuth()     // GET /api/auth/me 호출
loginWithKakao() // GET /api/auth/kakao 리다이렉트
logout()        // POST /api/auth/logout
withdraw()      // DELETE /api/auth/withdraw
withAuthHandler(Component) // HOC — 페이지 마운트 시 checkAuth 자동 호출
```

### 현재 구현된 Framer 컴포넌트
- `KakaoAuthComponent` — 로그인 화면 (카카오 버튼)
- `LoginContainer` — 로그인 컨테이너 (타이틀 + 버튼)
- `MyPage` — 마이페이지 전체 (프로필, 메뉴, 로그아웃, 회원탈퇴)
- `AuthStore` — 전역 상태 모듈 (컴포넌트 아님)

### 마이페이지 구조 (Framer ↔ API)
```
MyPage 컴포넌트 마운트
  → withAuthHandler → checkAuth() → GET /api/auth/me
  → 인증 성공 시 GET /api/my/summary  (섹션별 카운트)
  → 각 탭 클릭 시:
      주문내역    → GET /api/my/orders
      찜 목록     → GET /api/my/wishlist
      최근 본     → GET /api/my/viewed
      상담접수    → GET /api/my/consultations
      사전예약    → GET /api/my/preorders
      재입고알림  → GET /api/my/restock
      지인추천    → GET /api/my/referrals
```

---

## 개발 명령어

```bash
npm run dev          # 로컬 개발 서버 (http://localhost:3000)
npm run build        # 프로덕션 빌드
npm run typecheck    # TypeScript 타입 체크
npm run lint         # ESLint
npm run check-all    # lint + typecheck + build 전체 검증
```

---

## 코드 작성 규칙

### 일반
- **서버 컴포넌트 기본** — 클라이언트 컴포넌트는 필요한 경우만 `'use client'`
- import 순서: 외부 패키지 → 내부 절대경로(`@/`) → 타입
- 절대 경로 alias: `@/*` → 프로젝트 루트

### 인증
- 서버 사이드: `createSupabaseServerClient()` (쿠키 기반)
- 브라우저 사이드: `supabaseClient` from `@/src/shared/lib/supabase/client`
- Admin 작업: `createSupabaseAdminClient()` from `@/src/shared/lib/supabase/admin` — 서버에서만

### API Route 작성 시
- 모든 `/api/*` 라우트에 `getCorsHeaders()` 적용
- `OPTIONS` 핸들러 반드시 추가
- 인증이 필요한 엔드포인트는 `createSupabaseServerClient().auth.getUser()` 로 검증
- phone 기반 조회가 필요하면 먼저 `profiles.phone` 조회 후 사용
- RLS 우회가 필요한 경우 `createSupabaseAdminClient()` 사용

### Supabase
- `SUPABASE_SERVICE_ROLE_KEY`는 `admin.deleteUser`, `admin.signOut` 등 관리 작업에만 사용
- RLS(Row Level Security) 정책이 있는 테이블은 anon key로 본인 데이터만 접근
- `profiles` 테이블 upsert는 `upsertProfile()` 함수 사용
- `"petName"` 컬럼은 카멜케이스 — Supabase 쿼리 시 따옴표 필요 (iphone17_order는 `pet_name` 스네이크케이스)

---

## 알려진 제약 사항

1. **카카오 비즈앱 미심사 시** — 이름(실명), 전화번호는 카카오에서 제공되지 않을 수 있음
2. **Framer 무료 플랜** — 커스텀 도메인 미지원 시 `framer.app` 도메인으로 CORS 설정 필요
3. **Vercel Hobby 플랜** — 서버리스 함수 타임아웃 10초 (카카오 unlink 요청 주의)
4. **쿠키 SameSite=None** — HTTP(비HTTPS) 환경에서는 동작 안 함 → 개발 시 localhost 사용
5. **phone 기반 연결** — `call_order` 등 일부 테이블은 profile_id 없이 phone으로만 연결됨 (유저가 phone을 등록하지 않으면 조회 불가)
6. **`"petName"` vs `pet_name`** — 테이블마다 컬럼명 규칙이 달라 쿼리 시 주의 필요

---

## 체크리스트 (배포 전)

- [ ] Supabase Redirect URL에 `https://kt-market-puce.vercel.app/api/auth/callback` 등록
- [ ] Supabase Kakao Provider 활성화 (REST API 키 + 보안 코드)
- [ ] 카카오 디벨로퍼스 Redirect URI: `https://{supabase-ref}.supabase.co/auth/v1/callback`
- [ ] `profiles` 테이블 `kakao_id` UNIQUE 제약 확인
- [ ] Vercel 환경 변수 전체 등록 확인
- [ ] `KAKAO_ADMIN_KEY` 등록 (회원탈퇴 unlink 기능)
