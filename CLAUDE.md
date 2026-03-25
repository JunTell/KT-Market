# KT Market — CLAUDE.md

이 파일은 Claude Code가 이 프로젝트를 작업할 때 참조하는 컨텍스트 문서입니다.

---

## 프로젝트 개요

**KT Market**은 알뜰폰 요금제 비교·추천 서비스입니다.

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
│   │   └── auth/
│   │       ├── kakao/route.ts       ← 카카오 OAuth 시작 (GET)
│   │       ├── callback/route.ts    ← OAuth 콜백, 세션 발급 (GET)
│   │       ├── me/route.ts          ← 로그인 상태 확인 (GET)
│   │       ├── logout/route.ts      ← 로그아웃 (POST)
│   │       └── withdraw/route.ts    ← 회원탈퇴 (DELETE)
│   └── (기타 페이지들)
├── proxy.ts                         ← 세션 갱신 + CORS + 어드민 라우트 보호 (Next.js 16)
└── shared/
    └── lib/
        ├── cors.ts                  ← CORS 헤더 헬퍼
        ├── upsertProfile.ts         ← 카카오 프로필 DB 동기화
        ├── auth.ts                  ← 클라이언트 인증 유틸
        ├── auth/
        │   ├── admin.ts             ← 관리자 권한 체크
        │   ├── server-auth.ts       ← 서버 인증 유틸
        │   └── session.ts           ← 유저+관리자 세션 조회
        └── supabase/
            ├── client.ts            ← 브라우저 Supabase 클라이언트
            └── server.ts            ← 서버 Supabase 클라이언트 (쿠키 기반)
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

| Method | 경로 | 역할 | 인증 |
|--------|------|------|------|
| GET | `/api/auth/kakao` | 카카오 OAuth 시작 | 불필요 |
| GET | `/api/auth/callback` | OAuth 콜백 처리 | 불필요 (code 파라미터) |
| GET | `/api/auth/me` | 로그인 상태·유저 정보 | 쿠키 세션 |
| POST | `/api/auth/logout` | 로그아웃 | 쿠키 세션 |
| DELETE | `/api/auth/withdraw` | 회원탈퇴 | 쿠키 세션 |

**Framer에서 호출 시 반드시 `credentials: 'include'` 포함:**
```js
fetch('https://kt-market-puce.vercel.app/api/auth/me', {
  credentials: 'include'
})
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

### profiles 테이블 필수 컬럼
```sql
id            uuid PRIMARY KEY  -- auth.users.id 참조
kakao_id      text UNIQUE       -- 카카오 고유 ID (upsert onConflict 기준)
full_name     text
avatar_url    text
email         text
phone         text              -- 01012345678 형식 (하이픈 없음)
birthday      text              -- YYYYMMDD 형식 (예: 19900115)
provider      text              -- 'kakao'
is_active     boolean DEFAULT true
deleted_at    timestamptz
last_login_at timestamptz
```

> `kakao_id`에 UNIQUE 제약이 없으면 upsertProfile이 실패합니다.

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
- Admin 작업: `createClient(url, SUPABASE_SERVICE_ROLE_KEY)` — 서버에서만

### API Route 작성 시
- 모든 `/api/auth/*` 라우트에 `corsHeaders()` 적용
- `OPTIONS` 핸들러 반드시 추가
- 인증이 필요한 엔드포인트는 `createSupabaseServerClient().auth.getUser()` 로 검증

### Supabase
- `SUPABASE_SERVICE_ROLE_KEY`는 `admin.deleteUser`, `admin.signOut` 등 관리 작업에만 사용
- RLS(Row Level Security) 정책이 있는 테이블은 anon key로 본인 데이터만 접근
- `profiles` 테이블 upsert는 `upsertProfile()` 함수 사용

---

## 알려진 제약 사항

1. **카카오 비즈앱 미심사 시** — 이름(실명), 전화번호는 카카오에서 제공되지 않을 수 있음
2. **Framer 무료 플랜** — 커스텀 도메인 미지원 시 `framer.app` 도메인으로 CORS 설정 필요
3. **Vercel Hobby 플랜** — 서버리스 함수 타임아웃 10초 (카카오 unlink 요청 주의)
4. **쿠키 SameSite=None** — HTTP(비HTTPS) 환경에서는 동작 안 함 → 개발 시 localhost 사용

---

## 체크리스트 (배포 전)

- [ ] Supabase Redirect URL에 `https://kt-market-puce.vercel.app/api/auth/callback` 등록
- [ ] Supabase Kakao Provider 활성화 (REST API 키 + 보안 코드)
- [ ] 카카오 디벨로퍼스 Redirect URI: `https://{supabase-ref}.supabase.co/auth/v1/callback`
- [ ] `profiles` 테이블 `kakao_id` UNIQUE 제약 확인
- [ ] Vercel 환경 변수 전체 등록 확인
- [ ] `KAKAO_ADMIN_KEY` 등록 (회원탈퇴 unlink 기능)
