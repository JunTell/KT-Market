1. 프로젝트 흐름 및 주요 로직
1) 기술 스택 및 환경

```
Framework: Next.js 16.0.6 (App Router 사용)
Language: TypeScript
Styling: Tailwind CSS v4 + CSS Variables (Saved Information의 디자인 시스템 적용)
Database & Auth: Supabase (SSR 패키지 사용)
State Management:
Server State: TanStack React Query
Client State: Zustand (useUserStore)
Auth State: Context API (AuthContext) + Middleware
```

2) 핵심 동작 플로우

```
라우팅 구조 (src/app):
(home): 일반 사용자용 페이지 (로그인, 회원가입, 이벤트 상세, 메인 등). Route Group을 사용하여 URL path에 영향을 주지 않고 관리.
admin: 관리자 전용 페이지 (/admin). 대시보드, 이벤트 관리, 상품 관리 기능 포함.
api: Supabase Auth 관련 엔드포인트 (auth/me, logout 등) 및 세션 처리.
인증 및 보안 (Middleware):
middleware.ts에서 모든 요청을 가로채 Supabase 세션을 확인합니다.
/admin 경로는 로그인 여부뿐만 아니라 DB의 profiles 테이블에서 is_admin 값을 조회하여 관리자 권한을 엄격하게 체크합니다.
권한이 없으면 메인 페이지로 리다이렉트됩니다.
```

데이터 관리:

```
src/lib/supabase: 클라이언트 컴포넌트용(client.ts), 서버 컴포넌트/액션용(server.ts) 클라이언트가 분리되어 있어 SSR/CSR 환경에 맞게 동작합니다.
src/actions: 서버 액션(Server Actions)을 통해 데이터 변이(Mutation)를 처리하려는 의도가 보입니다 (auth.ts).
```

### 파일구조
```
## 📂 Project Structure

```bash
.
├── .github/                # GitHub 템플릿 (Issue, PR)
├── public/                 # 정적 리소스 (이미지, 아이콘 등)
├── src/
│   ├── actions/            # Server Actions (서버 사이드 로직)
│   │   └── auth.ts         # 인증 관련 액션
│   ├── app/                # Next.js App Router (페이지 및 라우팅)
│   │   ├── (home)/         # 일반 사용자용 페이지 (Route Group)
│   │   │   ├── (auth)/     # 로그인/회원가입
│   │   │   ├── (event)/    # 이벤트 상세 페이지
│   │   │   └── page.tsx    # 메인 랜딩 페이지
│   │   ├── admin/          # 관리자 대시보드 (Protected Route)
│   │   │   ├── events/     # 이벤트 CRUD 관리
│   │   │   └── products/   # 상품 재고 관리
│   │   ├── api/            # API Route Handlers (Auth 세션 처리 등)
│   │   ├── fonts/          # 로컬 폰트 (Pretendard)
│   │   ├── globals.css     # 전역 스타일 및 CSS Variables 정의
│   │   ├── layout.tsx      # Root Layout (Providers, Auth Listener)
│   │   └── middleware.ts   # 미들웨어 (인증 및 관리자 권한 체크)
│   ├── components/         # UI 컴포넌트
│   │   ├── admin/          # 관리자 전용 컴포넌트 (차트, 폼, 에디터)
│   │   ├── auth/           # 인증 관련 컴포넌트 (LoginForm, SignupForm)
│   │   ├── common/         # 공통 UI (버튼, 메뉴 등)
│   │   └── layout/         # 레이아웃 컴포넌트 (Header, Footer)
│   ├── contexts/           # React Context (AuthContext 등)
│   ├── hooks/              # 커스텀 훅 (useAuth 등)
│   ├── lib/                # 라이브러리 설정 및 유틸리티
│   │   ├── supabase/       # Supabase 클라이언트 (Server/Client/Middleware 분리)
│   │   ├── apiClient.ts    # API 호출 유틸리티
│   │   └── seo.ts          # 메타데이터 설정
│   ├── stores/             # 전역 상태 관리 (Zustand - useUserStore)
│   └── types/              # TypeScript 타입 정의 (Supabase, Product 등)
├── .gitignore
├── eslint.config.mjs
├── middleware.ts           # Next.js 미들웨어 진입점
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tailwind.config.ts      # (Tailwind v4 사용 시 CSS 파일에서 설정 가능)
└── tsconfig.json
```

### Admin 접근 권한:

/admin 경로는 middleware.ts에 의해 보호됩니다.

Supabase profiles 테이블의 is_admin 컬럼이 true인 사용자만 접근 가능합니다.

스타일 시스템:

globals.css에 정의된 CSS Variables(--primary, --label-900 등)를 사용하여 일관된 디자인 시스템을 유지합니다.

다크 모드를 지원하며(prefers-color-scheme), Tailwind v4 엔진을 사용합니다.

데이터 페칭 전략:

Server Component: 초기 데이터 로딩 및 SEO가 필요한 페이지.

React Query: 클라이언트 측 데이터 캐싱 및 상태 동기화.

Supabase SSR: 쿠키 기반 세션 관리로 보안 강화.
