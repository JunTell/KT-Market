# framer/phone — 휴대폰 상세 페이지 컴포넌트 가이드

Figma 원본: `수정 2차_KT마켓_상세 페이지_MO` (node-id: 1151:840)

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
  → withPhoneDetail useEffect([store.currentModelId])
  → setStore({ isLoading: true }) → Supabase fetch → setStore({ isLoading: false })
  → 모든 컴포넌트 리렌더링 (하드 리로드 없음)
```

---

## 컴포넌트별 상세

---

### 1. ProductImageCarousel.tsx
**역할:** 상품 이미지 캐러셀 (스와이프 가능)

**화면 위치:** 헤더 바로 아래, 색상 선택 위

**연결 Override:**
| Override | 역할 |
|---|---|
| `withPhoneDetail` | 페이지 마운트 시 Supabase에서 기기 데이터 fetch, `currentModelId` 변경 시 재호출 |
| `withCarousel` | store.color 변경 시 해당 색상의 이미지 배열을 캐러셀에 주입 |
| `withThumbnail` | 현재 선택 색상의 첫 번째 이미지를 썸네일로 전달 |

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

**Props 주입:**
```ts
{
    capacities: { capacity: string, path: string }[],
    currentModelId: string,
    colors: Color[],
    selectedColor: Color,
    isLoading: boolean,
    onCapacitySelect: (path) => void,
    onColorChange: (color) => void,
}
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
**역할:** 할인 방법 탭(기기 할인/요금 할인) + 요금제 카드 목록

**화면 위치:** 통신사 선택 아래 `할인 방법` + `요금제` 섹션

**연결 Override:**
| Override | 역할 |
|---|---|
| `withDiscount` | `기기 할인` / `요금 할인` 탭 → `setStore({ discount })` |
| `withPlan` | 요금제 카드 개별 (메인 요금제) active/inactive 상태 + 클릭 핸들러 |
| `withSubPlan` | 초이스 요금제 등 서브 요금제 카드 |
| `withPlanButton` | 요금제 선택 버튼 variant 관리 |
| `withPlanGrid` | 요금제 그리드 전체 렌더링 |
| `withSelectedPlan` | 현재 선택된 요금제 요약 표시 |
| `withPlanInfo` | 선택 요금제 상세 정보 표시 |

```
store.register + store.discount
  → withPhoneDetail.fetchMainPlanData()
  → Supabase device_plans_{new|mnp|chg} 쿼리
  → store.planInfo (선택된 요금제)
  → withPlan → PlanBenefitSelector (variant: active/inactive)
```

---

### 5. InstallmentSelectorSection.tsx
**역할:** 단말기 할부 기간 선택 (일시불 / 24개월 / 36개월 / 기타)

**화면 위치:** 요금제 선택 아래 `단말기 할부 기간` 섹션

**연결 Override:**
| Override | 역할 |
|---|---|
| `withInstallmentSection` | 섹션 전체 표시 여부 제어 (일부 모델 숨김) |
| `withInstallment` | 선택 버튼 클릭 → `setStore({ installment })` + variant 관리 |
| `withGuaranteedReturnWarning` | 미리보상 선택 시 경고 텍스트 표시 |
| `withGuaranteedReturnComponent` | 미리보상 토글 컴포넌트 |

**피그마 디자인:**
- 선택됨: `#ecf4ff` 배경 + `#0066ff` 텍스트 + 파란 테두리
- 미선택: 흰 배경 + `#dadada` 테두리

---

### 6. OrderSummaryCard.tsx
**역할:** 최종 주문서 — 가격 산출 요약
(월 할부금 · 출고가 · KT마켓 지원금 · 할부원금 / 월 통신요금 · 요금할인 / 월 예상 금액)

**화면 위치:** 할부 기간 아래 `최종 주문서` 섹션

**연결 Override:**
| Override | 역할 |
|---|---|
| `withPriceCard` | 할부금·출고가·할인 계산 결과를 컴포넌트에 주입 |
| `withOrderSheetFreebie` | 사은품 항목 표시 (freebie, freebieSecond) |
| `withKTMarketSubsidy` | KT마켓 추가지원금 금액 표시 |
| `withKTMarketBenefit` | KT마켓 혜택 설명 텍스트 |
| `withConfirmDeviceInfo` | 기기 정보 요약 (모델명·색상·용량) |
| `withConfirmOrderSheet` | 주문서 전체 데이터 주입 |
| `withConfirmTotalPaymentOrderSheet` | 최종 월 납부 금액 |

---

### 7. OrderFlowBottomSheet.tsx
**역할:** 하단 고정 CTA 영역
- 기본: "신청하기" 버튼 + 간략 가격 표시
- 클릭 시: 바텀시트 모달 상승 (상세 주문서 + 카카오 주문 / 일반 주문 분기)

**화면 위치:** 화면 하단 고정 (`position: fixed`)

**연결 Override:**
| Override | 역할 |
|---|---|
| `withOrderSheet` | 가격 계산 전체 (할부금·요금·지원금 합산) + sessionStorage 저장 |
| `withSubmitButton` | "주문하기" 버튼 → `/phone/user-info` 이동 |
| `withOnlineButton` | "카카오로 10초 간편 주문" → 로그인 여부에 따라 분기 |

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
    formLink, ...
}))
sessionStorage.setItem("data", JSON.stringify({
    device: { model, pet_name, capacity, form_link },
    color: { kr, urls },
    register,
}))
```

---

## Override 전체 목록 (phoneDetailOverridesV2.tsx)

### 핵심 (모든 페이지 필수)
| Override | 연결 대상 | 역할 |
|---|---|---|
| `withPhoneDetail` | 페이지 루트 컨테이너 | Supabase 데이터 fetch, `currentModelId` 감시, isLoading 토글 |

### 이미지·정보
| Override | 연결 대상 | 역할 |
|---|---|---|
| `withCarousel` | ProductImageCarousel | 색상별 이미지 배열 주입 |
| `withThumbnail` | 썸네일 이미지 | 첫 번째 이미지 URL |
| `withDeviceInfo` | 기기 정보 텍스트 | 모델명·색상·용량 |
| `withMainInfo` | 상단 가격 표시 | 최저가 텍스트 |
| `withPriceComponent` | 가격 숫자 | 실시간 가격 계산 |
| `withTempBanner` | 이벤트 배너 | 모델별 배너 텍스트 |

### 선택 컨트롤
| Override | 연결 대상 | 역할 |
|---|---|---|
| `withColorCapacity` | ColorCapacitySelector | 색상+용량 통합 선택 |
| `withCapacity` | ~~PhoneCapacitySectionComponent~~ | @deprecated — `withColorCapacity`로 통합됨 |
| `withColor` | 색상 선택 (단독) | 색상만 변경 |
| `withRegister` | CarrierJoinSelector | 통신사·가입유형 |
| `withDiscount` | 할인방법 탭 | 공통지원금/선택약정 토글 |
| `withInstallment` | 할부 기간 버튼 개별 | 개월 선택 |
| `withInstallmentSection` | 할부 섹션 전체 | 표시 여부 |

### 요금제
| Override | 연결 대상 | 역할 |
|---|---|---|
| `withPlan` | 요금제 카드 (메인) | active/inactive + 선택 |
| `withSubPlan` | 요금제 카드 (서브) | 초이스 등 |
| `withPlanButton` | 요금제 선택 버튼 | variant |
| `withPlanGrid` | 요금제 전체 그리드 | 렌더링 제어 |
| `withPlanInfo` | 요금제 상세 정보 | 데이터·테더링 등 |
| `withSelectedPlan` | 선택 요금제 요약 | 현재 선택 표시 |

### 사은품
| Override | 연결 대상 | 역할 |
|---|---|---|
| `withFreebie` | 사은품 버튼 개별 | active/inactive |
| `withFreebiesSection` | 사은품 섹션 전체 | 표시 여부 |
| `withFreebies` | 사은품 목록 | freebies 배열 주입 |
| `withFreebiesSecondSection` | 2번 사은품 섹션 | 표시 여부 |
| `withOrderSheetFreebie` | 주문서 내 사은품 | 선택 사은품 표시 |

### 혜택·지원금
| Override | 연결 대상 | 역할 |
|---|---|---|
| `withKTMarketSubsidy` | KT마켓 지원금 텍스트 | 금액 표시 |
| `withKTMarketBenefit` | 혜택 설명 | 텍스트 주입 |
| `withBenefit` | 혜택 버튼 개별 | active/inactive |
| `withBenefitSection` | 혜택 섹션 | 표시 여부 |
| `withAddtionalBenefit` | 추가 혜택 | 조건부 표시 |

### 주문서·버튼
| Override | 연결 대상 | 역할 |
|---|---|---|
| `withOrderSheet` | OrderFlowBottomSheet | 가격 계산 + 주문 처리 |
| `withSubmitButton` | 주문하기 버튼 | `/phone/user-info` 이동 |
| `withOnlineButton` | 카카오 간편 주문 버튼 | 로그인 분기 |
| `withPriceCard` | OrderSummaryCard | 가격 요약 |
| `withConfirmDeviceInfo` | 기기 확인 카드 | 모델 정보 |
| `withConfirmOrderSheet` | 주문 확인 | 전체 데이터 |
| `withConfirmTotalPaymentOrderSheet` | 최종 금액 | 월 납부액 |

### 기타
| Override | 연결 대상 | 역할 |
|---|---|---|
| `withStock` | 재고 표시 | 품절 여부 |
| `withStockComponent` | 재고 컴포넌트 | 표시 제어 |
| `withShareButton` | 공유 버튼 | 링크 복사 |
| `withBackButton` | 뒤로가기 | history.back() |
| `withDiscountWarning` | 할인 경고 | 조건부 텍스트 |
| `withGuaranteedReturnWarning` | 미리보상 경고 | 조건부 표시 |
| `withGuaranteedReturnComponent` | 미리보상 토글 | 체크박스 |
| `withPreorderVisibleSection` | 사전예약 섹션 | 표시 |
| `withPreorderInVisibleSection` | 사전예약 섹션 | 숨김 |
| `withDetailSection` | 상세 설명 섹션 | 접기/펼치기 |
| `withHiddenDetailSection` | 숨겨진 상세 | 조건부 표시 |
| `withReadMoreButton` | 더보기 버튼 | 토글 |
| `withDetailCategoryButton` | 카테고리 버튼 | 이동 |
| `GoToCategory` | 카테고리 이동 | Override (HOC 아님) |
| `withReviewCard` | 리뷰 카드 | 별점 데이터 |
| `withConditionalText` | 조건부 텍스트 | 모델별 분기 |
| `withConditionalSubText` | 조건부 서브텍스트 | 모델별 분기 |
| `withApplianceText` | 가전구독 텍스트 | 초이스 관련 |
| `withYoutubePremiumCondition` | 유튜브 프리미엄 조건 | 표시 여부 |
| `withDepositMessage` | 입금 메시지 | S26 전용 |

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
| Font | Pretendard | 전체 |
| Border Radius (카드) | `10.526px` | 라디오 선택 카드 |
| Border Radius (버튼) | `8px` | 일반 버튼 |
| Button Height | `43px` (CTA) / `32px` (소형) | — |
