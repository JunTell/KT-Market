import * as React from "react"
import { useState, useRef, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@supabase/supabase-js"

// --- [설정] Supabase 설정 ---
const supabaseUrl = "https://crooiozzbjwdaghqddnu.supabase.co"
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyb29pb3p6Ymp3ZGFnaHFkZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3NzIzNjMsImV4cCI6MjAyNTM0ODM2M30.A51d6iu60yiGWL4cka8j9-r6QLQ2skXAHiqBGaTIEcM"
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- [설정] 디자인 시스템 ---
const COLORS = {
    primary: "#0066FF",
    primaryLight: "#E5F0FF",
    textMain: "#191F28",
    textSub: "#8B95A1",
    border: "#E5E8EB",
    bg: "#FFFFFF",
    bgAlt: "#F2F4F6",
    white: "#FFFFFF",
    disabled: "#D1D6DB",
    check: "#34C759",
    overlay: "rgba(0, 0, 0, 0.4)",
}

// --- [데이터] 약관 내용 ---
const TERMS_TEXT = `[필수] 고객정보 수집 및 이용 동의

KT마켓(이하 주식회사 준텔레콤)은 개인정보보호법 제15조 제1항 제4호 등에 근거하여 이용자 확인, 문의상담 등의 목적으로써 이용자에게 최적의 서비스를 제공하고자 개인정보를 수집·이용하고 있습니다.

1. 수집하려는 개인정보의 항목
- 성명, 휴대폰번호, 신청모델/색상

2. 개인정보의 수집 및 이용목적
- 사전예약 신청, 핸드폰 예약가입 및 이벤트 안내
- 핸드폰 출시 정보 및 이벤트 안내
- TM을 통한 사전예약 및 출시 정보 안내

3. 개인정보 보유 및 이용기간
- 사전예약 신청 전송 후 6개월 이내 폐기
(단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 관련 법령에 따라 보관)

※ 본 예약 신청 고객은 개인정보 수집 · 이용 및 처리 위탁에 대하여 동의를 거부할 권리가 있으며, 미동의 시 예약 신청을 하실 수 없습니다.`

const PLANS = [
    {
        id: "S26 일반",
        label: "S26 일반",
        tag: "Basic",
        desc: "가볍게 쓰기 좋은 기본형",
    },
    {
        id: "S26 플러스",
        label: "S26 플러스",
        tag: "Popular",
        desc: "화면·배터리 균형 잡힌 베스트",
    },
    {
        id: "S26 울트라",
        label: "S26 울트라",
        tag: "Premium",
        desc: "카메라·성능 최상위 모델",
    },
]

// --- [데이터] 색상 데이터 수정됨 (FIX) ---
// 울트라의 '아이스 블루'를 삭제하고 '스카이 블루'로 통일하거나 의도에 맞게 수정했습니다.
const DEVICE_COLORS = [
    // 일반 / 플러스 전용
    {
        id: "화이트",
        label: "화이트",
        code: "#F5F5F0",
        models: ["S26 일반", "S26 플러스"],
    },
    {
        id: "블랙",
        label: "블랙",
        code: "#1C1C1C",
        models: ["S26 일반", "S26 플러스"],
    },
    {
        id: "스카이 블루",
        label: "스카이 블루",
        code: "#87CEEB",
        models: ["S26 일반", "S26 플러스"],
    },
    {
        id: "바이올렛",
        label: "바이올렛",
        code: "#BBAADD",
        models: ["S26 일반", "S26 플러스"],
    },

    // 울트라 전용
    {
        id: "블랙",
        label: "블랙",
        code: "#2C2C2C",
        models: ["S26 울트라"],
    },
    {
        id: "화이트",
        label: "화이트",
        code: "#F5F5F0",
        models: ["S26 울트라"],
    },
    // [FIX] 기존 '아이스 블루' -> '스카이 블루'로 변경 (만약 색상 코드가 다르면 code도 수정하세요)
    {
        id: "스카이 블루",
        label: "스카이 블루",
        code: "#87CEEB", // 울트라 전용 색상이 따로 있다면 코드 변경 필요 (#335588 등)
        models: ["S26 울트라"],
    },
    {
        id: "바이올렛",
        label: "바이올렛",
        code: "#BBAADD",
        models: ["S26 울트라"],
    },
]

const CARRIERS = ["KT", "SKT", "LG U+", "알뜰폰"]

// --- 포맷팅 함수 ---
const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^\d]/g, "")
    if (numbers.length <= 3) return numbers
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
}

export default function KTMarketForm(props) {
    // State
    const [step, setStep] = useState(1)
    const [direction, setDirection] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [showTerms, setShowTerms] = useState(false)

    // Form Values
    const [plan, setPlan] = useState("")
    const [color, setColor] = useState("")
    const [name, setName] = useState("")
    const [phone, setPhone] = useState("")
    const [carrier, setCarrier] = useState("")
    const [isAgreed, setIsAgreed] = useState(true)

    const [funnel, setFunnel] = useState(null)

    const inputRef = useRef(null)

    // 선택된 모델에 따른 색상 필터링
    const currentModelColors = useMemo(() => {
        if (!plan) return []
        return DEVICE_COLORS.filter((c) => c.models.includes(plan))
    }, [plan])

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search)
            const source = params.get("f") || params.get("utm_source") || ""

            if (source.toLowerCase().includes("zum")) {
                setFunnel("줌마렐라")
            }
            if (source.toLowerCase().includes("asa")) {
                setFunnel("아사모")
            }
        }
    }, [])

    // ✅ 세션 저장 (키 값을 변경하여 이전 캐시 충돌 방지)
    useEffect(() => {
        let registerType = ""
        if (carrier) {
            registerType = carrier === "KT" ? "기기변경" : "번호이동"
        }

        const data = {
            name: name,
            phone: phone,
            device: plan,
            color: color,
            register: registerType,
            carrier: carrier,
            funnel: funnel,
        }
        // [TIP] 키 이름을 변경하여('preorder_v2') 기존 저장된 잘못된 데이터가 불러와지는 것을 방지
        sessionStorage.setItem("preorder_v2", JSON.stringify(data))
    }, [plan, color, carrier, funnel, name, phone])

    // 유효성 검사 (6단계)
    const isStepValid = () => {
        switch (step) {
            case 1: // 모델
                return !!plan
            case 2: // 색상
                return !!color
            case 3: // 이름
                return name.trim().length > 0
            case 4: // 전화번호
                return phone.replace(/-/g, "").length >= 10
            case 5: // 통신사
                return !!carrier
            case 6: // 약관
                return isAgreed
            default:
                return false
        }
    }

    // 네비게이션
    const handleNext = () => {
        if (!isStepValid()) return
        if (step < 6) {
            setDirection(1)
            setStep((prev) => prev + 1)
        } else {
            handleSubmit()
        }
    }

    const handlePrev = () => {
        if (showTerms) {
            setShowTerms(false)
            return
        }
        if (step > 1) {
            setDirection(-1)
            setStep((prev) => prev - 1)
        }
    }

    const handleKeyDown = (e) => {
        if (e.nativeEvent.isComposing) return
        if (e.key === "Enter" && isStepValid() && !showTerms) {
            if (step < 6) handleNext()
            else handleSubmit()
        }
    }

    // 최종 제출
    const handleSubmit = async () => {
        if (isLoading) return
        setIsLoading(true)

        const registerType = carrier === "KT" ? "기기변경" : "번호이동"

        try {
            const { error } = await supabase.from("preorder-galaxy26").insert([
                {
                    model: plan,
                    color: color,
                    is_colors: true,
                    mobile_carrier: carrier,
                    name: name,
                    phone: phone || null,
                    description: `KT Market Form 신청 (${registerType})`,
                    funnel: funnel,
                },
            ])

            if (error) {
                console.error("Supabase Error:", error)
                alert("제출 중 오류가 발생했습니다.")
            } else {
                window.location.href = "/result-s26"
            }
        } catch (err) {
            console.error(err)
            alert("알 수 없는 오류가 발생했습니다.")
        } finally {
            setIsLoading(false)
        }
    }

    const variants = {
        enter: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (dir) => ({ x: dir < 0 ? 40 : -40, opacity: 0 }),
    }

    const setFocus = (element) => {
        if (element) {
            element.focus({ preventScroll: true })
            inputRef.current = element
        }
    }

    return (
        <div style={styles.container}>
            {/* --- Header --- */}
            <div style={styles.header}>
                {step > 1 ? (
                    <button onClick={handlePrev} style={styles.backButton}>
                        <ChevronLeft />
                    </button>
                ) : (
                    <div style={{ width: 32 }} />
                )}
                <div style={styles.progressContainer}>
                    <div
                        style={{
                            ...styles.progressBar,
                            width: `${(step / 6) * 100}%`,
                        }}
                    />
                </div>
                <div style={{ width: 32 }} />
            </div>

            {/* --- Content --- */}
            <div style={styles.content}>
                <div style={{ marginBottom: 30 }}>
                    <motion.h1
                        key={step}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={styles.title}
                    >
                        {step === 1 && "어떤 모델로\n사전예약 하시겠어요?"}
                        {step === 2 && "원하시는 색상을\n선택해주세요."}
                        {step === 3 && "신청하시는 분의\n성함을 알려주세요."}
                        {step === 4 && "연락 가능한 번호를\n입력해주세요."}
                        {step === 5 && "현재 이용중인\n통신사를 선택해주세요."}
                        {step === 6 && "약관을 확인해주세요"}
                    </motion.h1>
                </div>

                <div style={{ position: "relative", flex: 1 }}>
                    <AnimatePresence custom={direction} mode="wait">
                        <motion.div
                            key={step}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                            }}
                            style={styles.stepWrapper}
                        >
                            {/* STEP 1: 모델 선택 */}
                            {step === 1 && (
                                <div style={styles.listContainer}>
                                    {PLANS.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setPlan(item.id)
                                                // 모델 변경 시 기존 선택된 색상이 유효하지 않으면 초기화
                                                setColor("")
                                                setTimeout(() => {
                                                    setDirection(1)
                                                    setStep(2)
                                                }, 150)
                                            }}
                                            style={{
                                                ...styles.selectBox,
                                                borderColor:
                                                    plan === item.id
                                                        ? COLORS.primary
                                                        : COLORS.border,
                                                backgroundColor:
                                                    plan === item.id
                                                        ? COLORS.primaryLight
                                                        : COLORS.white,
                                            }}
                                        >
                                            <div>
                                                <span style={styles.badge}>
                                                    {item.tag}
                                                </span>
                                                <div style={styles.boxTitle}>
                                                    {item.label}
                                                </div>
                                                <div style={styles.boxDesc}>
                                                    {item.desc}
                                                </div>
                                            </div>
                                            <div
                                                style={{
                                                    ...styles.checkCircle,
                                                    backgroundColor:
                                                        plan === item.id
                                                            ? COLORS.primary
                                                            : COLORS.bgAlt,
                                                }}
                                            >
                                                {plan === item.id && (
                                                    <CheckIcon />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* STEP 2: 색상 선택 */}
                            {step === 2 && (
                                <div style={styles.gridContainer}>
                                    {currentModelColors.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setColor(item.id)
                                                setTimeout(() => {
                                                    setDirection(1)
                                                    setStep(3)
                                                }, 150)
                                            }}
                                            style={{
                                                ...styles.colorItem,
                                                borderColor:
                                                    color === item.id
                                                        ? COLORS.primary
                                                        : COLORS.border,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    ...styles.colorCircle,
                                                    backgroundColor: item.code,
                                                }}
                                            />
                                            <span
                                                style={{
                                                    fontWeight:
                                                        color === item.id
                                                            ? "700"
                                                            : "500",
                                                    color:
                                                        color === item.id
                                                            ? COLORS.primary
                                                            : COLORS.textMain,
                                                }}
                                            >
                                                {item.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* STEP 3: 이름 */}
                            {step === 3 && (
                                <input
                                    ref={setFocus}
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="이름 입력"
                                    style={styles.input}
                                />
                            )}

                            {/* STEP 4: 전화번호 */}
                            {step === 4 && (
                                <input
                                    ref={setFocus}
                                    type="tel"
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(
                                            formatPhoneNumber(e.target.value)
                                        )
                                    }
                                    onKeyDown={handleKeyDown}
                                    placeholder="010-1234-5678"
                                    maxLength={13}
                                    style={styles.input}
                                />
                            )}

                            {/* STEP 5: 통신사 */}
                            {step === 5 && (
                                <div style={styles.gridContainer}>
                                    {CARRIERS.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setCarrier(c)}
                                            style={{
                                                ...styles.gridItem,
                                                borderColor:
                                                    carrier === c
                                                        ? COLORS.primary
                                                        : COLORS.border,
                                                backgroundColor:
                                                    carrier === c
                                                        ? COLORS.primaryLight
                                                        : COLORS.white,
                                                color:
                                                    carrier === c
                                                        ? COLORS.primary
                                                        : COLORS.textMain,
                                                fontWeight:
                                                    carrier === c
                                                        ? "bold"
                                                        : "normal",
                                            }}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* STEP 6: 약관 */}
                            {step === 6 && (
                                <div style={{ marginTop: 20 }}>
                                    <div
                                        style={styles.termsBox}
                                        onClick={() => setIsAgreed(!isAgreed)}
                                    >
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    ...styles.checkBox,
                                                    backgroundColor: isAgreed
                                                        ? COLORS.primary
                                                        : "#E5E5E5",
                                                }}
                                            >
                                                <CheckIcon />
                                            </div>
                                            <span style={styles.termsText}>
                                                이용약관 및 개인정보 수집 동의
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setShowTerms(true)
                                            }}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                padding: "8px",
                                            }}
                                        >
                                            <ChevronRight />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* --- Modal (Terms) --- */}
            <AnimatePresence>
                {showTerms && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={styles.modalBackdrop}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={styles.modalContent}
                        >
                            <h3 style={styles.modalTitle}>약관 상세</h3>
                            <div style={styles.modalScrollArea}>
                                {TERMS_TEXT}
                            </div>
                            <button
                                onClick={() => setShowTerms(false)}
                                style={styles.modalCloseButton}
                            >
                                확인했습니다
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- Bottom Button --- */}
            <div style={styles.footer}>
                <button
                    onClick={step === 6 ? handleSubmit : handleNext}
                    disabled={!isStepValid() || isLoading}
                    style={{
                        ...styles.mainButton,
                        backgroundColor: isStepValid()
                            ? COLORS.primary
                            : COLORS.disabled,
                        cursor:
                            isStepValid() && !isLoading
                                ? "pointer"
                                : "not-allowed",
                        opacity: isLoading ? 0.7 : 1,
                    }}
                >
                    {isLoading
                        ? "처리중..."
                        : step === 6
                            ? "사전예약하기"
                            : "다음"}
                </button>
            </div>
        </div>
    )
}

// --- Icons & Styles ---
const ChevronLeft = () => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#333"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
)
const ChevronRight = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#888"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
)
const CheckIcon = () => (
    <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
)

const styles = {
    container: {
        width: "100%",
        maxWidth: "500px",
        height: "100%",
        minHeight: "700px",
        margin: "0 auto",
        backgroundColor: COLORS.white,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: "20px",
        fontFamily: '"Pretendard", sans-serif',
        position: "relative",
    },
    header: {
        height: "60px",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        justifyContent: "space-between",
    },
    backButton: {
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    progressContainer: {
        flex: 1,
        height: "4px",
        backgroundColor: COLORS.bgAlt,
        borderRadius: "2px",
        margin: "0 16px",
        overflow: "hidden",
    },
    progressBar: {
        height: "100%",
        backgroundColor: COLORS.primary,
        transition: "width 0.3s ease",
    },
    content: {
        flex: 1,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
    },
    title: {
        fontSize: "26px",
        fontWeight: "700",
        color: COLORS.textMain,
        lineHeight: "1.4",
        whiteSpace: "pre-line",
        margin: 0,
    },
    stepWrapper: {
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
    },
    input: {
        width: "100%",
        fontSize: "24px",
        padding: "12px 0",
        border: "none",
        borderBottom: `2px solid ${COLORS.border}`,
        borderRadius: 0,
        outline: "none",
        backgroundColor: "transparent",
        color: COLORS.textMain,
    },
    hint: { fontSize: "14px", color: COLORS.textSub, marginTop: "12px" },
    listContainer: { display: "flex", flexDirection: "column", gap: "12px" },
    selectBox: {
        width: "100%",
        padding: "20px",
        borderRadius: "16px",
        borderWidth: "2px",
        borderStyle: "solid",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        cursor: "pointer",
        transition: "all 0.2s",
        textAlign: "left",
    },
    badge: {
        fontSize: "12px",
        color: COLORS.primary,
        fontWeight: "700",
        marginBottom: "4px",
        display: "block",
        textTransform: "uppercase",
    },
    boxTitle: {
        fontSize: "18px",
        fontWeight: "700",
        color: COLORS.textMain,
        marginBottom: "4px",
    },
    boxDesc: { fontSize: "14px", color: COLORS.textSub },
    checkCircle: {
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.2s",
    },
    gridContainer: {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "10px",
    },
    colorItem: {
        padding: "20px",
        borderRadius: "16px",
        borderWidth: "2px",
        borderStyle: "solid",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        cursor: "pointer",
        transition: "all 0.2s",
        backgroundColor: COLORS.white,
    },
    colorCircle: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        border: "1px solid rgba(0,0,0,0.1)",
    },
    gridItem: {
        padding: "16px",
        borderRadius: "12px",
        borderWidth: "1px",
        borderStyle: "solid",
        fontSize: "16px",
        cursor: "pointer",
        transition: "all 0.2s",
    },
    termsBox: {
        width: "100%",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 0",
        backgroundColor: "transparent",
        borderBottom: `1px solid ${COLORS.border}`,
        cursor: "pointer",
    },
    checkBox: {
        width: "24px",
        height: "24px",
        borderRadius: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.2s",
    },
    termsText: { fontSize: "16px", color: COLORS.textMain, fontWeight: "500" },
    modalBackdrop: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: COLORS.overlay,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
        padding: "24px",
    },
    modalContent: {
        width: "100%",
        maxHeight: "80%",
        backgroundColor: COLORS.white,
        borderRadius: "16px",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    },
    modalTitle: {
        margin: "0 0 16px 0",
        fontSize: "18px",
        fontWeight: "700",
        color: COLORS.textMain,
    },
    modalScrollArea: {
        flex: 1,
        overflowY: "auto",
        fontSize: "14px",
        color: COLORS.textSub,
        lineHeight: "1.6",
        whiteSpace: "pre-wrap",
        marginBottom: "20px",
        paddingRight: "8px",
        borderTop: `1px solid ${COLORS.border}`,
        paddingTop: "12px",
    },
    modalCloseButton: {
        width: "100%",
        padding: "14px",
        backgroundColor: COLORS.primary,
        color: "white",
        border: "none",
        borderRadius: "10px",
        fontSize: "15px",
        fontWeight: "700",
        cursor: "pointer",
    },
    footer: {
        padding: "20px 24px 30px",
        borderTop: `1px solid ${COLORS.bgAlt}`,
    },
    mainButton: {
        width: "100%",
        height: "56px",
        borderRadius: "14px",
        border: "none",
        color: "white",
        fontSize: "17px",
        fontWeight: "700",
        transition: "background-color 0.2s, opacity 0.2s",
    },
}
