// framer/event/PreorderHubPage.tsx
// 사전예약 모음 페이지 — Framer URL: /event

import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

const FONT = '"Pretendard", "Inter", sans-serif'

// ─── 타입 ─────────────────────────────────────────────────────────────
type PreorderItem = {
    image: string
    modelName: string       // 표시명 (예: 갤럭시 S26 울트라)
    badge: string           // 배지 텍스트 (예: 사전예약 중 / D-3 / 출시 예정)
    badgeColor: string      // 배지 배경색
    description: string     // 한 줄 설명
    ctaText: string         // 버튼 텍스트
    ctaLink: string
}

// ─── 기본 더미 데이터 ──────────────────────────────────────────────────
const DEFAULT_ITEMS: PreorderItem[] = [
    {
        image: "",
        modelName: "갤럭시 S26 울트라",
        badge: "사전예약 중",
        badgeColor: "#0066FF",
        description: "최대 52만원 혜택 · 한정 사은품 제공",
        ctaText: "사전예약 신청",
        ctaLink: "",
    },
    {
        image: "",
        modelName: "아이폰 17 Pro",
        badge: "출시 예정",
        badgeColor: "#6B7280",
        description: "알리미 등록 시 출시 정보 가장 먼저",
        ctaText: "알림 신청",
        ctaLink: "",
    },
    {
        image: "",
        modelName: "갤럭시 Z 폴드 7",
        badge: "D-7",
        badgeColor: "#D83232",
        description: "폴더블 최초 미리보상 프로그램 적용",
        ctaText: "사전예약 신청",
        ctaLink: "",
    },
]

// ─── 뱃지 컴포넌트 ────────────────────────────────────────────────────
function Badge({ text, color }: { text: string; color: string }) {
    return (
        <span
            style={{
                display: "inline-flex",
                padding: "3px 9px",
                borderRadius: 99,
                backgroundColor: color,
                color: "#FFF",
                fontSize: 11,
                fontWeight: 700,
                fontFamily: FONT,
                letterSpacing: "0.2px",
                lineHeight: "150%",
                whiteSpace: "nowrap",
                flexShrink: 0,
            }}
        >
            {text}
        </span>
    )
}

// ─── 상품 카드 ────────────────────────────────────────────────────────
function PreorderCard({ item }: { item: PreorderItem }) {
    const handleCta = () => {
        if (item.ctaLink && typeof window !== "undefined") {
            window.location.href = item.ctaLink
        }
    }

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "16px",
                borderRadius: 16,
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                boxSizing: "border-box",
                width: "100%",
            }}
        >
            {/* 기기 이미지 */}
            <div
                style={{
                    width: 72,
                    height: 72,
                    borderRadius: 12,
                    backgroundColor: "#F3F4F6",
                    flexShrink: 0,
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.modelName}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                ) : (
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                        <rect x="5" y="2" width="14" height="20" rx="2" stroke="#D1D5DB" strokeWidth="1.5" />
                        <circle cx="12" cy="18" r="1" fill="#D1D5DB" />
                    </svg>
                )}
            </div>

            {/* 텍스트 영역 */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Badge text={item.badge} color={item.badgeColor} />
                </div>
                <span
                    style={{
                        fontSize: 16,
                        fontWeight: 700,
                        color: "#111827",
                        fontFamily: FONT,
                        letterSpacing: "-0.3px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {item.modelName}
                </span>
                <span
                    style={{
                        fontSize: 12,
                        color: "#9CA3AF",
                        fontFamily: FONT,
                        lineHeight: "1.4",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {item.description}
                </span>
            </div>

            {/* CTA 버튼 */}
            <button
                onClick={handleCta}
                style={{
                    flexShrink: 0,
                    padding: "8px 14px",
                    borderRadius: 8,
                    backgroundColor: "#0066FF",
                    color: "#FFF",
                    fontSize: 13,
                    fontWeight: 700,
                    fontFamily: FONT,
                    border: "none",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    letterSpacing: "-0.1px",
                }}
            >
                {item.ctaText}
            </button>
        </div>
    )
}

// ─── 섹션 헤더 ────────────────────────────────────────────────────────
function SectionTitle({ title, sub }: { title: string; sub?: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <span
                style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "#111827",
                    fontFamily: FONT,
                    letterSpacing: "-0.5px",
                    lineHeight: "130%",
                }}
            >
                {title}
            </span>
            {sub && (
                <span
                    style={{
                        fontSize: 13,
                        color: "#9CA3AF",
                        fontFamily: FONT,
                        lineHeight: "1.5",
                    }}
                >
                    {sub}
                </span>
            )}
        </div>
    )
}

// ─── 메인 페이지 ──────────────────────────────────────────────────────
/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function PreorderHubPage(props) {
    const {
        sectionTitle = "사전예약 모음",
        sectionSub = "출시 예정 모델과 진행 중인 사전예약을 한 번에",
        showEmptyState = false,
        style,
    } = props

    return (
        <div
            style={{
                width: "100%",
                maxWidth: 440,
                margin: "0 auto",
                backgroundColor: "#F8F9FA",
                fontFamily: FONT,
                boxSizing: "border-box",
                ...style,
            }}
        >
            {/* 상품 목록 */}
            <section
                style={{
                    padding: "20px 16px 32px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                }}
            >
                <SectionTitle title={sectionTitle} sub={sectionSub} />

                {showEmptyState ? (
                    /* 빈 상태 */
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                            padding: "48px 24px",
                            borderRadius: 16,
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #E5E7EB",
                        }}
                    >
                        <span style={{ fontSize: 32 }}>📭</span>
                        <span style={{ fontSize: 14, color: "#9CA3AF", fontFamily: FONT }}>
                            진행 중인 사전예약이 없습니다
                        </span>
                    </div>
                ) : (
                    /* 상품 카드 목록 */
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 10,
                        }}
                    >
                        {DEFAULT_ITEMS.map((item, i) => (
                            <PreorderCard key={i} item={item} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    )
}

// ─── Framer 프롭 컨트롤 ───────────────────────────────────────────────
addPropertyControls(PreorderHubPage, {
    sectionTitle: {
        type: ControlType.String,
        title: "섹션 타이틀",
        defaultValue: "사전예약 모음",
    },
    sectionSub: {
        type: ControlType.String,
        title: "섹션 설명",
        defaultValue: "출시 예정 모델과 진행 중인 사전예약을 한 번에",
    },
    showEmptyState: {
        type: ControlType.Boolean,
        title: "빈 상태 표시",
        defaultValue: false,
    },
})
