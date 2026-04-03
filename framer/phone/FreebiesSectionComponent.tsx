// withFreebiesSection override와 함께 사용
// [5] 할인 제품 — 사은품 가로 스크롤 카드 + 선택 상태

import { addPropertyControls, ControlType } from "framer"
import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"

// ─── 스켈레톤 카드 ────────────────────────────────────────────────────
const SkeletonCard = ({ delay = 0 }) => (
    <div style={{ flexShrink: 0, width: 112, display: "flex", flexDirection: "column", gap: 6 }}>
        <motion.div
            style={{ width: 112, height: 100, borderRadius: 12, backgroundColor: "#E5E7EB" }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay }}
        />
        <motion.div
            style={{ width: "80%", height: 12, borderRadius: 4, backgroundColor: "#E5E7EB" }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: delay + 0.1 }}
        />
        <motion.div
            style={{ width: "60%", height: 12, borderRadius: 4, backgroundColor: "#E5E7EB" }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: delay + 0.15 }}
        />
    </div>
)

// ─── 개별 사은품 카드 ─────────────────────────────────────────────────
const FreebieCard = ({
    freebie,
    isSelected,
    onSelect,
}: {
    freebie: any
    isSelected: boolean
    onSelect: (f: any) => void
}) => (
    <motion.div
        onClick={() => onSelect(freebie)}
        whileTap={{ scale: 0.96 }}
        style={{
            flexShrink: 0,
            width: 112,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
            cursor: "pointer",
        }}
    >
        {/* 이미지 박스 */}
        <div
            style={{
                width: 112,
                height: 100,
                borderRadius: 12,
                border: isSelected ? "2px solid #0055FF" : "1.5px solid #E5E7EB",
                backgroundColor: "#FAFAFA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                boxSizing: "border-box",
                marginBottom: 8,
                transition: "border-color 0.15s",
            }}
        >
            <img
                    src={`https://juntell.s3.ap-northeast-2.amazonaws.com/freebie/${freebie.no}.png`}
                    alt={freebie.title}
                    style={{ width: "75%", height: "75%", objectFit: "contain" }}
                    onError={(e) => { e.currentTarget.style.display = "none" }}
                />
        </div>

        {/* 상품명 */}
        <span
            style={{
                fontSize: 12,
                fontWeight: 400,
                color: "#374151",
                textAlign: "center",
                lineHeight: 1.4,
                wordBreak: "keep-all",
                marginBottom: 4,
                width: "100%",
            }}
        >
            {freebie.title}
        </span>

        {/* 월 금액 */}
        <span
            style={{
                fontSize: 13,
                fontWeight: 700,
                color: isSelected ? "#0055FF" : "#111827",
                transition: "color 0.15s",
                marginBottom: 2,
            }}
        >
            월 {(freebie.monthly_price ?? 0).toLocaleString()}원
        </span>

        {/* 부가설명 */}
        <span style={{ fontSize: 11, color: "#9CA3AF" }}>할부 수수료 별도</span>
    </motion.div>
)

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────
/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function FreebiesSectionComponent(props) {
    const {
        plan = "",          // 현재 선택된 요금제 PID (withFreebiesSection에서 주입)
        store = null,       // 전역 store
        setStore = null,    // store setter
        stepNumber = 5,
        title = "할인 제품",
        isLoading = false,
    } = props

    const [freebies, setFreebies] = useState<any[]>([])
    const [fetching, setFetching] = useState(true)

    // 사은품 데이터 fetch
    useEffect(() => {
        if (!plan) { setFetching(false); return }

        setFetching(true)

        fetch(
            `https://kt-market-puce.vercel.app/api/freebies?planId=${encodeURIComponent(plan)}`
        )
            .then((r) => r.json())
            .then((data: any[]) => setFreebies(Array.isArray(data) ? data : []))
            .catch(() => setFreebies([]))
            .finally(() => setFetching(false))
    }, [plan])

    const selectedFreebie = store?.freebie ?? null

    const handleSelect = (freebie: any) => {
        if (!setStore) return
        // 이미 선택된 항목 재클릭 → 선택 해제
        if (selectedFreebie?.no === freebie.no) {
            setStore({ freebie: null })
        } else {
            setStore({ freebie })
        }
    }

    const loading = isLoading || fetching

    return (
        <div style={wrapperStyle}>
            {/* 헤더 */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={stepBadge}>
                    <span style={stepText}>{stepNumber}</span>
                </div>
                <span style={titleText}>{title}</span>
            </div>

            {/* 카드 목록 */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 10,
                    overflowX: "auto",
                    paddingBottom: 4,
                    scrollbarWidth: "none",
                }}
            >
                {loading ? (
                    [0, 1, 2].map((i) => <SkeletonCard key={i} delay={i * 0.1} />)
                ) : freebies.length === 0 ? (
                    <span style={{ fontSize: 13, color: "#9CA3AF", padding: "8px 0" }}>
                        해당 요금제에 적용 가능한 할인 제품이 없습니다.
                    </span>
                ) : (
                    freebies.map((f) => (
                        <FreebieCard
                            key={f.no}
                            freebie={f}
                            isSelected={selectedFreebie?.no === f.no}
                            onSelect={handleSelect}
                        />
                    ))
                )}
            </div>
        </div>
    )
}

// ─── 스타일 ────────────────────────────────────────────────────────────
const wrapperStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    boxSizing: "border-box",
    fontFamily: '"Pretendard", "Inter", sans-serif',
}
const stepBadge: React.CSSProperties = {
    width: 24, height: 24, borderRadius: 6,
    backgroundColor: "#111827",
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
}
const stepText: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "#FFFFFF" }
const titleText: React.CSSProperties = {
    fontSize: 16, fontWeight: 700, color: "#111827",
    fontFamily: '"Pretendard", "Inter", sans-serif',
}

addPropertyControls(FreebiesSectionComponent, {
    isLoading: { type: ControlType.Boolean, title: "Loading", defaultValue: false },
    stepNumber: { type: ControlType.Number, title: "Step No.", defaultValue: 5, min: 1, max: 9 },
    title: { type: ControlType.String, title: "Title", defaultValue: "할인 제품" },
})
