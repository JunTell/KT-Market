# Event 페이지 컴포넌트 가이드

이벤트 페이지 컴포넌트 작성 시 반복되는 패턴과 규칙을 정리합니다.

---

## 레이아웃

```tsx
// 모든 이벤트 섹션의 최상위 컨테이너
{
    width: "100%",
    maxWidth: 440,
    minWidth: 360,
    margin: "0 auto",
    boxSizing: "border-box",
    fontFamily: FONT,
}
```

- 최대 440px, 최소 360px, 센터 정렬
- 섹션 내부 패딩: `padding: "30px 16px"` 또는 `"24px 20px"`

---

## 폰트

```tsx
const FONT = '"Pretendard", "Inter", sans-serif'
```

숫자 전용(카운트업 등):
```tsx
const FONT_REDDIT = '"Reddit Sans", sans-serif'
```

---

## 색상 팔레트

| 용도 | 색상 |
|------|------|
| 브랜드 블루 | `#0066FF` 또는 `#2A86FF` |
| 강조 하이라이트 | `#D5F85D` (형광 옐로그린) |
| 텍스트 블랙 | `#000` 또는 `#111827` |
| 텍스트 그레이 | `#4B5563` / `#868E96` / `#9CA3AF` |
| 카드 배경 | `#FFF` 또는 `#F4F5F7` |
| 섹션 배경 | `#F8F9FA` / `linear-gradient(180deg, #F8F8F8 0%, #F2F2F2 100%)` |

---

## 모션 (framer-motion)

### 공통 임포트
```tsx
import { motion } from "framer-motion"
```

### fadeUp — 기본 등장 모션
```tsx
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
}
```

### staggerWrap — 자식 순차 등장
```tsx
const staggerWrap = {
    hidden: {},
    visible: {
        transition: { staggerChildren: 0.1, delayChildren: 0.12 },
    },
}
```

### cardMotion — 카드 등장 (scale 포함)
```tsx
const cardMotion = {
    hidden: { opacity: 0, y: 20, scale: 0.985 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
}
```

### 사용 패턴
```tsx
<motion.div
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-40px" }}
    variants={staggerWrap}
>
    {items.map((item, i) => (
        <motion.div key={i} variants={fadeUp}>
            {/* 콘텐츠 */}
        </motion.div>
    ))}
</motion.div>
```

- `viewport.once: true` — 한 번만 재생
- `viewport.margin: "-30px"~"-40px"` — 뷰포트 진입 전 약간 일찍 트리거
- ease: `[0.22, 1, 0.36, 1]` (출시 이지) 또는 `"easeOut"`

### 강조 요소 반복 모션 (펄스/쉐이크)
```tsx
// 확성기, featured 카드 등
animate={{
    scale: [1, 1.03, 1],
    y: [0, -3, 0],
}}
transition={{
    duration: 2,
    repeat: Infinity,
    repeatDelay: 1,
    ease: "easeInOut",
}}
```

---

## Framer 어노테이션

```tsx
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 */
```

- `layoutWidth: fixed` — 이벤트 페이지는 고정 너비 기반 (내부에서 max/min으로 반응형)
- `layoutHeight: auto` — 콘텐츠 높이에 따라 자동
- `intrinsicWidth: 390` — Framer 에디터 기본 너비

---

## Property Controls 규칙

- 모든 텍스트 prop에 `defaultValue` 필수
- 여러 줄 텍스트: `displayTextArea: true`
- 이미지: `ControlType.Image`
- 조건부 노출: `hidden: (props) => !props.showXxx`
- prop 이름: camelCase, 그룹화 시 접두사 사용 (`card1Title`, `card2Title`, ...)

---

## 타이틀 스타일 패턴

강조 형광 밑줄:
```tsx
<span style={{
    fontWeight: 800,
    color: "#2A86FF",
    backgroundImage: "linear-gradient(transparent 60%, #D5F85D 60%)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
}}>
    {highlightText}
</span>
```

2줄 타이틀 (일반 + 강조):
```tsx
<div style={{ textAlign: "center" }}>
    <div style={{ fontSize: 28, fontWeight: 700, color: "#000" }}>{line1}</div>
    <span style={{ fontSize: 32, fontWeight: 800, color: "#2A86FF" }}>{line2}</span>
</div>
```

---

## 파일 구조

```
framer/event/
├── preorder/              ← 전모델 사전예약 이벤트
│   ├── EventMainBanner.tsx
│   ├── PreorderForm.tsx
│   ├── PreorderHubPage.tsx
│   ├── PreorderLoadmapEventPage.tsx
│   ├── UpcomingModels.tsx
│   └── WhyPreorder.tsx
├── WhyKTMarketCard.tsx    ← 공통 이벤트 컴포넌트
└── EVENT_GUIDE.md         ← 이 파일
```

이벤트별 폴더를 만들어 관리합니다 (예: `preorder/`, `summer-sale/`, ...).
공통으로 사용하는 컴포넌트는 `framer/event/` 루트에 배치합니다.
