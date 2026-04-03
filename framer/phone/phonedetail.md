너는 Framer 환경의 React/TypeScript 전문가야.
현재 휴대폰 상세 페이지(e-commerce)의 코드 컴포넌트와 Override(HOC) 코드를 리팩토링해야 해.

[현재 문제점]
용량 선택 버튼(예: 256GB -> 512GB)을 클릭하면 a 태그의 href로 인해 페이지가 하드 리로딩되면서 화면이 깜빡이고 UX가 저하됨. (예: /phone/sm-s948nk 에서 /phone/sm-s948nk512 로 이동 시)

[목표]
하드 리로딩을 제거하고 SPA(Single Page Application) 방식으로 동작하도록 전역 상태(Store)와 Code Component, Override 코드를 전면 수정해줘. 데이터를 다시 불러오는 동안 부드러운 Skeleton UI가 표시되어야 해.

[디자인 토큰]
- 색상: Primary #0055FF, Sec #E5E7EB, Bg #FFFFFF, Text #111827
- 폰트: 12px
- 여백: gap 8px / 모서리(borderRadius): 8px / 버튼 높이: 32px

[주문 플로우]
페이지 이동 구조는 아래 순서를 따른다:

1. /phone/[model] — 휴대폰 상세 페이지 (BottomSheetOrderSheetComponent)
   - "카카오로 10초 간편 주문" 버튼:
     - 로그인 O → /phone/userinfo 로 이동
     - 로그인 X → /api/auth/kakao?redirect=/phone/user-info 로 이동 (카카오 로그인 후 /phone/user-info 로 리다이렉트)
   - "주문하기" 버튼:
     - 로그인 여부 상관없이 → /phone/user-info 로 이동

2. /phone/user-info — 사용자 정보 입력 페이지 (UserInfoForm.tsx)
   - 이름, 생년월일, 연락처 입력
   - 완료 시 → nextPageUrl prop에 지정된 페이지로 이동 (기본: /phone/application-gate)

3. /phone/application-gate — 주문 방식 선택 페이지 (ApplicationGatePage.tsx)
   - 주문 채널 선택 (카카오톡, 전화, 직접 신청서 등)
   - 완료 시 → /phone/application-confirm 으로 이동

4. /phone/application-confirm — 주문 접수 완료 페이지 (ApplicationConfirmPage.tsx)
   - 최종 주문 접수 확인 화면

[작업 지시 사항]
1. 전역 Store (framer/store.js 기반) 업데이트
- `currentModelId`: string | null (현재 표시 중인 모델 ID, URL path 대체용)
- `isLoading`: boolean (초기값 true, 스켈레톤 노출용)

2. Code Component 수정 (`PhoneCapacitySectionComponent.tsx`)
- 기존 a 태그를 `framer-motion`의 `motion.div`로 변경해.
- `props.isLoading`이 true일 때, 기본 2개 이상의 펄스 애니메이션(animate={{ opacity: [0.4, 1, 0.4] }})이 적용된 회색 스켈레톤 버튼을 렌더링해.
- `props.currentModelId`와 버튼의 path가 일치하면 active 상태로 렌더링(파란색 테두리 및 라디오 버튼 UI).
- `onClick` 이벤트 발생 시 `props.onCapacitySelect(path)`를 호출해.

3. Override HOC 수정 (`Overrides.tsx`)
- `withCapacity`:
  - store의 device.capacities를 프레이머 속성에 맞게 매핑.
  - `handleCapacitySelect(path)` 함수를 만들어 Code Component로 전달.
  - 이 함수 내부에서는 `window.history.pushState({}, "", "/phone/" + path)`를 통해 URL을 조용히 변경하고, `setStore({ currentModelId: path })`를 호출해.
- `withPhoneDetail`:
  - `window.location.pathname` 의존성을 제거하고 `store.currentModelId`를 기준(fallback으로 기존 path 파싱)으로 동작하게 해.
  - `store.currentModelId`가 변경될 때마다(useEffect 의존성 배열에 추가) Supabase에서 데이터를 재호출(fetch)해.
  - 데이터를 불러오기 직전 `setStore({ isLoading: true })`를 호출하고, finally 구문에서 `setStore({ isLoading: false })`를 호출해 스켈레톤 UI와 연동되게 만들어.
  - 기존에 있던 단종 모델 팝업(discontinuedInfo) 로직도 `currentModelId` 기준으로 동작하도록 매핑해.

서론/결론 없이 즉시 적용 가능한 완성된 TypeScript 코드만 출력해.
