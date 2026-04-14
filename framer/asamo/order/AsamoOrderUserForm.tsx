import * as React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { addPropertyControls, ControlType } from "framer"

interface Props {
    userName: string
    userDob: string
    userPhone: string
    asamoId: string
    joinType: string
    contract: string
    discountType: string
    planName: string
    planData: string
    planPrice: string
    requirements?: string
    deviceModel: string
    deviceCapacity: string
    deviceColor: string
    telecomCompany: string
    funnel: string
    onConfirm?: (data: any) => void
    isReadOnly?: boolean
}

const PLAN_69_VARIANTS = {
    video: {
        name: "기존 데이터ON 비디오",
        description: "데이터 100GB + 다쓰면 최대 5Mbps",
    },
    simple: {
        name: "5G 심플 110GB",
        description: "데이터 110GB + 다쓰면 5Mbps",
    },
}

export default function OrderUserForm(props: Props) {
    const [isEditing, setIsEditing] = useState(false)
    const [isResultPage, setIsResultPage] = useState(false)
    const [isTermExpanded, setIsTermExpanded] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [agreement, setAgreement] = useState(true)
    const [isInitialEntry, setIsInitialEntry] = useState(true)
    const [inlineError, setInlineError] = useState("")
    const [modalError, setModalError] = useState("")

    const subscriberRef = useRef<HTMLDivElement>(null)
    const isProcessing = useRef(false)

    const [formData, setFormData] = useState({
        userName: props.userName,
        userDob: props.userDob,
        userPhone: props.userPhone,
        asamoId: props.asamoId,
        requirements: props.requirements || "",
    })

    const [displayPlan, setDisplayPlan] = useState({
        name: props.planName,
        data: props.planData,
    })

    const [touched, setTouched] = useState({
        userName: false,
        userDob: false,
        userPhone: false,
    })

    useEffect(() => {
        if (typeof window !== "undefined") {
            if (window.location.pathname.includes("/asamo-page/asamo-result")) {
                setIsResultPage(true)
            }
        }
    }, [])

    useEffect(() => {
        setFormData({
            userName: props.userName,
            userDob: props.userDob,
            userPhone: props.userPhone,
            asamoId: props.asamoId,
            requirements: props.requirements || "",
        })
    }, [
        props.userName,
        props.userDob,
        props.userPhone,
        props.asamoId,
        props.requirements,
    ])

    useEffect(() => {
        const hasInitialValue =
            !!props.userName ||
            !!props.userDob ||
            !!props.userPhone ||
            !!props.asamoId ||
            !!props.requirements

        setIsInitialEntry(!hasInitialValue)
        setIsEditing(!props.isReadOnly && !hasInitialValue)
    }, [
        props.userName,
        props.userDob,
        props.userPhone,
        props.asamoId,
        props.requirements,
        props.isReadOnly,
    ])

    useEffect(() => {
        if (!inlineError) return
        const timer = setTimeout(() => setInlineError(""), 4000)
        return () => clearTimeout(timer)
    }, [inlineError])

    useEffect(() => {
        let name = props.planName || PLAN_69_VARIANTS.video.name
        let data = props.planData || PLAN_69_VARIANTS.video.description
        if (typeof window !== "undefined") {
            try {
                const sessionData = sessionStorage.getItem("asamoDeal")
                if (sessionData) {
                    const parsed = JSON.parse(sessionData)
                    const pId = parsed.selectedPlanId
                    if (pId === "plan_69_v") {
                        name = PLAN_69_VARIANTS.simple.name
                        data = PLAN_69_VARIANTS.simple.description
                    } else if (pId === "plan_69") {
                        name = PLAN_69_VARIANTS.video.name
                        data = PLAN_69_VARIANTS.video.description
                    }
                }
            } catch (e) {
                console.error("Session check failed", e)
            }
        }
        setDisplayPlan({ name, data })
    }, [props.planName, props.planData])

    const isDobValid = formData.userDob.length === 6
    const isPhoneValid = formData.userPhone.length === 11
    const isNameValid = formData.userName && formData.userName.trim() !== ""
    const isUserInfoComplete = isNameValid && isDobValid && isPhoneValid
    const showInputForm = isEditing

    const handleChange = (field: string, value: string) => {
        if (field === "userDob" || field === "userPhone") {
            const limit = field === "userDob" ? 6 : 11
            const numericValue = value.replace(/[^0-9]/g, "").slice(0, limit)
            setFormData((prev) => ({ ...prev, [field]: numericValue }))
            return
        }
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleBlur = (field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }))
    }
    const toggleTermExpand = () => {
        setIsTermExpanded(!isTermExpanded)
    }

    const handleSaveInput = useCallback(() => {
        setTouched({ userName: true, userDob: true, userPhone: true })

        if (isUserInfoComplete) {
            setIsEditing(false)
            setIsInitialEntry(false)
        } else {
            setInlineError("이름, 생년월일, 연락처를 모두 올바르게 입력해주세요.")
        }
    }, [isUserInfoComplete])

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>
        if (showInputForm && isUserInfoComplete && isInitialEntry) {
            timer = setTimeout(() => {
                handleSaveInput()
            }, 1000)
        }
        return () => clearTimeout(timer)
    }, [showInputForm, isUserInfoComplete, isInitialEntry, handleSaveInput])

    const handleFinalConfirm = async () => {
        if (isLoading || isProcessing.current) return
        if (!agreement) {
            setModalError("개인정보 수집 및 이용 동의가 필요합니다.")
            return
        }

        isProcessing.current = true
        setIsLoading(true)
        setModalError("")

        try {
            if (props.onConfirm) {
                await props.onConfirm({
                    userName: formData.userName,
                    userDob: formData.userDob,
                    userPhone: formData.userPhone,
                    asamoId: formData.asamoId,
                    requirements: formData.requirements,
                    planName: displayPlan.name,
                    planData: displayPlan.data,
                })
            }
        } catch (e: any) {
            console.error(e)
            setModalError("처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.")
        } finally {
            setIsLoading(false)
            isProcessing.current = false
        }
    }

    const discountText =
        props.discountType === "plan"
            ? "선택약정 (요금할인)"
            : "공시지원금 (기기할인)"

    return (
        <div style={{ ...containerStyle, ...animationStyle }}>
            <div style={headerStyle} ref={subscriberRef}>
                <div style={iconCircleStyle}>
                    <UserIcon />
                </div>
                <div style={headerTitleStyle}>가입자 정보</div>
            </div>
            <div style={listStyle}>
                {showInputForm ? (
                    <div
                        key="input-form"
                        style={{ animation: "fadeIn 0.4s ease" }}
                    >
                        <InputGroup
                            label="이름"
                            value={formData.userName}
                            onChange={(e: any) =>
                                handleChange("userName", e.target.value)
                            }
                            onBlur={() => handleBlur("userName")}
                            placeholder="실명 입력"
                            error={
                                touched.userName && !isNameValid
                                    ? "이름을 입력해주세요"
                                    : undefined
                            }
                        />
                        <InputGroup
                            label="생년월일 (6자리)"
                            placeholder="예: 900101"
                            value={formData.userDob}
                            maxLength={6}
                            inputMode="numeric"
                            autoComplete="bday"
                            pattern="[0-9]*"
                            onChange={(e: any) =>
                                handleChange("userDob", e.target.value)
                            }
                            onBlur={() => handleBlur("userDob")}
                            error={
                                touched.userDob && !isDobValid
                                    ? "생년월일 6자리를 입력해주세요"
                                    : undefined
                            }
                        />
                        <InputGroup
                            label="휴대폰 번호"
                            placeholder="숫자만 입력"
                            value={formData.userPhone}
                            maxLength={11}
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel-national"
                            onChange={(e: any) =>
                                handleChange("userPhone", e.target.value)
                            }
                            onBlur={() => handleBlur("userPhone")}
                            error={
                                touched.userPhone && !isPhoneValid
                                    ? "휴대폰 번호 11자리를 입력해주세요"
                                    : undefined
                            }
                        />
                        <InputGroup
                            label="아사모 ID"
                            value={formData.asamoId}
                            onChange={(e: any) =>
                                handleChange("asamoId", e.target.value)
                            }
                            placeholder="아사모 아이디 입력"
                        />
                        <InputGroup
                            label="요청사항 (선택)"
                            placeholder="예: 기존 유심 그대로 사용하고 싶어요"
                            value={formData.requirements}
                            onChange={(e: any) =>
                                handleChange("requirements", e.target.value)
                            }
                        />
                        <button
                            style={{
                                ...smallButtonStyle,
                                width: "100%",
                                marginTop: "20px",
                                padding: "16px",
                                backgroundColor: isUserInfoComplete
                                    ? "#333D4B"
                                    : "#E5E8EB",
                                color: isUserInfoComplete
                                    ? "#FFFFFF"
                                    : "#B0B8C1",
                                fontWeight: 700,
                                fontSize: "15px",
                                borderRadius: "12px",
                                transition: "all 0.2s",
                            }}
                            onClick={handleSaveInput}
                        >
                            {isUserInfoComplete && isInitialEntry
                                ? "입력 완료 (자동 저장 중...)"
                                : "입력 완료"}
                        </button>
                    </div>
                ) : (
                    <div
                        key="summary-view"
                        style={{
                            animation: "fadeIn 0.4s ease",
                            display: "flex",
                            flexDirection: "column",
                            gap: "20px",
                        }}
                    >
                        <InfoRow
                            label="이름"
                            value={formData.userName}
                            hasButton={!props.isReadOnly}
                            buttonLabel="수정"
                            onEdit={() => {
                                setIsEditing(true)
                                setIsInitialEntry(false)
                            }}
                        />
                        <InfoRow label="생년월일" value={formData.userDob} />
                        <InfoRow
                            label="휴대폰 번호"
                            value={formData.userPhone}
                        />
                        <InfoRow label="아사모 ID" value={formData.asamoId} />
                        {formData.requirements && (
                            <InfoRow
                                label="요청사항"
                                value={formData.requirements}
                            />
                        )}
                    </div>
                )}
            </div>
            <div style={dividerStyle} />
            <div style={headerStyle}>
                <div style={{ ...iconCircleStyle, backgroundColor: "#8B5CF6" }}>
                    <PhoneIcon />
                </div>
                <div style={headerTitleStyle}>개통 정보</div>
            </div>
            <div style={listStyle}>
                <InfoRow label="할인 유형" value={discountText} />
                <InfoRow label="약정" value={props.contract} />
                <InfoRow label="가입유형" value={props.joinType} />
            </div>
            <div style={dividerStyle} />
            <div style={headerStyle}>
                <div style={{ ...iconCircleStyle, backgroundColor: "#22C55E" }}>
                    <PlanIcon />
                </div>
                <div style={headerTitleStyle}>요금제 정보</div>
            </div>
            <div style={listStyle}>
                <InfoRow label="이름" value={displayPlan.name} />
                <InfoRow label="데이터" value={displayPlan.data} />
                <InfoRow label="월 금액" value={props.planPrice} />
            </div>
            <div style={warningBoxStyle}>
                <div style={warningIconStyle}>i</div>
                <div style={warningTextStyle}>
                    <div style={{ fontWeight: 700, marginBottom: "4px" }}>
                        최소 6개월간 요금제를 유지해주세요.
                    </div>
                    <div style={{ color: "#6B7280", fontSize: "13px" }}>
                        6개월 뒤에는 LTE/5G 47,000원 이상 요금제로 변경할 수
                        있어요.
                    </div>
                </div>
            </div>
            {inlineError && (
                <div style={inlineErrorStyle}>{inlineError}</div>
            )}
            {!isResultPage && (
                <div style={bottomContainerStyle}>
                    <div style={termsSectionStyle}>
                        <div
                            style={termHeaderContainerStyle}
                            onClick={() => {
                                setAgreement(!agreement)
                                setModalError("")
                            }}
                        >
                            <Checkbox checked={agreement} />
                            <span style={termHeaderTitleStyle}>
                                개인정보 수집 및 이용 동의 (필수)
                            </span>
                            <div
                                style={termExpandIconStyle}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    toggleTermExpand()
                                }}
                            >
                                <ChevronDown
                                    style={{
                                        transform: isTermExpanded
                                            ? "rotate(180deg)"
                                            : "rotate(0deg)",
                                        transition: "transform 0.2s",
                                    }}
                                />
                            </div>
                        </div>
                        {isTermExpanded && (
                            <div style={termDetailContainerStyle}>
                                <div style={termDescriptionStyle}>
                                    1. [필수] 개인정보 수집 이용 동의
                                    <br />
                                    고객님이 입력한 개인정보는 '정보통신망
                                    이용촉진 및 정보보호 등 에 관한 법률'에 따라
                                    KT마켓이 수집,
                                    <br />
                                    이용 및 처리 위탁 시 본인의 동의를 얻어야
                                    하는 정보입니다.
                                    <br />
                                    입력하신 개인정보는 아래의 목적으로 관련
                                    업체에만 제공되며, 이외의 목적으로는
                                    활용되지 않습니다.
                                </div>
                                <div style={termTableStyle}>
                                    <div style={termTableRowStyle}>
                                        <div style={termTableHeaderStyle}>
                                            개인정보 수집
                                            <br />및 이용목적
                                        </div>
                                        <div style={termTableCellStyle}>
                                            상품 신청 및 상담, KT 전산조회,
                                            개통, 배송
                                        </div>
                                    </div>
                                    <div style={termTableRowStyle}>
                                        <div style={termTableHeaderStyle}>
                                            수집하는 개인정
                                            <br />보 항목
                                        </div>
                                        <div style={termTableCellStyle}>
                                            고객명,생년월일,전화번호(연락처)
                                        </div>
                                    </div>
                                    <div
                                        style={{
                                            ...termTableRowStyle,
                                            borderBottom: "none",
                                        }}
                                    >
                                        <div style={termTableHeaderStyle}>
                                            개인정보 보유
                                            <br />및 이용기간
                                        </div>
                                        <div style={termTableCellStyle}>
                                            <span
                                                style={{
                                                    color: "#EF4444",
                                                    fontWeight: 600,
                                                }}
                                            >
                                                상담 요청일로부터 6개월까지
                                                보관/이용 후 파기
                                            </span>
                                            <br />
                                            (단, 관계법령의 규정에 의하여 보존할
                                            필요가 있는 경우 관련 법령에 따라
                                            보관)
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {modalError && (
                            <div style={bottomErrorStyle}>{modalError}</div>
                        )}
                    </div>
                    <button
                        style={confirmButtonStyle}
                        onClick={() => {
                            if (!isUserInfoComplete) {
                                setTouched({
                                    userName: true,
                                    userDob: true,
                                    userPhone: true,
                                })
                                subscriberRef.current?.scrollIntoView({
                                    behavior: "smooth",
                                    block: "center",
                                })
                                setIsEditing(true)
                                return
                            }
                            handleFinalConfirm()
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? "처리 중..." : "주문하기"}
                    </button>
                </div>
            )}
        </div>
    )
}

// --- Icons & Styles ---
const ChevronDown = ({ style }: { style?: React.CSSProperties }) => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#1d1d1f"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
    >
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
)
const UserIcon = () => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
    </svg>
)
const PhoneIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
    </svg>
)
const PlanIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <line x1="18" y1="20" x2="18" y2="10"></line>
        <line x1="12" y1="20" x2="12" y2="4"></line>
        <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
)

const Checkbox = ({ checked }: { checked: boolean }) => (
    <div
        style={{
            width: "24px",
            height: "24px",
            borderRadius: "4px",
            border: checked ? "none" : "1px solid #D1D5DB",
            backgroundColor: checked ? "#4285F4" : "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "12px",
            flexShrink: 0,
            transition: "0.2s",
        }}
    >
        {checked && (
            <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
        )}
    </div>
)

const InfoRow = ({
    label,
    value,
    hasButton = false,
    onEdit,
    buttonLabel = "수정",
}: any) => (
    <div style={rowStyle}>
        <span style={labelStyle}>{label}</span>
        <div style={valueContainerStyle}>
            <span style={valueStyle}>{value}</span>
            {hasButton && (
                <button style={smallButtonStyle} onClick={onEdit}>
                    {buttonLabel}
                </button>
            )}
        </div>
    </div>
)

const InputGroup = ({
    label,
    value,
    onChange,
    onBlur,
    placeholder,
    maxLength,
    error,
    type = "text",
    inputMode,
    autoComplete,
    pattern,
}: any) => (
    <div style={{ marginBottom: "20px" }}>
        <div style={{ ...inputLabelStyle, marginBottom: "8px" }}>{label}</div>
        <input
            type={type}
            inputMode={inputMode}
            autoComplete={autoComplete}
            pattern={pattern}
            style={{
                ...inputStyle,
                border: error ? "1px solid #EF4444" : "1px solid #E5E7EB",
            }}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            maxLength={maxLength}
        />
        {error && (
            <div
                style={{ color: "#EF4444", fontSize: "13px", marginTop: "6px" }}
            >
                {error}
            </div>
        )}
    </div>
)

// --- Styles ---
if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style")
    styleSheet.innerText = `
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    `
    if (!document.getElementById("framer-custom-styles")) {
        styleSheet.id = "framer-custom-styles"
        document.head.appendChild(styleSheet)
    }
}

const animationStyle: React.CSSProperties = {
    animation: "fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
}
const containerStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    paddingTop: "20px",
    backgroundColor: "#FFFFFF",
    paddingBottom: "40px",
    minHeight: "400px",
    position: "relative",
    overflow: "hidden",
}
const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
}
const iconCircleStyle: React.CSSProperties = {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#3B82F6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}
const headerTitleStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 700,
    color: "#191F28",
}
const listStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    marginBottom: "10px",
}
const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
}
const labelStyle: React.CSSProperties = {
    fontSize: "15px",
    color: "#8B95A1",
    width: "100px",
    fontWeight: 500,
    lineHeight: "1.4",
}
const valueContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
}
const valueStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 500,
    color: "#333D4B",
    lineHeight: "1.4",
}
const smallButtonStyle: React.CSSProperties = {
    padding: "6px 12px",
    fontSize: "13px",
    color: "#4E5968",
    backgroundColor: "#F2F4F6",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 500,
}
const dividerStyle: React.CSSProperties = {
    width: "100%",
    height: "2px",
    backgroundColor: "#F2F4F6",
    margin: "30px 0",
}
const warningBoxStyle: React.CSSProperties = {
    backgroundColor: "#F2F4F6",
    borderRadius: "16px",
    padding: "20px",
    display: "flex",
    gap: "12px",
    marginTop: "10px",
}
const warningIconStyle: React.CSSProperties = {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    backgroundColor: "#4B5563",
    color: "white",
    fontSize: "12px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "serif",
    flexShrink: 0,
    marginTop: "2px",
}
const warningTextStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#191F28",
    lineHeight: "1.5",
}
const inputLabelStyle: React.CSSProperties = {
    fontSize: "15px",
    color: "#8B95A1",
    fontWeight: 500,
}
const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "16px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "1px solid #E5E7EB",
    backgroundColor: "#FFFFFF",
    color: "#191F28",
    outline: "none",
    boxSizing: "border-box",
}
const bottomContainerStyle: React.CSSProperties = {
    paddingTop: "40px",
    marginTop: "auto",
    padding: "20px 20px 40px 20px",
}
const confirmButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "18px",
    backgroundColor: "#4285F4",
    color: "white",
    fontSize: "17px",
    fontWeight: 700,
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "background 0.2s",
}
const inlineErrorStyle: React.CSSProperties = {
    margin: "0 20px",
    padding: "12px 16px",
    backgroundColor: "#FFF1F1",
    border: "1px solid #FFCDD2",
    borderRadius: "10px",
    fontSize: "13px",
    color: "#D32F2F",
    lineHeight: "1.5",
}
const termsSectionStyle: React.CSSProperties = {
    backgroundColor: "#FFFFFF",
    border: "1px solid #E5E8EB",
    borderRadius: "16px",
    padding: "18px 16px",
    marginBottom: "14px",
}
const termHeaderContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    cursor: "pointer",
}
const termHeaderTitleStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 700,
    color: "#191F28",
    flex: 1,
}
const termExpandIconStyle: React.CSSProperties = {
    padding: "8px",
    cursor: "pointer",
}
const termDetailContainerStyle: React.CSSProperties = {
    padding: "0 0 20px 0",
}
const termDescriptionStyle: React.CSSProperties = {
    fontSize: "13px",
    color: "#6B7280",
    lineHeight: "1.5",
    marginBottom: "20px",
}
const termTableStyle: React.CSSProperties = {
    border: "1px solid #E5E7EB",
    borderRadius: "8px",
    overflow: "hidden",
}
const termTableRowStyle: React.CSSProperties = {
    display: "flex",
    borderBottom: "1px solid #E5E7EB",
}
const termTableHeaderStyle: React.CSSProperties = {
    width: "100px",
    backgroundColor: "#F9FAFB",
    padding: "12px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#374151",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    borderRight: "1px solid #E5E7EB",
    boxSizing: "border-box",
}
const termTableCellStyle: React.CSSProperties = {
    flex: 1,
    padding: "12px",
    fontSize: "13px",
    color: "#374151",
    lineHeight: "1.5",
    backgroundColor: "#FFFFFF",
    boxSizing: "border-box",
}
const bottomErrorStyle: React.CSSProperties = {
    marginTop: "16px",
    padding: "10px 14px",
    backgroundColor: "#FFF1F1",
    border: "1px solid #FFCDD2",
    borderRadius: "8px",
    fontSize: "13px",
    color: "#D32F2F",
    lineHeight: "1.5",
}

addPropertyControls(OrderUserForm, {
    userName: {
        type: ControlType.String,
        defaultValue: "홍길동",
        title: "이름",
    },
    userDob: {
        type: ControlType.String,
        defaultValue: "19880809",
        title: "생년월일",
    },
    userPhone: {
        type: ControlType.String,
        defaultValue: "01012345678",
        title: "전화번호",
    },
    asamoId: { type: ControlType.String, defaultValue: "zzz111", title: "ID" },
    requirements: {
        type: ControlType.String,
        defaultValue: "",
        title: "요청사항",
    },
    telecomCompany: {
        type: ControlType.String,
        defaultValue: "KT",
        title: "통신사(Company)",
    },
    funnel: {
        type: ControlType.String,
        defaultValue: "아사모 공구",
        title: "유입경로(Funnel)",
    },
    joinType: {
        type: ControlType.String,
        defaultValue: "기기변경",
        title: "가입유형",
    },
    contract: {
        type: ControlType.String,
        defaultValue: "24개월",
        title: "약정",
    },
    discountType: {
        type: ControlType.Enum,
        options: ["device", "plan"],
        defaultValue: "device",
        title: "할인유형",
    },
    deviceModel: {
        type: ControlType.String,
        defaultValue: "아이폰17",
        title: "기기모델",
    },
    deviceCapacity: {
        type: ControlType.String,
        defaultValue: "256GB",
        title: "용량",
    },
    deviceColor: {
        type: ControlType.String,
        defaultValue: "라벤더",
        title: "색상",
    },
    planName: {
        type: ControlType.String,
        defaultValue: "기존 데이터ON 비디오",
        title: "요금제명",
    },
    planData: {
        type: ControlType.String,
        defaultValue: "데이터 110GB + 다쓰면 최대 5Mbps",
        title: "데이터",
    },
    planPrice: {
        type: ControlType.String,
        defaultValue: "69,000원",
        title: "요금",
    },
})
