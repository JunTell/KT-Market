# KT마켓 Framer 컴포넌트 타이포그래피 가이드

CSS 토큰 기준으로 정립한 타이포 표준입니다.
모든 `framer/phone/*` 컴포넌트는 이 규칙을 따릅니다.

---

## 폰트 패밀리

```ts
const FONT = '"Pretendard Variable", "Pretendard", sans-serif'
```

모든 컴포넌트 최상위 `style`에 `fontFamily: FONT` 적용.
개별 텍스트 요소에도 `fontFamily: FONT` 명시 (Framer 환경에서 상속이 보장되지 않음).

---

## 색상 토큰

`gray` 팔레트 기준 (Mantine 기반):

| 역할 | 값 | 사용 예 |
|------|-----|--------|
| **Primary text** | `#24292E` | 본문, 제목, 가격 |
| **Secondary text** | `#3F4750` | 서브 레이블, 보조 설명 |
| **Muted text** | `#868E96` | 비활성, 힌트, 구분자 |
| **Disabled / placeholder** | `#ADB5BD` | 비활성 상태 |
| **Brand blue** | `#0066FF` | 강조, 링크, CTA |
| **Error / danger** | `#EF4444` | 경고, 오류 |

---

## letterSpacing (tracking) 규칙

CSS 토큰에서 역산한 값. **단위: px (숫자)**

> Tailwind `tracking-[-0.24px]` → 인라인 스타일 `letterSpacing: -0.24`

| fontSize | letterSpacing | 근거 |
|----------|--------------|------|
| 11 | `-0.16` | `≈ -0.015em` |
| 12 | `-0.24` | `≈ -0.02em` |
| 13 | `-0.24` | `≈ -0.0185em` |
| 14 | `-0.24` | `≈ -0.017em` |
| 15 | `-0.3` | `≈ -0.02em` |
| 16 | `-0.3` | `≈ -0.019em` |
| 17 | `-0.34` | `≈ -0.02em` |
| 18 | `-0.36` | `≈ -0.02em` |
| 20 | `-0.4` | `≈ -0.02em` |
| 21 | `-0.42` | `≈ -0.02em` |
| 22 | `-0.44` | `≈ -0.02em` |
| 24+ | `-0.5` | 대형 가격·헤딩 |
| 28 | `-1` | 최대 크기 가격 |

**예외 — 버튼 내 텍스트:** Figma 스펙 기준 양수 tracking 사용
→ `ConsultationBar`, `ShareCard` 버튼: `letterSpacing: 0.08`

---

## lineHeight (leading) 규칙

> Tailwind `leading-[1.6]` → 인라인 스타일 `lineHeight: 1.6`

| 용도 | lineHeight | 적용 fontSize |
|------|-----------|--------------|
| 대형 가격·숫자 | `1.1` | 28+ |
| 헤딩·가격 | `1.2` | 21–27 |
| 소제목 | `1.3` | 18–20 |
| 섹션 타이틀 | `1.4` | 14–17 |
| 본문·설명 | `1.5` | 12–14 |
| 긴 본문·공지 | `1.6` | 12–14 (여러 줄) |
| 뱃지·단일행 | `1` or `1.2` | 버튼, 숫자 배지 |

**기준:**
`leading-normal: 1.5`, `leading-relaxed: 1.625`
- 한국어 가독성: 본문 최소 `1.5`, 긴 안내문 `1.6` 권장

---

## wordBreak 규칙

```ts
wordBreak: "keep-all"
```

**적용 조건:**
- 한글 본문/설명 텍스트 (2어절 이상)
- `fontSize: 12–16`인 `<p>`, `<span>`, `<div>` 내 한글 텍스트
- `whiteSpace: "pre-line"` 사용 시 항상 추가

**스킵 조건:**
- 가격·숫자 (줄바꿈 불필요)
- 단일 문자 (불릿 `·`, 구분자 `|`, 이모지)
- 버튼 텍스트 (1–3어절, `whiteSpace: "nowrap"` 사용)

---

## 전체 인라인 스타일 패턴

### 대형 가격 (예: 월 예상 금액)
```ts
{
  fontSize: 22,
  fontWeight: 800,
  lineHeight: 1.2,
  letterSpacing: -0.44,
  fontVariantNumeric: "tabular-nums",
  fontFamily: FONT,
}
```

### 섹션 타이틀
```ts
{
  fontSize: 17,
  fontWeight: 700,
  lineHeight: 1.4,
  letterSpacing: -0.34,
  color: "#24292E",
  fontFamily: FONT,
}
```

### 카드 소제목 (파란 강조)
```ts
{
  fontSize: 14,
  fontWeight: 700,
  lineHeight: 1.4,
  letterSpacing: -0.24,
  color: "#0066FF",
  wordBreak: "keep-all",
  fontFamily: FONT,
}
```

### 본문 설명
```ts
{
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1.5,
  letterSpacing: -0.24,
  color: "#24292E",
  wordBreak: "keep-all",
  fontFamily: FONT,
}
```

### 보조 레이블 (muted)
```ts
{
  fontSize: 12,
  fontWeight: 500,
  lineHeight: 1.5,
  letterSpacing: -0.24,
  color: "#868E96",
  fontFamily: FONT,
}
```

### 긴 안내문 / 공지
```ts
{
  fontSize: 12,
  fontWeight: 400,
  lineHeight: 1.6,
  letterSpacing: -0.24,
  color: "#3F4750",
  wordBreak: "keep-all",
  whiteSpace: "pre-line",
  fontFamily: FONT,
}
```

### 버튼 텍스트 (primary CTA)
```ts
{
  fontSize: 17,
  fontWeight: 700,
  lineHeight: 1,
  letterSpacing: -0.3,
  color: "#FFFFFF",
  fontFamily: FONT,
}
```

### 버튼 텍스트 (secondary / outline)
```ts
{
  fontSize: 13,
  fontWeight: 500,
  lineHeight: 1.5,
  letterSpacing: 0.08,   // Figma 스펙 — 버튼은 양수 tracking
  color: "#24292E",
  whiteSpace: "nowrap",
  fontFamily: FONT,
}
```

---

## 장식 문자 — letterSpacing 스킵 대상

다음은 letterSpacing 적용하지 않음:

| 예시 | 이유 |
|------|------|
| `+` `-` `−` (fontSize 24+) | 단일 연산 기호 |
| `·` `\|` 구분자 | 단일 장식 문자 |
| `!` `i` (뱃지 원 안) | 단일 장식 문자 |
| 🔍 이모지 | 이모지 |
| SVG `<text>` 요소 | SVG 컨텍스트 |
| Chakra UI `fontSize="12px"` prop | JSX prop, inline style 아님 |

---

## 체크리스트 (새 컴포넌트 작성 시)

- [ ] `const FONT = '"Pretendard Variable", "Pretendard", sans-serif'` 선언
- [ ] 모든 text 요소에 `fontSize` + `fontWeight` + `letterSpacing` + `lineHeight` 4개 세트
- [ ] 한글 본문에 `wordBreak: "keep-all"`
- [ ] 색상은 `#24292E` / `#3F4750` / `#868E96` 토큰 사용
- [ ] 버튼 텍스트는 `whiteSpace: "nowrap"`
- [ ] 가격 숫자는 `fontVariantNumeric: "tabular-nums"`
