// framer/event/PreorderForm.tsx
// 사전예약 알리미 신청 폼 — 출시 예정 모델 대상
// 스텝: 모델 선택 → 이름 → 전화번호 → 통신사 → 약관 동의
//
// Supabase 테이블: preorder_alarm (event_id = 'preorder_alarm_2026')

import * as React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addPropertyControls, ControlType } from "framer"
import { createClient } from "@supabase/supabase-js"

// ─── Supabase ─────────────────────────────────────────────────────────
const supabaseUrl = "https://crooiozzbjwdaghqddnu.supabase.co"
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyb29pb3p6Ymp3ZGFnaHFkZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3NzIzNjMsImV4cCI6MjAyNTM0ODM2M30.A51d6iu60yiGWL4cka8j9-r6QLQ2skXAHiqBGaTIEcM"
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── 디자인 토큰 ──────────────────────────────────────────────────────
const FONT = '"Pretendard", "Inter", sans-serif'
const C = {
    primary: "#0066FF",
    primaryLight: "#EBF3FF",
    text: "#191F28",
    textSub: "#8B95A1",
    border: "#E5E8EB",
    bg: "#FFFFFF",
    bgAlt: "#F2F4F6",
    disabled: "#D1D6DB",
    overlay: "rgba(0,0,0,0.45)",
}

// ─── 모델 데이터 (UpcomingModels 기준) ────────────────────────────────
const MODELS = [
    {
        id: "Galaxy A37",
        label: "Galaxy A37",
        tag: "4~5월 출시",
        tagColor: "#34C759",
        desc: "실속형 갤럭시 라인업",
    },
    {
        id: "Galaxy Z Fold 8",
        label: "Galaxy Z Fold 8",
        tag: "7월 출시",
        tagColor: "#2A86FF",
        desc: "대화면 폴더블 플래그십",
    },
    {
        id: "Galaxy Z Flip 8",
        label: "Galaxy Z Flip 8",
        tag: "7월 출시",
        tagColor: "#2A86FF",
        desc: "컴팩트 폴더블 스타일",
    },
    {
        id: "iPhone 18",
        label: "iPhone 18",
        tag: "9~10월 출시",
        tagColor: "#FF6B00",
        desc: "차세대 아이폰 시리즈",
        featured: true,
    },
    {
        id: "Galaxy S27",
        label: "Galaxy S27",
        tag: "2027년 출시",
        tagColor: "#7B61FF",
        desc: "차기 프리미엄 갤럭시",
    },
]

const CARRIERS = ["KT", "SKT", "LG U+", "알뜰폰"]

const TOTAL_STEPS = 5

// ─── 약관 텍스트 ──────────────────────────────────────────────────────
const TERMS_TEXT = `[필수] 고객정보 수집 및 이용 동의

KT마켓(이하 주식회사 준텔레콤)은 개인정보보호법 제15조 제1항 제4호 등에 근거하여 이용자 확인, 문의상담 등의 목적으로써 이용자에게 최적의 서비스를 제공하고자 개인정보를 수집·이용하고 있습니다.

1. 수집하려는 개인정보의 항목
- 성명, 휴대폰번호, 신청모델

2. 개인정보의 수집 및 이용목적
- 사전예약 알림 신청 및 출시 정보 안내
- TM을 통한 사전예약 및 출시 정보 안내

3. 개인정보 보유 및 이용기간
- 사전예약 알림 신청 후 6개월 이내 폐기
(단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 관련 법령에 따라 보관)

※ 본 예약 알림 신청 고객은 개인정보 수집 · 이용 및 처리 위탁에 대하여 동의를 거부할 권리가 있으며, 미동의 시 알림 신청을 하실 수 없습니다.`

// ─── 유틸 ─────────────────────────────────────────────────────────────
const formatPhone = (v: string) => {
    const n = v.replace(/[^\d]/g, "")
    if (n.length <= 3) return n
    if (n.length <= 7) return `${n.slice(0, 3)}-${n.slice(3)}`
    return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7, 11)}`
}

// ─── 아이콘 ───────────────────────────────────────────────────────────
const ChevronLeft = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
)
const ChevronRight = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
)
const CheckIcon = ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

// ─── 스텝 타이틀 ──────────────────────────────────────────────────────
const STEP_TITLES = [
    "어떤 모델의 출시 알림을\n받으시겠어요?",
    "신청하시는 분의\n성함을 알려주세요.",
    "연락 가능한 번호를\n입력해주세요.",
    "현재 이용중인\n통신사를 선택해주세요.",
    "약관을 확인하고\n신청을 완료해주세요.",
]

// ─── 애니메이션 ───────────────────────────────────────────────────────
const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0 }),
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight fixed
 * @framerIntrinsicWidth 390
 * @framerIntrinsicHeight 700
 */
export default function PreorderForm(props) {
    const {
        resultPage = "/preorder-result",
        eventId = "preorder_alarm_2026",
        style,
    } = props

    // ── State ──
    const [step, setStep] = useState(1)
    const [dir, setDir] = useState(1)
    const [loading, setLoading] = useState(false)
    const [showTerms, setShowTerms] = useState(false)

    const [model, setModel] = useState("")
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [carrier, setCarrier] = useState("")
    const [agreed, setAgreed] = useState(true)

    const [funnel, setFunnel] = useState<string | null>(null)
    const scrollRef = useRef<HTMLDivElement>(null)

    // UTM 파라미터 추출
    useEffect(() => {
        if (typeof window === "undefined") return
        const p = new URLSearchParams(window.location.search)
        const src = (p.get("f") || p.get("utm_source") || "").toLowerCase()
        if (src.includes("zum")) setFunnel("줌마렐라")
        else if (src.includes("asa")) setFunnel("아사모")
    }, [])

    // 스텝 변경 시 스크롤 리셋
    useEffect(() => {
        scrollRef.current?.scrollTo(0, 0)
    }, [step])

    // input 마운트 시 자동 포커스 콜백
    const autoFocusRef = useCallback((el: HTMLInputElement | null) => {
        if (el) setTimeout(() => el.focus({ preventScroll: true }), 200)
    }, [])

    // ── 유효성 ──
    const isValid = useCallback(() => {
        switch (step) {
            case 1: return !!model
            case 2: return name.trim().length > 0
            case 3: return phone.replace(/-/g, "").length >= 10
            case 4: return !!carrier
            case 5: return agreed
            default: return false
        }
    }, [step, model, name, phone, carrier, agreed])

    // ── 네비게이션 ──
    const goNext = useCallback(() => {
        if (!isValid()) return
        if (step < TOTAL_STEPS) {
            setDir(1)
            setStep((s) => s + 1)
        } else {
            handleSubmit()
        }
    }, [isValid, step])

    const goPrev = useCallback(() => {
        if (showTerms) { setShowTerms(false); return }
        if (step > 1) { setDir(-1); setStep((s) => s - 1) }
    }, [step, showTerms])

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.nativeEvent.isComposing) return
        if (e.key === "Enter" && isValid() && !showTerms) goNext()
    }, [isValid, goNext, showTerms])

    // ── 제출 ──
    const handleSubmit = async () => {
        if (loading) return
        setLoading(true)

        const registerType = carrier === "KT" ? "기기변경" : "번호이동"

        try {
            const { error } = await supabase.from("preorder_alarm").insert([{
                event_id: eventId,
                name,
                phone,
                model,
                register_type: registerType,
                mobile_carrier: carrier,
                funnel,
            }])

            if (error) {
                console.error("Supabase Error:", error)
                alert("제출 중 오류가 발생했습니다. 다시 시도해주세요.")
                setLoading(false)
                return
            }

            // 제출 성공 → 결과 페이지로 이동 (픽셀 트래킹용 별도 페이지)
            if (typeof window !== "undefined") {
                const params = new URLSearchParams({
                    model,
                    name,
                    phone,
                    carrier,
                })
                const sep = resultPage.includes("?") ? "&" : "?"
                window.location.href = `${resultPage}${sep}${params.toString()}`
            }
        } catch (err) {
            console.error(err)
            alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.")
            setLoading(false)
        }
    }

    return (
        <div style={{ ...styles.container, ...style }}>
            {/* ═══ 헤더 ═══ */}
            <div style={styles.header}>
                {step > 1 ? (
                    <button onClick={goPrev} style={styles.backBtn} aria-label="뒤로">
                        <ChevronLeft />
                    </button>
                ) : (
                    <div style={{ width: 40 }} />
                )}
                <div style={styles.progressTrack}>
                    <motion.div
                        style={styles.progressFill}
                        animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                    />
                </div>
                <span style={styles.stepLabel}>{step}/{TOTAL_STEPS}</span>
            </div>

            {/* ═══ 타이틀 ═══ */}
            <div style={styles.titleWrap}>
                <AnimatePresence mode="wait">
                    <motion.h1
                        key={step}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.25 }}
                        style={styles.title}
                    >
                        {STEP_TITLES[step - 1]}
                    </motion.h1>
                </AnimatePresence>
            </div>

            {/* ═══ 컨텐츠 ═══ */}
            <div ref={scrollRef} style={styles.content}>
                <AnimatePresence custom={dir} mode="wait">
                    <motion.div
                        key={step}
                        custom={dir}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ type: "spring", stiffness: 320, damping: 32 }}
                        style={styles.stepWrap}
                    >
                        {/* ── STEP 1: 모델 선택 ── */}
                        {step === 1 && (
                            <div style={styles.listCol}>
                                {MODELS.map((m) => (
                                    <button
                                        key={m.id}
                                        onClick={() => {
                                            setModel(m.id)
                                            setTimeout(() => { setDir(1); setStep(2) }, 180)
                                        }}
                                        style={{
                                            ...styles.modelCard,
                                            borderColor: model === m.id ? C.primary : C.border,
                                            backgroundColor: model === m.id ? C.primaryLight : C.bg,
                                            ...(m.featured ? styles.modelCardFeatured : {}),
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <span
                                                style={{
                                                    ...styles.modelTag,
                                                    color: m.featured ? "#FFF" : m.tagColor,
                                                    backgroundColor: m.featured
                                                        ? m.tagColor
                                                        : `${m.tagColor}18`,
                                                }}
                                            >
                                                {m.tag}
                                            </span>
                                            <div style={{
                                                ...styles.modelName,
                                                color: m.featured && model !== m.id ? C.text : model === m.id ? C.primary : C.text,
                                            }}>
                                                {m.label}
                                            </div>
                                            <div style={styles.modelDesc}>{m.desc}</div>
                                        </div>
                                        <div style={{
                                            ...styles.radioCircle,
                                            backgroundColor: model === m.id ? C.primary : C.bgAlt,
                                            borderColor: model === m.id ? C.primary : C.border,
                                        }}>
                                            {model === m.id && <CheckIcon />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* ── STEP 2: 이름 ── */}
                        {step === 2 && (
                            <div style={styles.inputWrap}>
                                <input
                                    ref={autoFocusRef}
                                    type="text"
                                    inputMode="text"
                                    autoComplete="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="홍길동"
                                    style={styles.input}
                                />
                                <span style={styles.inputHint}>
                                    상담 시 확인을 위해 실명을 입력해주세요.
                                </span>
                            </div>
                        )}

                        {/* ── STEP 3: 전화번호 ── */}
                        {step === 3 && (
                            <div style={styles.inputWrap}>
                                <input
                                    ref={autoFocusRef}
                                    type="tel"
                                    inputMode="numeric"
                                    autoComplete="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                                    onKeyDown={handleKeyDown}
                                    placeholder="010-0000-0000"
                                    maxLength={13}
                                    style={styles.input}
                                />
                                <span style={styles.inputHint}>
                                    출시 알림을 받으실 번호를 입력해주세요.
                                </span>
                            </div>
                        )}

                        {/* ── STEP 4: 통신사 ── */}
                        {step === 4 && (
                            <div style={styles.gridContainer}>
                                {CARRIERS.map((c) => (
                                    <button
                                        key={c}
                                        onClick={() => {
                                            setCarrier(c)
                                            setTimeout(() => { setDir(1); setStep(5) }, 180)
                                        }}
                                        style={{
                                            ...styles.carrierBtn,
                                            borderColor: carrier === c ? C.primary : C.border,
                                            backgroundColor: carrier === c ? C.primaryLight : C.bg,
                                            color: carrier === c ? C.primary : C.text,
                                            fontWeight: carrier === c ? 700 : 500,
                                        }}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* ── STEP 5: 약관 동의 ── */}
                        {step === 5 && (
                            <div style={styles.termsSection}>
                                {/* 요약 카드 */}
                                <div style={styles.summaryCard}>
                                    <div style={styles.summaryTitle}>신청 정보 확인</div>
                                    <div style={styles.summaryRow}>
                                        <span style={styles.summaryLabel}>모델</span>
                                        <span style={styles.summaryValue}>{model}</span>
                                    </div>
                                    <div style={styles.summaryRow}>
                                        <span style={styles.summaryLabel}>이름</span>
                                        <span style={styles.summaryValue}>{name}</span>
                                    </div>
                                    <div style={styles.summaryRow}>
                                        <span style={styles.summaryLabel}>연락처</span>
                                        <span style={styles.summaryValue}>{phone}</span>
                                    </div>
                                    <div style={{ ...styles.summaryRow, borderBottom: "none", paddingBottom: 0 }}>
                                        <span style={styles.summaryLabel}>통신사</span>
                                        <span style={styles.summaryValue}>{carrier}</span>
                                    </div>
                                </div>

                                {/* 약관 체크 */}
                                <div
                                    style={styles.termsBox}
                                    onClick={() => setAgreed(!agreed)}
                                >
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{
                                            ...styles.checkBox,
                                            backgroundColor: agreed ? C.primary : "#E5E5E5",
                                        }}>
                                            <CheckIcon />
                                        </div>
                                        <span style={styles.termsLabel}>
                                            개인정보 수집 · 이용 동의
                                        </span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); setShowTerms(true) }}
                                        style={styles.termsViewBtn}
                                        aria-label="약관 보기"
                                    >
                                        <ChevronRight />
                                    </button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* ═══ 약관 모달 ═══ */}
            <AnimatePresence>
                {showTerms && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={styles.modalBackdrop}
                        onClick={() => setShowTerms(false)}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 340, damping: 36 }}
                            style={styles.modalSheet}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div style={styles.modalHandle} />
                            <h3 style={styles.modalTitle}>개인정보 수집 · 이용 동의</h3>
                            <div style={styles.modalScroll}>{TERMS_TEXT}</div>
                            <button
                                onClick={() => { setAgreed(true); setShowTerms(false) }}
                                style={styles.modalBtn}
                            >
                                동의하고 닫기
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ═══ 하단 버튼 ═══ */}
            <div style={styles.footer}>
                <motion.button
                    onClick={step === TOTAL_STEPS ? handleSubmit : goNext}
                    disabled={!isValid() || loading}
                    whileTap={isValid() && !loading ? { scale: 0.97 } : {}}
                    style={{
                        ...styles.ctaBtn,
                        backgroundColor: isValid() ? C.primary : C.disabled,
                        cursor: isValid() && !loading ? "pointer" : "not-allowed",
                        opacity: loading ? 0.7 : 1,
                    }}
                >
                    {loading
                        ? "처리중..."
                        : step === TOTAL_STEPS
                            ? "사전예약 알림 신청하기"
                            : "다음"}
                </motion.button>
            </div>
        </div>
    )
}

// ─── 스타일 ───────────────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
    container: {
        width: "100%",
        maxWidth: 440,
        minWidth: 320,
        height: "100%",
        minHeight: 640,
        margin: "0 auto",
        backgroundColor: C.bg,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        fontFamily: FONT,
        position: "relative",
        WebkitFontSmoothing: "antialiased",
    },

    // 헤더
    header: {
        display: "flex",
        alignItems: "center",
        padding: "12px 16px",
        gap: 12,
        flexShrink: 0,
    },
    backBtn: {
        width: 40,
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "none",
        border: "none",
        cursor: "pointer",
        borderRadius: 10,
        flexShrink: 0,
    },
    progressTrack: {
        flex: 1,
        height: 4,
        backgroundColor: C.bgAlt,
        borderRadius: 2,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        backgroundColor: C.primary,
        borderRadius: 2,
    },
    stepLabel: {
        fontSize: 13,
        fontWeight: 600,
        color: C.textSub,
        flexShrink: 0,
        minWidth: 28,
        textAlign: "right" as const,
    },

    // 타이틀
    titleWrap: {
        padding: "8px 24px 16px",
        minHeight: 76,
        flexShrink: 0,
    },
    title: {
        fontSize: 24,
        fontWeight: 700,
        color: C.text,
        lineHeight: 1.38,
        whiteSpace: "pre-line" as const,
        margin: 0,
        letterSpacing: "-0.3px",
    },

    // 컨텐츠
    content: {
        flex: 1,
        padding: "0 24px",
        overflowY: "auto" as const,
        overflowX: "hidden" as const,
        WebkitOverflowScrolling: "touch",
        position: "relative" as const,
    },
    stepWrap: {
        width: "100%",
        paddingBottom: 24,
    },

    // STEP 1 — 모델
    listCol: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 10,
    },
    modelCard: {
        width: "100%",
        padding: "16px 18px",
        borderRadius: 16,
        borderWidth: 2,
        borderStyle: "solid" as const,
        display: "flex",
        alignItems: "center",
        cursor: "pointer",
        transition: "all 0.2s",
        textAlign: "left" as const,
        WebkitTapHighlightColor: "transparent",
        boxSizing: "border-box" as const,
    },
    modelCardFeatured: {
        boxShadow: "0 2px 12px rgba(0,102,255,0.12)",
    },
    modelTag: {
        display: "inline-block",
        fontSize: 11,
        fontWeight: 700,
        padding: "3px 8px",
        borderRadius: 99,
        marginBottom: 6,
        letterSpacing: "0.1px",
    },
    modelName: {
        fontSize: 17,
        fontWeight: 700,
        marginBottom: 3,
        lineHeight: 1.3,
    },
    modelDesc: {
        fontSize: 13,
        color: C.textSub,
        lineHeight: 1.4,
    },
    radioCircle: {
        width: 26,
        height: 26,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        marginLeft: 12,
        borderWidth: 2,
        borderStyle: "solid" as const,
        transition: "all 0.2s",
    },

    // STEP 2, 3 — 인풋
    inputWrap: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 10,
        paddingTop: 8,
    },
    input: {
        width: "100%",
        fontSize: 22,
        fontWeight: 500,
        padding: "14px 0",
        border: "none",
        borderBottom: `2px solid ${C.border}`,
        borderRadius: 0,
        outline: "none",
        backgroundColor: "transparent",
        color: C.text,
        fontFamily: FONT,
        boxSizing: "border-box" as const,
        WebkitAppearance: "none" as const,
    },
    inputHint: {
        fontSize: 13,
        color: C.textSub,
        lineHeight: 1.5,
    },

    // STEP 4 — 통신사
    gridContainer: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 10,
    },
    carrierBtn: {
        padding: "18px 16px",
        borderRadius: 14,
        borderWidth: 2,
        borderStyle: "solid" as const,
        fontSize: 16,
        cursor: "pointer",
        transition: "all 0.2s",
        fontFamily: FONT,
        textAlign: "center" as const,
        WebkitTapHighlightColor: "transparent",
    },

    // STEP 5 — 약관 + 요약
    termsSection: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 20,
    },
    summaryCard: {
        padding: "18px 20px",
        borderRadius: 16,
        backgroundColor: C.bgAlt,
        display: "flex",
        flexDirection: "column" as const,
        gap: 0,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: 700,
        color: C.primary,
        marginBottom: 14,
        letterSpacing: "-0.2px",
    },
    summaryRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: `1px solid ${C.border}`,
    },
    summaryLabel: {
        fontSize: 14,
        color: C.textSub,
        fontWeight: 500,
    },
    summaryValue: {
        fontSize: 15,
        color: C.text,
        fontWeight: 600,
    },
    termsBox: {
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 0",
        cursor: "pointer",
        borderBottom: `1px solid ${C.border}`,
        WebkitTapHighlightColor: "transparent",
    },
    checkBox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.2s",
        flexShrink: 0,
    },
    termsLabel: {
        fontSize: 15,
        color: C.text,
        fontWeight: 500,
    },
    termsViewBtn: {
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: 8,
        display: "flex",
        alignItems: "center",
    },

    // 약관 모달 (바텀시트)
    modalBackdrop: {
        position: "absolute" as const,
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: C.overlay,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        zIndex: 50,
    },
    modalSheet: {
        width: "100%",
        maxHeight: "85%",
        backgroundColor: C.bg,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: "12px 24px 28px",
        display: "flex",
        flexDirection: "column" as const,
        boxShadow: "0 -4px 32px rgba(0,0,0,0.12)",
    },
    modalHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: "#DDD",
        margin: "0 auto 16px",
    },
    modalTitle: {
        margin: "0 0 12px",
        fontSize: 18,
        fontWeight: 700,
        color: C.text,
    },
    modalScroll: {
        flex: 1,
        overflowY: "auto" as const,
        fontSize: 13,
        color: C.textSub,
        lineHeight: 1.65,
        whiteSpace: "pre-wrap" as const,
        marginBottom: 20,
        paddingTop: 12,
        borderTop: `1px solid ${C.border}`,
        WebkitOverflowScrolling: "touch",
    },
    modalBtn: {
        width: "100%",
        padding: "15px",
        backgroundColor: C.primary,
        color: "#FFF",
        border: "none",
        borderRadius: 12,
        fontSize: 16,
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: FONT,
        flexShrink: 0,
    },

    // 하단 버튼 (고정)
    footer: {
        position: "sticky" as const,
        bottom: 0,
        left: 0,
        right: 0,
        padding: "16px 24px",
        paddingBottom: "max(16px, env(safe-area-inset-bottom))",
        borderTop: `1px solid ${C.bgAlt}`,
        backgroundColor: C.bg,
        flexShrink: 0,
        zIndex: 10,
    },
    ctaBtn: {
        width: "100%",
        height: 54,
        borderRadius: 14,
        border: "none",
        color: "#FFF",
        fontSize: 17,
        fontWeight: 700,
        fontFamily: FONT,
        transition: "background-color 0.2s, opacity 0.2s",
        letterSpacing: "-0.2px",
        WebkitTapHighlightColor: "transparent",
    },
}

// ─── Framer 프롭 컨트롤 ───────────────────────────────────────────────
addPropertyControls(PreorderForm, {
    resultPage: {
        type: ControlType.String,
        title: "완료 후 이동 경로",
        defaultValue: "/preorder-result",
    },
    eventId: {
        type: ControlType.String,
        title: "이벤트 ID",
        defaultValue: "preorder_alarm_2026",
    },
})
