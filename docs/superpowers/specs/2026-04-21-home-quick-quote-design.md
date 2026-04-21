# Framer 홈 + 빠른 견적 플로우 설계

**작성일:** 2026-04-21
**브랜치 대상:** 후속 feature 브랜치 (예: `feature/home-quick-quote`)
**관련 파일:** `framer/home/HomeHero.tsx`, `framer/home/QuickQuoteFlow.tsx`, `src/app/api/consultations/quick-quote/route.ts`, `supabase/migrations/20260421_customer_consultations_extend.sql`

---

## 1. 개요

KT마켓(Framer) 홈 페이지와 "빠른 견적받아보기" 플로우를 신규 구축한다.

- 모바일 우선 (사용자의 80%가 모바일).
- 밝은 Claude 스타일(크림/베이지 배경) + KT 브랜드 블루(`#0066FF`) CTA 혼합.
- 5단계 바텀시트로 기종·용량·가입유형·정보를 받아 `customer_consultations` 테이블에 저장.
- 수집은 이름·전화번호·생년월일만 (주소/주민번호 등 수집하지 않음).

## 2. 목표 / 비목표

### 목표
- 홈 진입 → 1분 내 상담 신청 완료
- 기존 `customer_consultations` 관리자 운영 흐름 재사용
- 모바일 환경에서 풀스크린 수준의 몰입도 (바텀시트 + 진행바)

### 비목표
- 요금제·사은품·할부 등 세부 조건 수집 (상담원이 후속 상담 시 확인)
- 자동 가격 계산 / 견적 숫자 즉시 표시 (이번 스코프 제외)
- 다국어·해외번호 지원

## 3. 파일 구조

```
framer/home/
  HomeHero.tsx               홈 히어로 (타이틀 + 서브 + CTA 1개)
  QuickQuoteFlow.tsx         바텀시트 (5단계 + 완료 화면)

src/app/api/consultations/quick-quote/
  route.ts                   POST 상담 신청 엔드포인트

supabase/migrations/
  20260421_customer_consultations_extend.sql
```

## 4. 데이터베이스 마이그레이션

`customer_consultations` 테이블을 `online_order`와 동등한 구조로 확장한다. 기존 레코드는 운영자가 수동으로 삭제(2건뿐). `phone`에 UNIQUE 제약은 걸지 않는다(동일인 다회 견적 허용).

```sql
-- 20260421_customer_consultations_extend.sql

ALTER TABLE customer_consultations
  ADD COLUMN IF NOT EXISTS device text,
  ADD COLUMN IF NOT EXISTS model text,
  ADD COLUMN IF NOT EXISTS "petName" text,
  ADD COLUMN IF NOT EXISTS capacity text,
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS register text,
  ADD COLUMN IF NOT EXISTS plan text,
  ADD COLUMN IF NOT EXISTS freebie text,
  ADD COLUMN IF NOT EXISTS installment text,
  ADD COLUMN IF NOT EXISTS installment_principal text,
  ADD COLUMN IF NOT EXISTS discount text,
  ADD COLUMN IF NOT EXISTS benefit text,
  ADD COLUMN IF NOT EXISTS carrier text,
  ADD COLUMN IF NOT EXISTS is_consultation boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS kakao_friend_rewarded boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS kakao_friend_checked_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_customer_consultations_profile_id
  ON customer_consultations(profile_id);
CREATE INDEX IF NOT EXISTS idx_customer_consultations_phone
  ON customer_consultations(phone);
```

> `mobile_carrier` 컬럼은 기존 보유. 새 플로우에서는 사용하지 않고 `carrier='KT'`로 통일 저장.

## 5. API 설계

### `POST /api/consultations/quick-quote`

**Request body (JSON)**
```ts
{
  model: string         // devices.model (예: 'SM-F766U')
  petName: string       // '갤럭시 Z플립7'
  device: string        // 'smartphone' | 'tablet' | 'watch' 등 (현재는 'smartphone' 고정)
  capacity: string      // '256GB'
  register: '번호이동' | '기기변경'
  name: string          // 2~20자
  phone: string         // 숫자 11자 (자동 하이픈 제거 후 전달)
  birthday: string      // YYMMDD 6자리
}
```

**검증 (zod)**
- 모든 필드 필수
- `phone`: `/^01[016789]\d{7,8}$/`
- `birthday`: `/^\d{6}$/`
- `register`: enum `['번호이동', '기기변경']`
- `model`은 `devices.model`에 존재하는지 확인 (선택적 — 없으면 저장 차단)

**저장**
- `carrier = 'KT'`, `is_consultation = true`, `is_processed = false` 자동
- 쿠키 세션이 있으면 `profile_id` 채움 (옵션, 로그인 없이도 가능)
- 나머지 `plan`, `freebie`, `installment`, `installment_principal`, `discount`, `benefit`, `color`는 null

**Response**
```ts
// 성공
{ ok: true, id: number }
// 실패
{ ok: false, error: string }
```

**CORS**
- 기존 패턴: `getCorsHeaders()` + `OPTIONS` 핸들러

## 6. 홈 페이지 `HomeHero.tsx`

### 레이아웃
- 풀뷰포트(`minHeight: 100svh`) 중앙 정렬
- 배경: `#FAF9F5` (Claude 크림)
- 우상단 미니 로고 뱃지는 생략 (Framer 상단 네비에서 처리)

### 콘텐츠
```
[타이틀]   KT 공식대리점 온라인몰
           KT마켓에서만 가능한 가격을 만나보세요

[서브]     상담부터 개통까지, 단 한 번의 클릭으로

[CTA]      [ 빠른 견적받아보기 → ]   (KT 블루 #0066FF)
```

### 스타일
- 타이틀: `fontSize: 28` (모바일) / `32` (≥768px), `lineHeight: 1.3`, `color: #24292E`, 두 줄
- 서브: `fontSize: 16`, `color: #3F4750`, `lineHeight: 1.5`
- CTA: 높이 56, 라운드 16, `#0066FF` 배경, 화이트 텍스트 `fontSize: 17 bold`, 탭 시 opacity 0.9
- 부드러운 블러 장식: CTA 뒤쪽 코랄 `#D97757` 20% 투명도 원형 블러 (장식용)

### 동작
- CTA 클릭 → 전역 커스텀 이벤트 `window.dispatchEvent(new Event('ktmarket:open-quick-quote'))` 발송
- `QuickQuoteFlow`는 마운트 시 이 이벤트를 리스닝해서 자체적으로 열림 상태로 전환 (Framer의 컴포넌트 간 통신 제약 우회)
- Framer 페이지에 두 컴포넌트를 같은 페이지에 배치하면 동작

### Property Controls
- `title` (string, default 위 텍스트)
- `subtitle` (string)
- `ctaLabel` (string, default "빠른 견적받아보기")
- `ctaColor` (color, default `#0066FF`)

## 7. QuickQuoteFlow.tsx (바텀시트)

### 전체 동작
- 상태: `step: 1 | 2 | 3 | 4 | 5 | 'done'`, `selection: { model, petName, device, capacity, register }`, `form: { name, phone, birthday, agree }`
- 열림 상태일 때 body 스크롤 lock
- 뒤로가기(`<`) 시 이전 step, step 1에서는 바텀시트 닫기
- ESC / 배경 탭 시 닫기 (확인 없이 — 짧은 플로우이므로)

### 공통 셸
- 모바일: `position: fixed; inset: 0; backgroundColor: rgba(0,0,0,0.4)` 오버레이 + 시트 전체가 화면을 채움
- 데스크탑(≥768px): 중앙 정렬된 카드 `maxWidth: 480px`, `maxHeight: 680px`, 라운드 24
- 헤더: `< 빠른 견적 ×`
- 진행바: 4/5 단계 (확인 모달은 전환용, 진행바 갱신 안 함). 전체 너비 기준 `(step/4)*100%` 블루 바
- 하단 고정 바: 좌측 "일단 둘러볼게요"(보더 블루), 우측 "다음" / "상담 신청하기"
  - 좌측 클릭 → `window.location.href = '/phone'`
  - 우측 비활성 시 `#E5E7EB` 배경 + `#ADB5BD` 텍스트

### Step 1 — 기종 선택
- 세그먼트: `[갤럭시 | 아이폰 | 키즈폰]`
  - 활성 탭: 배경 `#FFFFFF`, 텍스트 `#0066FF`, shadow
  - 비활성 탭: 배경 transparent, 텍스트 `#868E96`
- 데이터 로드: `GET /api/compare/devices` (기존 API 재사용) 후 `company` 기준으로 필터
  - 갤럭시: `company === 'samsung'`
  - 아이폰: `company === 'apple'`
  - 키즈폰: `category === 'kidsphone'` 또는 `company === 'kt'` (추후 확장 여지; 일단 빈 상태 + 안내 텍스트)
- 2열 그리드 카드:
  - 이미지: `devices.thumbnail`
  - 라벨: `devices.pet_name`
  - 선택 시: 테두리 `2px solid #0066FF`, 배경 연블루 `#EFF6FF`
- 하단 "다음" 활성 조건: 기종 1개 선택

### Step 2 — 용량 선택
- 타이틀: `{petName} 용량을 선택해주세요`
- 리스트: `devices.capacities[]`를 전체 너비 카드로 출력
- 카드 스타일: 높이 56, 배경 `#F5F1EB`, 선택 시 `2px solid #0066FF` + 배경 `#EFF6FF`
- `capacities`가 비어 있는 기종을 선택한 경우: Step 2를 자동 스킵하고 `capacity = ''`로 저장. Step 3(가입유형)으로 이동

### Step 3 — 가입유형
- 타이틀: "가입 유형을 선택해주세요"
- 서브: "현재 사용하고 있는 번호는 바뀌지 않아요"
- 2열 카드:
  - **번호이동**: 원형 화이트 배경 + KT 로고 블루 · "번호이동" · "다른 통신사에서 KT로 이동"
  - **기기변경**: 원형 화이트 배경 + KT 로고 블루 · "기기변경" · "KT 사용 중이며 기기만 변경"
- 선택 시 카드 테두리 블루 + 배경 `#EFF6FF`
- "다음" 클릭 → **확인 모달** 오픈

### 확인 모달 (step 3 → 4 사이)
- 하위 오버레이 모달 (z-index 상위)
- 타이틀: "신청 전 꼭 확인해주세요!"
- 번호 뱃지(`#0066FF` 원형) + 각 안내 항목:
  1. 상담 완료 전에는 기기가 발송되지 않습니다
  2. 언제든 취소 가능하며, 정보는 안전하게 파기됩니다
  3. 결합 할인 및 위약금 확인 안내
  4. 요금제 유지 기간 및 할인 조건
- 스크롤 가능, 하단 고정 "네, 확인했습니다." 버튼(KT 블루) → step 4 진입
- 우상단 `×` → 모달만 닫고 step 3에 머무름

### Step 4 — 정보 입력
- 타이틀: "정확한 상담을 위해 / 정보를 작성해주세요"
- 우측 "안심보안" 뱃지 (`#ECFDF5` 배경, `#22C55E` 아이콘/텍스트)
- 필드 (플로팅 언더라인 스타일):
  - **이름**: placeholder "김유플", maxLength 20
  - **전화번호**: placeholder "010-0000-0000", 자동 하이픈 포맷팅 (입력은 숫자만 허용, 3-4-4 포맷)
  - **생년월일**: placeholder "YYMMDD", maxLength 6, 숫자만
- 개인정보 수집 동의:
  - 체크박스 (기본 `true`, 해제 시 제출 불가)
  - 펼침 토글 → 수집 항목·목적·보관기간 안내 (기존 `/phone/agreement` 텍스트 참조)
- 하단 고정 버튼: 좌측 "일단 둘러볼게요" / 우측 "상담 신청하기"
  - 우측 활성 조건: 이름 ≥ 2자 AND phone(숫자 11자리) AND birthday(숫자 6자리) AND agree === true

### 제출
- 버튼 클릭 → `POST /api/consultations/quick-quote` (credentials: include)
- 로딩 중 버튼 비활성 + 스피너
- 성공 → step = `'done'`
- 실패 → 상단 토스트 ("잠시 후 다시 시도해주세요") + 버튼 복구

### Step 5 — 완료 화면
- 중앙 체크 아이콘 (원형 블루 배경)
- 타이틀: "상담 신청이 접수됐어요"
- 설명: "영업일 기준 1일 이내에 전화로 연락드릴게요"
- 단일 버튼 "확인" → 바텀시트 닫기

### 에러 처리
- API 실패: 상단 inline 토스트 (2초 후 페이드)
- 10초 타임아웃: AbortController로 정리, "네트워크가 불안정합니다" 메시지
- 필드 검증 실패: 필드 하단 빨강 `#EF4444` 안내

### Property Controls
- `onClose` (EventHandler)
- `primaryColor` (color, default `#0066FF`)
- `apiUrl` (string, default `https://kt-market-puce.vercel.app`)

## 8. 스타일 토큰 요약

| 토큰 | 값 | 사용처 |
|------|-----|--------|
| Background base | `#FAF9F5` | 홈/시트 배경 |
| Card cream | `#F5F1EB` | 옵션 카드 기본 |
| Card selected | `#EFF6FF` | 선택된 카드 배경 |
| Primary | `#0066FF` | CTA, 진행바, 체크 아이콘 |
| Primary subtle | `#E6F0FF` | 진행바 트랙 |
| Text primary | `#24292E` | 타이틀 |
| Text secondary | `#3F4750` | 설명 |
| Text muted | `#868E96` | placeholder, 비활성 |
| Success | `#22C55E` | 안심보안 뱃지 |
| Error | `#EF4444` | 에러 메시지 |
| Accent warm | `#D97757` | 홈 히어로 블러 장식 |

폰트: `"Pretendard Variable", "Pretendard", sans-serif` (기존 TYPOGRAPHY.md 규칙 준수)

## 9. 테스트 계획

### 수동 QA
- 모바일 뷰포트(375×812)에서 5단계 전체 흐름 완료
- 데스크탑에서 중앙 카드 모달 정상 표시
- 전화번호 자동 하이픈이 backspace/붙여넣기에도 정상 동작
- 생년월일 6자리 초과 입력 차단
- 체크박스 해제 시 "상담 신청하기" 비활성
- `일단 둘러볼게요` 클릭 → `/phone` 이동
- API 500/네트워크 오류 시 토스트 노출 + 버튼 복구
- 제출 성공 후 Supabase `customer_consultations` 레코드에 `name/phone/birthday/model/petName/capacity/register/carrier='KT'/is_consultation=true` 확인

### 자동 검증
- `npm run check-all` 통과 (lint/typecheck/build)

## 10. 롤아웃 순서 (구현 플랜에서 세분화)

1. Supabase 마이그레이션 적용 (`customer_consultations` ALTER)
2. `POST /api/consultations/quick-quote` 구현 + 로컬 테스트
3. `framer/home/HomeHero.tsx` 작성
4. `framer/home/QuickQuoteFlow.tsx` 작성 (단계별 서브 섹션은 내부 컴포넌트로)
5. Framer 페이지에 배치·퍼블리시

## 11. 향후 확장 여지

- 키즈폰 카탈로그 데이터 확보 시 Step 1 세그먼트 활성화
- "상담 신청 완료" 후 카카오 채널 추가 유도 모달
- 요금제·사은품 선택 단계를 플로우에 추가 (지금은 상담원 몫)
- 제출 성공 시 관리자 Slack/Webhook 알림
