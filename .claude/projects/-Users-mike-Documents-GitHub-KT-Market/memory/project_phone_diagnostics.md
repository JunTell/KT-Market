---
name: Phone page diagnostics
description: Microsoft Clarity 기반 /phone 페이지 UX/CRO/성능 진단 결과 — Dead click 9%, iPhone 상세 이탈률 83~94%, CWV 미달
type: project
---

2026-04-20 Microsoft Clarity 실측 기반 /phone 페이지 진단 완료.

**Why:** Instagram 광고 모바일 유입(89.5%)에서 iPhone 17/Pro 상세 이탈률이 82.9~93.5%로 커머스 벤치마크(60~75%) 현저히 상회. Dead click 9.04%가 주된 UX 원인 신호.

**How to apply:**
- Phase 1 Quick Win: 비시맨틱 DIV→button/a 전환, iPhone 상세 CTA 스티키 고정, 색상 스와치 가격 실시간 반영, 이미지 WebP+lazy-loading, IG 인앱 안내 배너
- Phase 2: CORS 정상화+Sentry, INP/CLS 개선, 필터/정렬 UX
- Phase 3: Framer 커머스 컴포넌트화, 모바일 고정 하단 CTA 바
- 핵심 KPI: Dead click <5%, Quick back <5%, iPhone 상세 이탈률 <70%, LCP <2.5s, INP <200ms, CLS <0.10
