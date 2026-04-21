# framer/home — 홈 페이지 컴포넌트 가이드

홈 페이지 히어로 + 빠른 견적 플로우 (2026-04-21 신규)

---

## 컴포넌트 배포 순서

Framer에서 `/` 홈 페이지에 아래 두 컴포넌트를 **같은 페이지**에 배치합니다.

### Step 1 — `HomeHero.tsx`

Framer 코드 에디터에서 새 파일로 생성. 페이지 상단 히어로 영역에 배치.

**Property Controls**
| 키 | 타입 | 기본값 |
|---|---|---|
| `title` | String (textArea) | `KT 공식대리점 온라인몰\nKT마켓에서만 가능한 가격을 만나보세요` |
| `subtitle` | String | `상담부터 개통까지, 단 한 번의 클릭으로` |
| `ctaLabel` | String | `빠른 견적받아보기` |
| `ctaColor` | Color | `#0066FF` (KT 블루) |

### Step 2 — `QuickQuoteFlow.tsx`

Framer 코드 에디터에서 새 파일로 생성. **같은 페이지의 임의 위치에 배치** (바텀시트 오버레이라 렌더 위치 무관).

**Property Controls**
| 키 | 타입 | 기본값 |
|---|---|---|
| `apiUrl` | String | `https://kt-market-puce.vercel.app` |
| `primaryColor` | Color | `#0066FF` |

### Step 3 — `AuthHeaderLink.tsx`

헤더 또는 드로어 메뉴 안에 배치하는 로그인 상태별 링크.

- **비로그인**: "로그인 / 회원가입" → 클릭 시 카카오 로그인 시작
- **로그인**: "마이페이지" → 클릭 시 `/mypage` 이동

배치 위치 추천: 드로어(카테고리 메뉴) 최상단 또는 헤더 햄버거 아이콘 왼쪽.

**Property Controls**
| 키 | 타입 | 기본값 |
|---|---|---|
| `loggedOutLabel` | String | `로그인 / 회원가입` |
| `loggedInLabel` | String | `마이페이지` |
| `textColor` | Color | `#24292E` |
| `fontSize` | Number | `15` |
| `fontWeight` | Enum | `600` (Semibold) |

의존: `https://framer.com/m/AuthStore-jiikDX.js` (Framer에서 자동 로드)

---

## 동작 원리

`HomeHero`의 CTA 클릭 → `window.dispatchEvent(new CustomEvent('ktmarket:open-quick-quote'))` → `QuickQuoteFlow`가 리스너로 수신 → 바텀시트 오픈.

두 컴포넌트가 다른 페이지에 있으면 동작하지 않습니다.

---

## 빠른 견적 플로우

```
Step 1. 기종 선택   (갤럭시/아이폰/키즈폰 탭 + 그리드)
  ↓
Step 2. 용량 선택   (선택한 기종의 capacities[])
  ↓
Step 3. 가입유형    (번호이동 / 기기변경)
  ↓
확인 모달          (신청 전 안내 4개 항목)
  ↓
Step 4. 정보 입력   (이름 + 전화번호 + 생년월일 + 개인정보 동의)
  ↓
Step 5. 완료 화면   (상담 접수 확인 + 닫기)
```

### 하단 공통 버튼
- **"일단 둘러볼게요"** → `window.location.href = '/phone'` (기종 목록 페이지)
- **"다음" / "상담 신청하기"** — 각 단계 완료 시 활성화

---

## 의존 API

| 엔드포인트 | 용도 |
|---|---|
| `GET /api/compare/devices` | Step 1 기종 그리드 (company, category, capacities 포함) |
| `POST /api/consultations/quick-quote` | Step 4 상담 신청 제출 |

### 제출 payload
```json
{
  "model": "SM-F766U",
  "petName": "갤럭시 Z플립7",
  "device": "smartphone",
  "capacity": "256GB",
  "register": "번호이동",
  "name": "김유플",
  "phone": "01012345678",
  "birthday": "901129"
}
```

### 성공 응답
```json
{ "ok": true, "id": 123 }
```

### 실패 응답
```json
{ "ok": false, "error": "전화번호 형식 오류" }
```

---

## DB 저장 위치

`customer_consultations` 테이블에 `carrier='KT'`, `is_consultation=true`, `is_processed=false`로 저장.  
로그인된 사용자면 `profile_id` 자동 연결, 비로그인은 null.

---

## 디자인 토큰

```
배경:       #FAF9F5 (크림)
카드:       #F5F1EB (연크림)
선택 카드:   #EFF6FF (연블루)
CTA:        #0066FF (KT 블루)
진행바:     #E6F0FF (연블루 트랙) + #0066FF (바)
주 텍스트:   #24292E
보조 텍스트: #3F4750
뮤트:       #868E96
성공:       #22C55E
에러:       #EF4444
```

폰트: `"Pretendard Variable", "Pretendard", sans-serif`

---

## 수동 QA 체크리스트

- [ ] 홈 히어로가 크림 배경 + KT 블루 CTA로 표시됨
- [ ] "빠른 견적받아보기" 클릭 시 바텀시트 오픈
- [ ] Step 1: 탭 전환, 기종 카드 선택 시 블루 보더
- [ ] Step 2: 선택한 기종의 용량 리스트, 용량 없는 기종은 Step 3 자동 이동
- [ ] Step 3: 번호이동/기기변경 선택 → "다음" 클릭 시 확인 모달
- [ ] 확인 모달: 4개 안내 + "네, 확인했습니다." → Step 4
- [ ] Step 4: 이름 2자+, 전화번호(하이픈 자동), 생년월일 6자리 입력 → "상담 신청하기" 활성
- [ ] 동의 해제 시 "상담 신청하기" 비활성
- [ ] 제출 성공 → Step 5 완료 화면 + Supabase 레코드 확인
- [ ] "확인" 클릭 → 시트 닫힘
- [ ] "일단 둘러볼게요" → `/phone` 이동
- [ ] 모바일(375px) + 데스크탑(1024px) 모두 정상

---

## 향후 확장 여지

- 키즈폰 카탈로그 데이터 확보 시 Step 1 세그먼트 활성화
- 상담 신청 완료 후 카카오 채널 추가 유도 모달
- 요금제·사은품 선택 단계 추가
- 제출 시 관리자 Slack/Webhook 알림
