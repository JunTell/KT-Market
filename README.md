# KT Market

KT 공식 온라인 판매 채널. 휴대폰 구매·번호이동·기기변경·사전예약·상담 접수 서비스를 제공합니다.

- **프론트엔드**: Framer — https://ktmarket.co.kr
- **API 서버**: Next.js App Router — https://kt-market-puce.vercel.app
- **데이터베이스**: Supabase (PostgreSQL + Auth)
- **인증**: 카카오 OAuth

---

## 기술 스택

| 분류 | 라이브러리 |
|------|-----------|
| 프레임워크 | Next.js (App Router), React 19 |
| 언어 | TypeScript 5 |
| 스타일 | Tailwind CSS v4 |
| 인증·DB | Supabase SSR (`@supabase/ssr`) |
| 서버 상태 | TanStack Query v5 |
| 클라이언트 상태 | Zustand v5 |
| 폼 | React Hook Form v7 + Zod v4 |
| 모니터링 | Sentry, Microsoft Clarity |

---

## 디렉토리 구조

```
src/
├── app/
│   └── api/
│       ├── auth/          # 카카오 OAuth, 세션, 로그아웃, 회원탈퇴
│       ├── my/            # 마이페이지 API (주문·찜·최근본·상담·사전예약·재입고·지인추천)
│       └── kakao/         # 카카오 채널 연동
├── proxy.ts               # 세션 갱신 + CORS + 어드민 라우트 보호
├── features/
│   ├── admin/             # 관리자 (applications, consultations, posts, products, reviews)
│   ├── analytics/         # 분석
│   ├── auth/              # 인증 기능
│   ├── events/            # 이벤트
│   └── product/           # 상품
└── shared/
    ├── lib/               # Supabase 클라이언트, 인증 유틸, CORS 헬퍼
    ├── stores/            # Zustand 스토어 (auth, user)
    └── types/             # Supabase 자동생성 타입

framer/
├── phone/                 # 휴대폰 상세 페이지 컴포넌트
│   ├── OrderFlowBottomSheet.tsx   # 하단 고정 CTA (타이머 배지 포함)
│   ├── OrderSummarySheet.tsx      # 주문 요약 시트
│   ├── ColorCapacitySelector.tsx  # 색상·용량 선택
│   ├── InstallmentSelectorSection.tsx  # 할부 선택
│   ├── PlanBenefitSelector.tsx    # 요금제 선택
│   ├── ProductImageCarousel.tsx   # 상품 이미지 캐러셀
│   ├── AiRecommendModal.tsx       # AI 추천 모달
│   └── ...
├── mypage/                # 마이페이지 컴포넌트
│   ├── Mypage.tsx
│   ├── OrderHistory.tsx
│   ├── Wishlist.tsx
│   ├── PreorderHistory.tsx
│   └── ...
└── asamo/                 # 아사모 공구 관련
```

---

## 인증 플로우

```
Framer 버튼 클릭
  → GET /api/auth/kakao
  → 카카오 로그인
  → GET /api/auth/callback?code=...
  → 세션 쿠키 발급 (SameSite=None; Secure)
  → profiles 테이블 upsert
  → redirect → ktmarket.co.kr/mypage
```

크로스 도메인(`ktmarket.co.kr` ↔ `kt-market-puce.vercel.app`) 구조로 `credentials: 'include'` 필수.

---

## 개발 명령어

```bash
npm run dev        # 로컬 개발 서버 (http://localhost:3000)
npm run build      # 프로덕션 빌드
npm run typecheck  # TypeScript 타입 체크
npm run lint       # ESLint
npm run check-all  # lint + typecheck + build
```

---

## 환경 변수

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # 서버 전용 — NEXT_PUBLIC_ 사용 금지
NEXT_PUBLIC_FRAMER_SITE_URL=https://ktmarket.co.kr
NEXT_PUBLIC_API_URL=https://kt-market-puce.vercel.app
KAKAO_ADMIN_KEY=                  # 회원탈퇴 카카오 연동 해제용
```
