# framer/event - 이벤트 메인 배너 구현 가이드

참고 Figma: `KT마켓 준텔레콤`, node-id `1535:3525`

이 문서는 Framer 코드 컴포넌트로 이벤트 페이지의 메인 배너를 구현할 때 바로 적용할 수 있는 기준과 예제 코드를 정리한 문서다.
목표는 다음 3가지다.

1. 모바일 우선으로 자연스럽게 확장되는 반응형 레이아웃
2. 메인 카피, 혜택 카드, 로드맵 카드가 분리된 모션 타이밍
3. Framer 캔버스에서 바로 붙여 넣어 테스트할 수 있는 코드 컴포넌트

---

## 1. 메인 배너 구조

이벤트 페이지 메인 배너는 아래 4개 층으로 나누면 가장 관리가 쉽다.

```text
Hero Wrapper
├── Background Layer
│   ├── gradient
│   ├── radial glow
│   └── floating shape
├── Copy Layer
│   ├── eyebrow
│   ├── title
│   ├── description
│   └── CTA
├── Benefit Layer
│   ├── 핵심 혜택 카드 2~3개
│   └── 보조 설명
└── Roadmap Layer
    ├── step badge
    ├── title
    └── timeline card list
```

핵심은 배너 전체를 한 장의 이미지처럼 만들지 않는 것이다.
텍스트, 카드, 배경 장식을 모두 개별 레이어로 분리해야 반응형과 모션을 같이 가져갈 수 있다.

---

## 2. 반응형 잡는 방법

Framer 코드 컴포넌트에서는 `window.innerWidth` 기반으로 직접 breakpoint를 나누는 방식이 가장 단순하다.

권장 기준:

- `mobile`: 0 ~ 767px
- `tablet`: 768 ~ 1023px
- `desktop`: 1024px 이상

반응형에서 실제로 바뀌어야 하는 값은 아래만 잡으면 충분하다.

- 배너 최소 높이
- 좌우 padding
- title font size
- 카드 그리드 column 수
- roadmap 카드 방향

권장 규칙:

- 모바일: 1열, 강한 세로 리듬, 큰 타이포
- 태블릿: 2열 혼합, copy와 카드 간격 확대
- 데스크탑: copy와 visual 분리, 카드 3열 가능

예시 기준:

```ts
const isMobile = width < 768
const isTablet = width >= 768 && width < 1024
const heroMinHeight = isMobile ? 820 : isTablet ? 900 : 760
const horizontalPadding = isMobile ? 20 : isTablet ? 32 : 48
const titleSize = isMobile ? 42 : isTablet ? 56 : 72
const roadmapColumns = isMobile ? 1 : isTablet ? 2 : 3
```

이미지 대신 배경 도형을 쓸 때는 `position: absolute`와 `overflow: hidden`을 같이 써야 한다.
그래야 모바일에서 glow나 circle이 삐져나가도 레이아웃이 깨지지 않는다.

---

## 3. 로드맵별 모션 넣는 방법

로드맵은 한 번에 다 튀어나오게 하지 말고 층별로 나눠야 한다.

권장 순서:

1. 배너 배경이 먼저 천천히 fade-in
2. eyebrow, title, description이 위로 떠오르듯 등장
3. CTA와 혜택 카드가 0.08~0.12초 간격으로 stagger
4. roadmap title 이후 step 카드들이 좌우 또는 아래에서 순차 등장
5. 장식 도형은 계속 미세하게 floating

실무적으로는 아래 3종만 있으면 충분하다.

### A. 텍스트 기본 등장

```ts
const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
}
```

### B. 카드 stagger

```ts
const staggerWrap = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.15,
        },
    },
}
```

### C. 카드 개별 진입

```ts
const cardMotion = {
    hidden: { opacity: 0, y: 24, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
}
```

로드맵이 "1단계 -> 2단계 -> 3단계" 구조라면 카드마다 delay를 직접 주기보다 부모에 `staggerChildren`을 주는 편이 수정이 쉽다.

---

## 4. 추천 구현 순서

1. 텍스트만 먼저 배치한다.
2. 그 다음 혜택 카드와 roadmap 카드를 정적 레이아웃으로 맞춘다.
3. 이후 배경 도형을 넣는다.
4. 마지막에 motion을 넣는다.

처음부터 motion까지 같이 짜면 spacing 디버깅이 오래 걸린다.

---

## 5. 바로 쓸 수 있는 예제 코드

아래 코드는 Framer 코드 컴포넌트 예제다.
파일명 예시는 `EventMainBanner.tsx`다.

```tsx
import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion } from "framer-motion"

type RoadmapItem = {
    step: string
    title: string
    description: string
}

type BenefitItem = {
    title: string
    value: string
}

type Props = {
    eyebrow: string
    title: string
    description: string
    primaryCta: string
    secondaryText: string
}

function useViewportWidth() {
    const [width, setWidth] = React.useState(
        typeof window !== "undefined" ? window.innerWidth : 390
    )

    React.useEffect(() => {
        if (typeof window === "undefined") return
        const onResize = () => setWidth(window.innerWidth)
        window.addEventListener("resize", onResize)
        return () => window.removeEventListener("resize", onResize)
    }, [])

    return width
}

const benefitItems: BenefitItem[] = [
    { title: "즉시 할인", value: "최대 52만원" },
    { title: "추가 혜택", value: "사은품 3종" },
    { title: "개통 지원", value: "당일 상담 연결" },
]

const roadmapItems: RoadmapItem[] = [
    {
        step: "STEP 01",
        title: "이벤트 모델 선택",
        description: "행사 대상 기종과 컬러, 용량을 먼저 고릅니다.",
    },
    {
        step: "STEP 02",
        title: "혜택 조건 확인",
        description: "요금제, 할인 방식, 추가 혜택 조건을 비교합니다.",
    },
    {
        step: "STEP 03",
        title: "상담 및 신청 완료",
        description: "신청 후 빠르게 상담 연결과 개통 절차를 진행합니다.",
    },
]

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
}

const staggerWrap = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.12,
        },
    },
}

const cardMotion = {
    hidden: { opacity: 0, y: 24, scale: 0.98 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
}

export default function EventMainBanner(props: Props) {
    const width = useViewportWidth()
    const isMobile = width < 768
    const isTablet = width >= 768 && width < 1024

    const heroMinHeight = isMobile ? 860 : isTablet ? 960 : 780
    const horizontalPadding = isMobile ? 20 : isTablet ? 32 : 48
    const titleSize = isMobile ? 42 : isTablet ? 58 : 72
    const descSize = isMobile ? 15 : 17
    const contentMaxWidth = isMobile ? "100%" : 1160
    const roadmapColumns = isMobile ? 1 : isTablet ? 2 : 3

    return (
        <section
            style={{
                position: "relative",
                width: "100%",
                minHeight: heroMinHeight,
                overflow: "hidden",
                background:
                    "linear-gradient(180deg, #08101F 0%, #0A1832 45%, #F4F7FB 100%)",
            }}
        >
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    overflow: "hidden",
                    pointerEvents: "none",
                }}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 0.9, scale: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    style={{
                        position: "absolute",
                        top: -120,
                        right: isMobile ? -120 : -40,
                        width: isMobile ? 280 : 420,
                        height: isMobile ? 280 : 420,
                        borderRadius: "50%",
                        background:
                            "radial-gradient(circle, rgba(0,102,255,0.45) 0%, rgba(0,102,255,0) 72%)",
                    }}
                />

                <motion.div
                    animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                        position: "absolute",
                        top: isMobile ? 360 : 220,
                        left: isMobile ? -36 : 40,
                        width: isMobile ? 120 : 160,
                        height: isMobile ? 120 : 160,
                        borderRadius: 32,
                        background:
                            "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.03))",
                        border: "1px solid rgba(255,255,255,0.15)",
                        backdropFilter: "blur(10px)",
                    }}
                />
            </div>

            <div
                style={{
                    position: "relative",
                    zIndex: 1,
                    maxWidth: contentMaxWidth,
                    margin: "0 auto",
                    padding: `40px ${horizontalPadding}px 72px`,
                    boxSizing: "border-box",
                }}
            >
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerWrap}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: isMobile ? 24 : 32,
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: isMobile ? "1fr" : "minmax(0, 1.05fr) minmax(360px, 0.95fr)",
                            gap: isMobile ? 28 : 24,
                            alignItems: "end",
                        }}
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                            <motion.div
                                variants={fadeUp}
                                style={{
                                    display: "inline-flex",
                                    alignSelf: "flex-start",
                                    padding: "10px 14px",
                                    borderRadius: 999,
                                    background: "rgba(255,255,255,0.1)",
                                    border: "1px solid rgba(255,255,255,0.16)",
                                    color: "#DCE7FF",
                                    fontSize: 12,
                                    fontWeight: 700,
                                    letterSpacing: "0.08em",
                                }}
                            >
                                {props.eyebrow}
                            </motion.div>

                            <motion.h1
                                variants={fadeUp}
                                style={{
                                    margin: 0,
                                    color: "#FFFFFF",
                                    fontSize: titleSize,
                                    lineHeight: 1.02,
                                    fontWeight: 800,
                                    letterSpacing: "-0.04em",
                                    whiteSpace: "pre-line",
                                }}
                            >
                                {props.title}
                            </motion.h1>

                            <motion.p
                                variants={fadeUp}
                                style={{
                                    margin: 0,
                                    maxWidth: 620,
                                    color: "rgba(255,255,255,0.8)",
                                    fontSize: descSize,
                                    lineHeight: 1.6,
                                }}
                            >
                                {props.description}
                            </motion.p>

                            <motion.div
                                variants={fadeUp}
                                style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: 12,
                                    alignItems: "center",
                                }}
                            >
                                <button
                                    style={{
                                        height: 54,
                                        padding: "0 22px",
                                        border: "none",
                                        borderRadius: 999,
                                        background: "#FFFFFF",
                                        color: "#0B3FD9",
                                        fontSize: 16,
                                        fontWeight: 800,
                                        cursor: "pointer",
                                    }}
                                >
                                    {props.primaryCta}
                                </button>
                                <span
                                    style={{
                                        color: "rgba(255,255,255,0.68)",
                                        fontSize: 14,
                                        fontWeight: 500,
                                    }}
                                >
                                    {props.secondaryText}
                                </span>
                            </motion.div>
                        </div>

                        <motion.div
                            variants={staggerWrap}
                            style={{
                                display: "grid",
                                gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))",
                                gap: 12,
                            }}
                        >
                            {benefitItems.map((item) => (
                                <motion.div
                                    key={item.title}
                                    variants={cardMotion}
                                    style={{
                                        minHeight: 132,
                                        padding: 18,
                                        borderRadius: 22,
                                        background:
                                            "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08))",
                                        border: "1px solid rgba(255,255,255,0.14)",
                                        backdropFilter: "blur(14px)",
                                        boxSizing: "border-box",
                                    }}
                                >
                                    <div
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: "rgba(255,255,255,0.62)",
                                            marginBottom: 10,
                                        }}
                                    >
                                        {item.title}
                                    </div>
                                    <div
                                        style={{
                                            fontSize: isMobile ? 24 : 28,
                                            lineHeight: 1.1,
                                            fontWeight: 800,
                                            color: "#FFFFFF",
                                            letterSpacing: "-0.04em",
                                        }}
                                    >
                                        {item.value}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    <motion.div
                        variants={staggerWrap}
                        style={{
                            background: "#FFFFFF",
                            borderRadius: isMobile ? 24 : 32,
                            padding: isMobile ? 22 : 28,
                            boxShadow: "0 24px 80px rgba(5, 23, 64, 0.12)",
                        }}
                    >
                        <motion.div variants={fadeUp} style={{ marginBottom: 18 }}>
                            <div
                                style={{
                                    fontSize: 12,
                                    fontWeight: 800,
                                    color: "#0057FF",
                                    marginBottom: 8,
                                    letterSpacing: "0.08em",
                                }}
                            >
                                EVENT ROADMAP
                            </div>
                            <div
                                style={{
                                    fontSize: isMobile ? 24 : 32,
                                    fontWeight: 800,
                                    color: "#111827",
                                    letterSpacing: "-0.04em",
                                }}
                            >
                                신청 전 흐름을 한 번에 확인하세요
                            </div>
                        </motion.div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: `repeat(${roadmapColumns}, minmax(0, 1fr))`,
                                gap: 14,
                            }}
                        >
                            {roadmapItems.map((item, index) => (
                                <motion.div
                                    key={item.step}
                                    variants={cardMotion}
                                    style={{
                                        position: "relative",
                                        minHeight: 180,
                                        padding: "20px 18px",
                                        borderRadius: 20,
                                        background: index === 0 ? "#EEF4FF" : "#F8FAFC",
                                        border: `1px solid ${index === 0 ? "#CFE0FF" : "#E5E7EB"}`,
                                        boxSizing: "border-box",
                                    }}
                                >
                                    <div
                                        style={{
                                            display: "inline-flex",
                                            padding: "8px 10px",
                                            borderRadius: 999,
                                            background: "#FFFFFF",
                                            color: "#0057FF",
                                            fontSize: 11,
                                            fontWeight: 800,
                                            marginBottom: 14,
                                        }}
                                    >
                                        {item.step}
                                    </div>

                                    <div
                                        style={{
                                            fontSize: 22,
                                            lineHeight: 1.2,
                                            fontWeight: 800,
                                            color: "#111827",
                                            marginBottom: 10,
                                            letterSpacing: "-0.03em",
                                        }}
                                    >
                                        {item.title}
                                    </div>

                                    <div
                                        style={{
                                            fontSize: 14,
                                            lineHeight: 1.6,
                                            color: "#4B5563",
                                        }}
                                    >
                                        {item.description}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}

addPropertyControls(EventMainBanner, {
    eyebrow: {
        type: ControlType.String,
        title: "Eyebrow",
        defaultValue: "KT MARKET EVENT",
    },
    title: {
        type: ControlType.String,
        title: "Title",
        defaultValue: "갤럭시/아이폰\n이벤트 혜택 총정리",
    },
    description: {
        type: ControlType.String,
        title: "Desc",
        defaultValue:
            "행사 대상 모델, 즉시 할인, 추가 사은품, 신청 흐름까지 메인 배너 하나에서 빠르게 이해할 수 있도록 구성합니다.",
    },
    primaryCta: {
        type: ControlType.String,
        title: "CTA",
        defaultValue: "혜택 확인하기",
    },
    secondaryText: {
        type: ControlType.String,
        title: "Sub Text",
        defaultValue: "행사 기간 한정 혜택",
    },
})
```

---

## 6. 실제 적용할 때 수정해야 하는 포인트

위 예제를 그대로 쓰지 말고 아래 값은 Figma에 맞춰 교체하면 된다.

- eyebrow 문구
- title 줄바꿈 위치
- 배경 gradient 색상
- 혜택 카드 개수
- roadmap 카드 수
- CTA 문구

특히 title은 `whiteSpace: "pre-line"`을 써서 줄바꿈을 직접 제어하는 편이 안전하다.

---

## 7. 모션 로드맵 운영 팁

이벤트 페이지는 섹션이 많아서 모든 구간에 강한 애니메이션을 넣으면 오히려 산만해진다.
아래처럼 강도를 나누는 게 좋다.

- Hero 첫 진입: 강하게
- 혜택 카드: 중간
- roadmap: 약하게, stagger 중심
- 하단 상품 리스트: 거의 정적

권장 duration:

- 타이틀: `0.7s`
- 카드: `0.5 ~ 0.6s`
- floating deco: `5 ~ 7s`

권장 easing:

```ts
[0.22, 1, 0.36, 1]
```

이 값이면 너무 튀지 않으면서도 이벤트 페이지답게 탄성이 느껴진다.

---

## 8. Framer에서 붙이는 방법

1. Framer에 새 코드 컴포넌트를 만든다.
2. 위 예제 코드를 `EventMainBanner.tsx`로 붙인다.
3. 캔버스에 배치한 뒤 property controls로 문구를 맞춘다.
4. 이후 혜택 카드와 roadmap 데이터를 실제 행사 내용으로 바꾼다.

필요하면 다음 단계로 바로 이어서 작업하면 된다.

- 실제 Figma 기준 spacing 수치 대입
- 카드 데이터를 props로 외부 주입 가능하게 확장
- CTA 클릭 시 특정 페이지 이동 연결
- scroll-trigger motion 추가

---

## 9. 배경에 벡터가 많을 때 넣는 방법

Figma 배경에 vector가 많으면 무조건 div 여러 개로 다시 그리면 안 된다.
기준은 아래처럼 잡는 게 안전하다.

### 1. 코드로 그려도 되는 경우

- 단순 원형 glow
- gradient blob
- 직선, 점선, grid
- 3~5개 수준의 기하 도형

이 경우는 `div + borderRadius + gradient + blur` 조합으로 구현한다.

예시:

```tsx
<div
    style={{
        position: "absolute",
        top: -80,
        right: -60,
        width: 220,
        height: 220,
        borderRadius: "50%",
        background:
            "radial-gradient(circle, rgba(0,102,255,0.45) 0%, rgba(0,102,255,0) 72%)",
    }}
/>
```

장점:

- 반응형 대응이 쉽다
- 색상 수정이 빠르다
- motion 추가가 쉽다

### 2. SVG로 분리해야 하는 경우

- 벡터 레이어가 많다
- 마스크가 들어간다
- 곡선 path가 복잡하다
- 아이콘/라인/장식이 많아서 코드로 재현하면 유지보수가 어렵다

이 경우는 Figma에서 배경만 따로 export해서 `svg` asset으로 쓰는 게 맞다.

실무 권장 순서:

1. Figma에서 배경 vector만 선택
2. `SVG`로 export
3. 저장소에 예를 들어 `public/event/preorder-hero-bg.svg` 또는 Framer asset으로 업로드
4. 코드에서는 `img` 또는 background image로 사용

예시:

```tsx
<img
    src="/event/preorder-hero-bg.svg"
    alt=""
    style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        pointerEvents: "none",
    }}
/>
```

### 3. 가장 추천하는 방식

복잡한 이벤트 배경은 보통 아래처럼 섞어서 쓴다.

- 베이스 배경: CSS gradient
- 복잡한 장식: SVG 1장
- 강조 glow: 코드로 absolute div 1~3개
- 미세한 움직임: glow나 small shape에만 motion 추가

이 방식이 제일 빠르고 수정도 쉽다.

---

## 10. SVG 배경 반응형 처리 팁

SVG 배경을 넣을 때는 아래 3가지를 먼저 정한다.

### A. 꽉 채우기 배경

```tsx
style={{
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
}}
```

배너 전체를 덮는 장식 배경일 때 쓴다.

### B. 원본 비율 유지

```tsx
style={{
    width: "100%",
    height: "auto",
    display: "block",
}}
```

배경이 아니라 독립 오브젝트처럼 보일 때 쓴다.

### C. 특정 위치 고정

```tsx
style={{
    position: "absolute",
    top: 0,
    right: 0,
    width: 260,
    height: "auto",
}}
```

오른쪽 상단 장식처럼 한쪽에 붙는 벡터에 적합하다.

---

## 11. SVG 자체에 motion 넣는 방법

벡터 배경 전체에 강한 motion을 주면 오히려 촌스러워진다.
보통은 아래 정도만 넣는다.

- opacity 미세 변화
- y축 8~16px 부유
- rotate 2~4도

예시:

```tsx
<motion.img
    src="/event/preorder-hero-bg.svg"
    alt=""
    animate={{ y: [0, -10, 0], opacity: [0.92, 1, 0.92] }}
    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        pointerEvents: "none",
    }}
/>
```

---

## 12. 판단 기준 한 줄 정리

- 단순 도형이면 코드
- 복잡한 vector면 SVG export
- 가장 좋은 결과는 `gradient + SVG + 소수의 motion div` 조합
