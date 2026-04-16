// framer/phone/AiRecommendModal.tsx
// AI 맞춤 추천 바텀시트 — 통신사 + 데이터 사용량 2단계 수집
//
// sessionStorage("kt_ai_recommend") + CustomEvent("kt-ai-recommend-change") 패턴
// → phoneDetailOverridesV2.tsx의 withRegister에서 읽어 store에 반영
//
// 가입유형은 통신사 선택으로 자동 결정 (KT=기기변경, 나머지=번호이동)

import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"

// ─── 상수 ─────────────────────────────────────────────────────────────
const FONT = '"Pretendard", "Inter", sans-serif'
const STORAGE_KEY = "kt_ai_recommend"
const STORAGE_EVENT = "kt-ai-recommend-change"
const DISMISS_KEY = "kt_ai_recommend_dismissed"

const C = {
    primary: "#0066FF",
    primaryLight: "#EBF3FF",
    accent: "#7B4AFF",
    accentLight: "#F3EEFF",
    accentGradient: "linear-gradient(135deg, #7B4AFF 0%, #A78BFA 100%)",
    text: "#191F28",
    textSub: "#8B95A1",
    border: "#E5E8EB",
    bg: "#FFFFFF",
    bgAlt: "#F7F8FA",
    overlay: "rgba(0,0,0,0.45)",
}

// ─── 통신사 데이터 ────────────────────────────────────────────────────
const CARRIERS = [
    { id: "SKT", label: "SKT", register: "번호이동", desc: "쓰던 번호 그대로 KT로 이동" },
    { id: "KT", label: "KT", register: "기기변경", desc: "KT 번호 그대로 기기만 변경" },
    { id: "LG U+", label: "LG U+", register: "번호이동", desc: "쓰던 번호 그대로 KT로 이동" },
    { id: "알뜰폰", label: "알뜰폰", register: "번호이동", desc: "쓰던 번호 그대로 KT로 이동" },
]

// ─── 데이터 사용량 티어 → 요금제 매핑 ─────────────────────────────────
const DATA_TIERS = [
    {
        id: "light",
        emoji: "\uD83D\uDD0D",
        label: "인터넷 검색만 해요",
        sub: "1~4GB",
        planPrice: 37000,
        planId: "ppllistobj_0925",
    },
    {
        id: "sns",
        emoji: "\uD83D\uDCF1",
        label: "인터넷+SNS를 조금 봐요",
        sub: "5~10GB",
        planPrice: 37000,
        planId: "ppllistobj_0925",
    },
    {
        id: "music",
        emoji: "\uD83C\uDFB5",
        label: "음악을 자주 들어요",
        sub: "80~100GB",
        planPrice: 69000,
        planId: "ppllistobj_0808",
    },
    {
        id: "video",
        emoji: "\uD83D\uDCFA",
        label: "유튜브 영상을 자주 봐요",
        sub: "100~150GB",
        planPrice: 90000,
        planId: "ppllistobj_0937",
    },
    {
        id: "heavy",
        emoji: "\uD83C\uDFAE",
        label: "게임, 영상 등 많이 써요",
        sub: "완전 무제한",
        planPrice: 110000,
        planId: "ppllistobj_0937",
    },
]

// ─── 유틸 ─────────────────────────────────────────────────────────────
function saveRecommendation(data: {
    carrier: string
    register: string
    dataTier: string
    planPrice: number
    planId: string
}) {
    if (typeof window === "undefined") return
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    window.dispatchEvent(new Event(STORAGE_EVENT))
}

function getRecommendation() {
    if (typeof window === "undefined") return null
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    try { return JSON.parse(raw) } catch { return null }
}

function isDismissed() {
    if (typeof window === "undefined") return false
    return window.sessionStorage.getItem(DISMISS_KEY) === "true"
}

function setDismissed() {
    if (typeof window === "undefined") return
    window.sessionStorage.setItem(DISMISS_KEY, "true")
}

// ─── 아이콘 ───────────────────────────────────────────────────────────
const SparkleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L13.09 8.26L18 6L14.74 10.91L21 12L14.74 13.09L18 18L13.09 15.74L12 22L10.91 15.74L6 18L9.26 13.09L3 12L9.26 10.91L6 6L10.91 8.26L12 2Z" fill="#FFD700"/>
    </svg>
)

const CloseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6L6 18M6 6L18 18"/>
    </svg>
)

const CheckCircle = () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="10" fill={C.primary}/>
        <path d="M6.5 10.5L9 13L14 7.5" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
)

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────
/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function AiRecommendModal(props) {
    const {
        autoShow = true,
        style,
    } = props

    const [isOpen, setIsOpen] = useState(false)
    const [carrier, setCarrier] = useState<string | null>(null)
    const [dataTier, setDataTier] = useState<string | null>(null)

    // 자동 표시 (이전에 닫거나 이미 추천받은 적 없을 때)
    useEffect(() => {
        if (!autoShow) return
        if (isDismissed() || getRecommendation()) return
        const timer = setTimeout(() => setIsOpen(true), 800)
        return () => clearTimeout(timer)
    }, [autoShow])

    const activeCarrier = CARRIERS.find((c) => c.id === carrier)
    const activeTier = DATA_TIERS.find((t) => t.id === dataTier)

    const canSubmit = !!carrier && !!dataTier

    const handleSubmit = useCallback(() => {
        if (!activeCarrier || !activeTier) return
        saveRecommendation({
            carrier: activeCarrier.id,
            register: activeCarrier.register,
            dataTier: activeTier.id,
            planPrice: activeTier.planPrice,
            planId: activeTier.planId,
        })
        setDismissed()
        setIsOpen(false)
    }, [activeCarrier, activeTier])

    const handleClose = useCallback(() => {
        setDismissed()
        setIsOpen(false)
    }, [])

    // 외부에서 열기 위한 트리거 (Framer override용)
    useEffect(() => {
        const openHandler = () => setIsOpen(true)
        window.addEventListener("kt-ai-recommend-open", openHandler)
        return () => window.removeEventListener("kt-ai-recommend-open", openHandler)
    }, [])

    return (
        <>
            {/* 트리거 버튼 (항상 렌더) */}
            <div style={style} />

            {/* 모달 */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={styles.backdrop}
                        onClick={handleClose}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 340, damping: 36 }}
                            style={styles.sheet}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* ═══ 헤더 ═══ */}
                            <div style={styles.header}>
                                <div style={styles.headerLeft}>
                                    <SparkleIcon />
                                    <span style={styles.headerTitle}>AI 맞춤 추천</span>
                                </div>
                                <button onClick={handleClose} style={styles.closeBtn} aria-label="닫기">
                                    <CloseIcon />
                                </button>
                            </div>

                            {/* ═══ 본문 (스크롤) ═══ */}
                            <div style={styles.body}>
                                <p style={styles.bodyDesc}>
                                    간단한 질문에 답해주시면 최적의 조건을 설정해 드릴게요
                                </p>

                                {/* ── Q1: 통신사 ── */}
                                <div style={styles.section}>
                                    <h3 style={styles.question}>현재 쓰고 있는 통신사는?</h3>
                                    <div style={styles.carrierGrid}>
                                        {CARRIERS.map((c) => {
                                            const active = carrier === c.id
                                            return (
                                                <motion.button
                                                    key={c.id}
                                                    whileTap={{ scale: 0.96 }}
                                                    onClick={() => setCarrier(c.id)}
                                                    style={{
                                                        ...styles.carrierBtn,
                                                        borderColor: active ? C.primary : C.border,
                                                        backgroundColor: active ? C.primary : C.bg,
                                                        color: active ? "#FFF" : C.text,
                                                        fontWeight: active ? 700 : 500,
                                                    }}
                                                >
                                                    {c.label}
                                                </motion.button>
                                            )
                                        })}
                                    </div>

                                    {/* 가입유형 자동 표시 */}
                                    <AnimatePresence>
                                        {activeCarrier && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                                transition={{ duration: 0.2 }}
                                                style={styles.registerInfo}
                                            >
                                                <span style={styles.registerBadge}>
                                                    {activeCarrier.register}
                                                </span>
                                                <span style={styles.registerDesc}>
                                                    {activeCarrier.desc}
                                                </span>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* ── Q2: 데이터 사용량 (통신사 선택 후 노출) ── */}
                                <AnimatePresence>
                                    {carrier && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 16 }}
                                            transition={{ duration: 0.3, delay: 0.1 }}
                                            style={styles.section}
                                        >
                                            <h3 style={styles.question}>월 데이터 사용량</h3>
                                            <div style={styles.tierList}>
                                                {DATA_TIERS.map((tier) => {
                                                    const active = dataTier === tier.id
                                                    return (
                                                        <motion.button
                                                            key={tier.id}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={() => setDataTier(tier.id)}
                                                            style={{
                                                                ...styles.tierBtn,
                                                                borderColor: active ? C.primary : C.border,
                                                                backgroundColor: active ? C.primaryLight : C.bg,
                                                            }}
                                                        >
                                                            <span style={styles.tierEmoji}>{tier.emoji}</span>
                                                            <div style={styles.tierTextWrap}>
                                                                <span style={{
                                                                    ...styles.tierLabel,
                                                                    color: active ? C.primary : C.text,
                                                                    fontWeight: active ? 700 : 500,
                                                                }}>
                                                                    {tier.label}
                                                                </span>
                                                                <span style={styles.tierSub}>
                                                                    ({tier.sub})
                                                                </span>
                                                            </div>
                                                            {active && (
                                                                <div style={styles.tierCheck}>
                                                                    <CheckCircle />
                                                                </div>
                                                            )}
                                                        </motion.button>
                                                    )
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* ═══ 하단 버튼 ═══ */}
                            <div style={styles.footer}>
                                <motion.button
                                    whileTap={canSubmit ? { scale: 0.97 } : {}}
                                    onClick={handleSubmit}
                                    disabled={!canSubmit}
                                    style={{
                                        ...styles.submitBtn,
                                        background: canSubmit ? C.primary : C.border,
                                        cursor: canSubmit ? "pointer" : "not-allowed",
                                    }}
                                >
                                    이 기준으로 설정해주세요
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

// ─── 스타일 ───────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
    backdrop: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: C.overlay,
        zIndex: 99999,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
    },
    sheet: {
        width: "100%",
        maxWidth: 440,
        maxHeight: "88vh",
        backgroundColor: C.bg,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        display: "flex",
        flexDirection: "column" as const,
        overflow: "hidden",
    },

    // 헤더
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 20px 14px",
        background: C.accentGradient,
        flexShrink: 0,
    },
    headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 800,
        color: "#FFF",
        fontFamily: FONT,
        letterSpacing: "-0.3px",
    },
    closeBtn: {
        width: 36,
        height: 36,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(255,255,255,0.15)",
        border: "none",
        borderRadius: 10,
        cursor: "pointer",
        WebkitTapHighlightColor: "transparent",
    },

    // 본문
    body: {
        flex: 1,
        overflowY: "auto" as const,
        padding: "20px 20px 8px",
        WebkitOverflowScrolling: "touch",
    },
    bodyDesc: {
        margin: "0 0 24px",
        fontSize: 14,
        color: C.textSub,
        lineHeight: 1.5,
        fontFamily: FONT,
    },

    // 섹션
    section: {
        marginBottom: 28,
    },
    question: {
        margin: "0 0 14px",
        fontSize: 18,
        fontWeight: 700,
        color: C.text,
        fontFamily: FONT,
        letterSpacing: "-0.3px",
    },

    // 통신사 그리드
    carrierGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr",
        gap: 8,
    },
    carrierBtn: {
        height: 46,
        borderRadius: 10,
        borderWidth: 1.5,
        borderStyle: "solid" as const,
        fontSize: 15,
        fontFamily: FONT,
        cursor: "pointer",
        transition: "all 0.15s",
        WebkitTapHighlightColor: "transparent",
    },

    // 가입유형 안내
    registerInfo: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        marginTop: 10,
        overflow: "hidden",
    },
    registerBadge: {
        fontSize: 12,
        fontWeight: 700,
        color: C.primary,
        backgroundColor: C.primaryLight,
        padding: "4px 10px",
        borderRadius: 99,
        whiteSpace: "nowrap" as const,
        fontFamily: FONT,
    },
    registerDesc: {
        fontSize: 13,
        color: C.textSub,
        fontFamily: FONT,
        lineHeight: 1.4,
    },

    // 데이터 티어
    tierList: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 8,
    },
    tierBtn: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "15px 16px",
        borderRadius: 14,
        borderWidth: 1.5,
        borderStyle: "solid" as const,
        cursor: "pointer",
        transition: "all 0.15s",
        fontFamily: FONT,
        textAlign: "left" as const,
        boxSizing: "border-box" as const,
        WebkitTapHighlightColor: "transparent",
        background: "none",
    },
    tierEmoji: {
        fontSize: 22,
        width: 32,
        textAlign: "center" as const,
        flexShrink: 0,
    },
    tierTextWrap: {
        flex: 1,
        display: "flex",
        alignItems: "baseline",
        gap: 6,
    },
    tierLabel: {
        fontSize: 15,
        lineHeight: 1.4,
    },
    tierSub: {
        fontSize: 13,
        color: C.textSub,
    },
    tierCheck: {
        flexShrink: 0,
    },

    // 하단 버튼
    footer: {
        padding: "12px 20px",
        paddingBottom: "max(12px, env(safe-area-inset-bottom))",
        flexShrink: 0,
    },
    submitBtn: {
        width: "100%",
        height: 52,
        borderRadius: 14,
        border: "none",
        color: "#FFF",
        fontSize: 17,
        fontWeight: 700,
        fontFamily: FONT,
        transition: "background 0.2s",
        letterSpacing: "-0.2px",
        WebkitTapHighlightColor: "transparent",
    },
}

// ─── Framer 프롭 컨트롤 ───────────────────────────────────────────────
addPropertyControls(AiRecommendModal, {
    autoShow: {
        type: ControlType.Boolean,
        title: "자동 표시",
        defaultValue: true,
    },
})
