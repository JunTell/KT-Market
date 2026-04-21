# 기종 비교 + 가격 알림 기능 설계

**작성일**: 2026-04-21
**상태**: 승인됨 — 구현 대기

---

## 개요

두 가지 신규 기능을 Framer 코드 컴포넌트 + Next.js API Route로 구현한다.

1. **기종 비교** (`/phone/compare`) — 최대 3개 기종을 선택, 요금제 구간별 월 납부금액을 라인 차트로 비교
2. **가격 인하 알림** — 공시지원금이 인하될 때(가격 저렴해질 때) 신청한 고객에게 알림 발송. 카카오 로그인 필수

---

## Feature 1: 기종 비교

### 위치
- Framer 신규 페이지: `/phone/compare`
- Framer 코드 컴포넌트: `framer/phone/PhoneCompare.tsx`

### UI 구조 (승인된 목업: `comparison-v2.html`)

```
[헤더: ← 기종 비교]

[폰 슬롯 3칸 고정 그리드]
  - 선택된 폰: 색상 카드 (빨강/파랑/초록) + 썸네일 + 이름 + ✕ 제거
  - 빈 슬롯: 점선 + "+ 추가" → 기종 선택 모달

[가입유형 세그먼트: 번호이동 | 기기변경]

[요금제 3구간 버튼]
  - 3.7만원↑ (베이직)
  - 6.9만원↑ (스탠다드)  ← 기본 선택
  - 9.0만원↑ (프리미엄)

[라인 차트 카드]
  - X축: 3.7만↑ / 6.9만↑ / 9.0만↑
  - Y축: 월 납부금액 (만원 단위)
  - 라인: 선택된 기종별 (최대 3개)
  - 스타일: 흰 원 포인트 + 그라디언트 fill + 다크 tooltip
  - 범례: 카드 하단

[최저가 하이라이트 카드]
  - 현재 구간에서 가장 저렴한 기종 강조
  - 절약 금액 계산 (월, 24개월 합산)

[비교표]
  - 행: 월 납부금 / 공시지원금 / 출고가
  - 열: 선택된 기종 3개
  - 최저값 빨간색 + ✓ 표시

[알림 배너] → Feature 2 진입점
  "공시지원금 인하 시 알림받기 — 카카오톡으로 즉시 알림 [알림 신청]"
```

### 데이터 흐름

```
컴포넌트 마운트
  → GET /api/compare/devices           # is_available=true 기종 목록 (기종 선택 모달용)
  → 사용자가 기종 3개 + 가입유형 + 요금제 구간 선택
  → GET /api/compare/prices?models=A,B,C&register=mnp
    ← device_plans_mnp (또는 chg) JOIN devices
    ← ktmarket_subsidy 기준 구간별 추가지원금 계산
    ← 최종 월 납부금 = (출고가 - 공시지원금 - KT마켓지원금) / 24 + 요금제
  → 차트/비교표 렌더링
```

### 신규 API Route

**`GET /api/compare/devices`**
```ts
// 응답
[{ model, pet_name, thumbnail, company, is_available }]
// devices 테이블에서 is_available=true 목록
```

**`GET /api/compare/prices`**
```ts
// 쿼리: models=SM-S938N,iPhone17,SM-S731N&register=mnp
// 응답: 기종별 × 요금제 구간별 가격 배열
[{
  model: string
  pet_name: string
  price: number          // 출고가
  disclosure_subsidy: number
  plans: {               // 3구간
    tier: '37000' | '69000' | '90000'
    monthly: number      // 최종 월 납부금
    ktmarket_subsidy: number
  }[]
}]
```

### 요금제 구간 매핑

| UI 표시 | ktmarket_subsidy 컬럼 구간 |
|---------|--------------------------|
| 3.7만원↑ | `gte_37000` |
| 6.9만원↑ | `gte_61000` (6.1만 이상 구간 사용) |
| 9.0만원↑ | `gte_90000` |

> `gte_69000` 컬럼이 없으므로 `gte_61000` 구간 데이터를 6.9만원↑로 표시

### 컴포넌트 파일

- `framer/phone/PhoneCompare.tsx` — 메인 비교 페이지 컴포넌트
- `framer/phone/PhoneSelectModal.tsx` — 기종 선택 모달
- `src/app/api/compare/devices/route.ts`
- `src/app/api/compare/prices/route.ts`

---

## Feature 2: 가격 인하 알림

### 전제 조건
- 카카오 로그인 필수 (profile_id 필요)
- 알림 미로그인 시 → 카카오 로그인 바텀시트 표시

### 신규 DB 테이블: `price_alert_subscriptions`

```sql
CREATE TABLE public.price_alert_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id),
  model text NOT NULL REFERENCES devices(model),
  register_type text NOT NULL,  -- 'mnp' | 'chg'
  target_price bigint,          -- 희망 월납부금 (선택적)
  last_subsidy bigint,          -- 알림 기준 공시지원금 스냅샷
  is_active boolean DEFAULT true,
  notified_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, model, register_type)
);
```

### 알림 트리거 방식

관리자가 `device_plans_mnp/chg`의 `disclosure_subsidy`를 업데이트할 때:
- `price_alert_subscriptions`에서 해당 model + register_type 구독자 조회
- `last_subsidy`보다 `disclosure_subsidy`가 증가(지원금 증가 = 가격 저렴)한 경우 알림 발송
- 알림 채널: 카카오 알림톡 or 카카오톡 채널 메시지 (기존 카카오 채널 연동 활용)
- 발송 후 `notified_at`, `last_subsidy` 업데이트

### 신규 API Route

**`POST /api/alerts/subscribe`** (카카오 로그인 필수)
```ts
body: { model: string, register_type: 'mnp' | 'chg' }
// price_alert_subscriptions upsert
// last_subsidy 현재 공시지원금으로 초기화
```

**`DELETE /api/alerts/subscribe`**
```ts
query: { model, register_type }
// is_active = false
```

**`GET /api/alerts/subscriptions`** (마이페이지 연동)
```ts
// 내 알림 신청 목록
```

### UI 흐름

```
비교 페이지 하단 알림 배너 클릭
  → 로그인 상태 확인
  → 미로그인: 카카오 로그인 바텀시트
  → 로그인: 현재 비교 중인 기종들에 대해 알림 신청 바텀시트
      - 각 기종별 토글 (번이/기변 선택)
      - "신청 완료" → POST /api/alerts/subscribe
      - 카카오채널 추가 유도 (기존 sync-channel 활용)
```

---

## 디자인 토큰 (기존 페이지 일관성)

```
폰트: FONT (from OrderComponents-QLDYR7.js)
Primary: #EF4444 (빨강)
Blue: #3B82F6
Green: #10B981
Text: #111827, #374151, #6b7280, #9ca3af
Border: #e5e7eb, #eef0f2
Radius: 14px (카드), 12px (버튼), 100px (뱃지/칩)
Shadow: 0 2px 8px rgba(0,0,0,0.04)
```

---

## 구현 순서

1. DB 마이그레이션: `price_alert_subscriptions` 테이블 생성
2. API: `GET /api/compare/devices`
3. API: `GET /api/compare/prices`
4. Framer: `PhoneSelectModal.tsx` (기종 선택)
5. Framer: `PhoneCompare.tsx` (메인 비교 페이지)
6. API: `POST /api/alerts/subscribe`, `DELETE /api/alerts/subscribe`
7. Framer: 알림 신청 바텀시트 (로그인 게이트 포함)
8. 마이페이지 `GET /api/alerts/subscriptions` 연동
