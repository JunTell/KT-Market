# framer/phone — 휴대폰 상세 페이지 컴포넌트 가이드

Figma 원본: `수정 2차_KT마켓_상세 페이지_MO` (node-id: 1151:840)

---

## Framer 업데이트 적용 순서

> 파일 간 의존 관계가 있으므로 아래 순서대로 Framer에 올려야 합니다.

### Step 1 — 공유 컴포넌트 파일 먼저 추가 (신규)

`shared/orderComponents.tsx` 를 Framer 코드 에디터에서 **새 파일**로 생성합니다.
(경로: `framer/phone/shared/orderComponents.tsx`)

이 파일이 없으면 아래 3개 파일의 import가 실패합니다.

| 내보내는 항목 | 설명 |
|---|---|
| `FONT` | `"Pretendard", "Inter", sans-serif` 상수 |
| `useAnimatedNumber` | 숫자 카운트 애니메이션 훅 |
| `ToggleSwitch` | 토글 스위치 컴포넌트 |
| `Tooltip` | 물음표 툴팁 컴포넌트 |
| `QuestionIcon` | 물음표 SVG 아이콘 |
| `SkeletonRow` | 로딩 스켈레톤 행 |
| `Dashed` | 점선 구분선 |
| `Row` | 일반 행 (라벨 + 값) |
| `RedRow` | 빨간 할인 행 |
| `Card` | 카드 컨테이너 |
| `SectionHeader` | 섹션 헤더 |

---

### Step 2 — shared를 import하는 파일 3개 업데이트

순서 무관, 3개 모두 업데이트합니다.

| 파일 | 변경 내용 |
|---|---|
| `OrderSummarySheet.tsx` | shared import 적용, `stepNumber` 프롭 제거 |
| `OrderSummaryCard.tsx` | shared import 적용, OS 접두사 alias로 import (로컬 정의 제거) |
| `OrderFlowBottomSheet.tsx` | shared import 적용, 로컬 정의 제거 (Card는 marginBottom 유지로 로컬 유지) |

---

### Step 3 — Override 파일 업데이트

| 파일 | 변경 내용 |
|---|---|
| `phoneDetailOverridesV2.tsx` | `SPECIAL_PRICES`·`DELAYED_MODELS` 제거, 공유 헬퍼 추출, `officialMonthlyPrice` 계산 추가 |

---

### Step 4 — 나머지 컴포넌트 파일 업데이트 (독립, 순서 무관)

| 파일 | 변경 내용 |
|---|---|
| `PlanBenefitSelector.tsx` | `Freebie` 타입 추가, `any` 제거 |
| `ProductImageCarousel.tsx` | 터치 핸들러 타입 추가 |
| `ColorCapacitySelector.tsx` | `CARD_BORDER_RADIUS` 상수로 매직넘버 교체 |
| `CarrierJoinSelector.tsx` | `allCarriers` useMemo 적용 |

---

### 주의사항

- `shared/orderComponents.tsx`를 먼저 추가하지 않으면 Step 2 파일들이 **빌드 에러** 납니다.
- `phoneDetailOverridesV2.tsx`에서 삭제된 override 함수들(예: `withPhoneDetail`, `withThumbnail` 등)은 Framer 캔버스에서 해당 컴포넌트의 override 설정을 초기화해야 합니다. 현재 남아있는 override는 아래 7개뿐입니다.
- `OrderSummarySheet`의 `stepNumber` 프롭은 Framer 프롭 패널에서 더 이상 표시되지 않으므로 기존 설정값은 무시됩니다.

---

## 페이지 전체 구조

```
/phone/[model] 페이지 (예: /phone/sm-s948nk)
│
├── [Framer 네이티브] StatusBar
├── [Framer 네이티브] Header (KT마켓 로고 + 뒤로가기 + 공유)
├── [Framer 네이티브] KT 공식대리점 배너 (파란 그라디언트)
│
├── 1. ProductImageCarousel.tsx      ─ 상품 이미지 캐러셀
├── 2. ColorCapacitySelector.tsx     ─ 용량 + 색상 선택 (바텀시트 통합)
├── 3. CarrierJoinSelector.tsx       ─ 현재 통신사 / 가입유형
├── 4. PlanBenefitSelector.tsx       ─ 할인 방법 + 요금제 선택
├── 5. InstallmentSelectorSection.tsx ─ 단말기 할부 기간
├── 6. OrderSummaryCard.tsx          ─ 최종 주문서 (가격 요약)
├── 7. OrderFlowBottomSheet.tsx      ─ 신청하기 바텀시트
│
```

모든 컴포넌트는 `phoneDetailOverridesV2.tsx`의 **전역 Store**를 공유합니다.

---

## 전역 Store (useStore)

`phoneDetailOverridesV2.tsx` 상단에 정의된 공유 상태입니다.
모든 override 함수는 이 store를 읽고 씁니다.

```ts
const useStore = createStore({
    currentModelId: null,     // 현재 표시 모델 ID — SPA 핵심 (URL 대체)
    isLoading: true,          // 스켈레톤 UI 노출 여부
    device: null,             // Supabase devices 테이블 row
    colors: [],               // 색상 목록 (Color[])
    color: null,              // 선택된 색상 (Color)
    register: "기기변경",       // 가입유형: "기기변경" | "번호이동" | "신규가입"
    planInfo: null,           // 현재 선택 요금제 전체 정보
    selectedPlanInfo: null,   // 확정된 요금제
    discount: "공통지원금",     // 할인방법: "공통지원금" | "선택약정"
    installment: 24,          // 할부 기간 (개월)
    freebie: null,            // 1번 사은품
    freebieSecond: null,      // 2번 사은품
    ktmarketSubsidy: 0,       // KT마켓 추가지원금 (원)
    installmentPrincipal: 0,  // 할부원금 (원)
    isGuaranteedReturn: false,// 미리보상 여부
    // ... 기타 계산 중간값들
})
```

### SPA 핵심 흐름
```
용량 버튼 클릭
  → handleCapacitySelect(path)
  → window.history.pushState({}, "", "/phone/" + path)  // URL 조용히 변경
  → setStore({ currentModelId: path })                  // store 업데이트
  → withCarousel, withColorCapacity, withRegister, withPlanGrid ... 리렌더링
```

---

## Override 전체 목록 (phoneDetailOverridesV2.tsx)

현재 존재하는 override는 **7개**입니다.

| Override | 연결 컴포넌트 | 역할 |
|---|---|---|
| `withPriceCard` | `OrderSummaryCard` | 할부금·출고가·할인 계산 → 가격 카드 주입, `officialMonthlyPrice` 계산 포함 |
| `withOrderSheet` | `OrderFlowBottomSheet` | 가격 계산 전체 + sessionStorage 저장 + 주문 처리, `officialMonthlyPrice` 계산 포함 |
| `withCarousel` | `ProductImageCarousel` | store.color 변경 시 이미지 배열 주입 |
| `withColorCapacity` | `ColorCapacitySelector` | 색상·용량 선택 통합, 용량 변경 시 SPA URL 교체 |
| `withRegister` | `CarrierJoinSelector` | 통신사·가입유형 선택 → `setStore({ register })` |
| `withInstallmentSection` | `InstallmentSelectorSection` | 할부 기간 선택 → `setStore({ installment })` |
| `withPlanGrid` | `PlanBenefitSelector` | Supabase에서 요금제 fetch, 선택 → `setStore({ selectedPlan })` |

---

### officialMonthlyPrice (공식신청서 월 금액)

`withPriceCard`와 `withOrderSheet` 모두에서 계산되어 각 컴포넌트로 전달됩니다.

```
KT마켓 지원금 제외 할부원금 = 출고가 - (전체 단말 할인 - KT마켓 단독지원금)
officialMonthlyPrice = 위 원금의 월 할부금(5.9%) + 월 요금제 금액
```

`LaunchNotice.tsx` 컴포넌트에 `officialMonthlyPrice` 프롭으로 주입하면 공식신청서 안내 텍스트에 금액이 자동으로 표시됩니다.

---

## 컴포넌트별 상세

---

### 1. ProductImageCarousel.tsx
**역할:** 상품 이미지 캐러셀 (스와이프 가능)

**화면 위치:** 헤더 바로 아래, 색상 선택 위

**연결 Override: `withCarousel`**

```
store.color.urls[]  →  withCarousel  →  ProductImageCarousel (images prop)
```

---

### 2. ColorCapacitySelector.tsx
**역할:** 용량 + 색상 통합 선택 UI
- 평소: 요약 카드 (이미지 + 색상명 + 용량 + 화살표)
- 클릭 시: 바텀시트 모달 (용량 세그먼트 탭 + 색상 리스트)

**화면 위치:** 상품 이미지 아래 `용량 및 색상` 섹션

**연결 Override: `withColorCapacity`**

```
store.device.capacities[] ──┐
store.device.paths[]        ├──→ withColorCapacity ──→ ColorCapacitySelector
store.colors[]              │     ├─ onCapacitySelect(path) → pushState + setStore
store.color (선택된 색상) ───┘     └─ onColorChange(color)  → setStore({ color })
```

---

### 3. CarrierJoinSelector.tsx
**역할:** 현재 통신사(KT/SKT/U+/알뜰폰) + 가입유형(기기변경/번호이동/신규가입) 라디오 선택

**화면 위치:** 용량·색상 선택 아래 `현재 통신사` 섹션

**연결 Override: `withRegister`**

```
withRegister
  ├─ 모델별 기본 가입유형 자동 설정 (번호이동 기본 모델 목록)
  ├─ 신규가입 허용 모델 목록 (aip16e, sm-a175nk-kp 등)
  └─ onRegisterChange(register, carrier) → setStore({ register, carrier })
```

**피그마 디자인:**
- 선택됨: `#ecf4ff` 배경 + `#0066ff` 테두리 + 파란 라디오 dot
- 미선택: 흰 배경 + `#dadada` 테두리 + 회색 라디오 dot

---

### 4. PlanBenefitSelector.tsx
**역할:** 할인 방법 탭(기기 할인/요금 할인) + 요금제 카드 목록 + 사은품 선택

**화면 위치:** 통신사 선택 아래 `할인 방법` + `요금제` 섹션

**연결 Override: `withPlanGrid`**

```
store.register + store.discount
  → withPlanGrid.fetchPlans()
  → Supabase device_plans_{new|mnp|chg} 쿼리
  → selectedPlan → setStore({ selectedPlan })
```

---

### 5. InstallmentSelectorSection.tsx
**역할:** 단말기 할부 기간 선택 (일시불 / 24개월 / 36개월 / 기타)

**화면 위치:** 요금제 선택 아래 `단말기 할부 기간` 섹션

**연결 Override: `withInstallmentSection`**

---

### 6. OrderSummaryCard.tsx
**역할:** 최종 주문서 — 가격 산출 요약
(월 할부금 · 출고가 · KT마켓 지원금 · 할부원금 / 월 통신요금 · 요금할인 / 월 예상 금액)

**화면 위치:** 할부 기간 아래 `최종 주문서` 섹션

**연결 Override: `withPriceCard`**

---

### 7. OrderFlowBottomSheet.tsx
**역할:** 하단 고정 CTA 영역
- 기본: "신청하기" 버튼 + 간략 가격 표시
- 클릭 시: 바텀시트 모달 상승 (상세 주문서 + 카카오 주문 / 일반 주문 분기)

**화면 위치:** 화면 하단 고정 (`position: fixed`)

**연결 Override: `withOrderSheet`**

**주문 버튼 분기 로직:**
```
"카카오로 10초 간편 주문" 클릭
  ├─ 로그인 O → window.location.href = "/phone/user-info"
  └─ 로그인 X → window.location.href = "/api/auth/kakao?redirect=/phone/user-info"

"주문하기" 클릭 (로그인 여부 무관)
  └─ window.location.href = "/phone/user-info"
```

**sessionStorage 저장 (withOrderSheet):**
```ts
sessionStorage.setItem("sheet", JSON.stringify({
    planName, planPrice, devicePrice,
    installmentPrincipal, ktmarketSubsidy,
    doubleStorageDiscount, promotionDiscount,
    totalMonthPayment, installment, discount,
    officialMonthlyPrice, formLink, ...
}))
sessionStorage.setItem("data", JSON.stringify({
    device: { model, pet_name, capacity, form_link },
    color: { kr, urls },
    register,
}))
```

---

## 주문 플로우 전체

```
/phone/[model]  (OrderFlowBottomSheet)
  │  ↓ sessionStorage: "sheet", "data" 저장
  ▼
/phone/user-info  (UserInfoForm.tsx)
  │  ↓ POST /api/my/orders  — 자사 DB 등록
  │  ↓ sessionStorage: "user-info" 저장
  ▼
/phone/application-gate  (ApplicationGatePage.tsx)
  │  ↓ KT 공식 신청서 새 탭으로 열기 (formLink)
  │  ↓ 돌아와서 완료 확인
  ▼
/phone/application-confirm  (ApplicationConfirmPage.tsx)
     ↓ 주문 접수 완료 화면
     ↓ 카카오 채널 추가 동기화 (POST /api/kakao/sync-channel)
```

---

## 디자인 토큰 (Figma 기준)

| 토큰 | 값 | 용도 |
|---|---|---|
| Primary Blue | `#0066ff` | 선택 상태, CTA 버튼, active 테두리 |
| Light Blue BG | `#ecf4ff` | 선택된 카드 배경 |
| Border Default | `#dadada` | 미선택 카드 테두리 |
| Text Primary | `#1b1c1e` | 메인 텍스트 |
| Text Muted | `#70737c` / `#939393` | 서브 텍스트 |
| Discount Red | `#d83232` | 할인 금액 강조 |
| Divider BG | `#f8f9fa` | 섹션 구분선 |
| Font | Pretendard | 전체 (`FONT` 상수 → `shared/orderComponents.tsx`) |
| Border Radius (카드) | `CARD_BORDER_RADIUS = 10.526px` | 라디오 선택 카드 |
| Border Radius (버튼) | `8px` | 일반 버튼 |
| Button Height | `43px` (CTA) / `32px` (소형) | — |
