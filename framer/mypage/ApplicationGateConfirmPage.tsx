import * as React from "react"
import { useState, useEffect } from "react"
import { addPropertyControls, ControlType } from "framer"

// --- Skeleton Components ---
const SkeletonBox = ({
    width = "100%",
    height = "20px",
    borderRadius = "8px",
}: {
    width?: string
    height?: string
    borderRadius?: string
}) => (
    <div
        style={{
            width,
            height,
            borderRadius,
            backgroundColor: "#F2F4F6",
            animation: "skeleton-loading 1.5s ease-in-out infinite",
        }}
    />
)

const StepIndicatorSkeleton = () => (
    <div style={stepContainerStyle}>
        <div style={stepItemStyle}>
            <SkeletonBox width="24px" height="24px" borderRadius="50%" />
            <SkeletonBox width="60px" height="11px" borderRadius="4px" />
        </div>
        <SkeletonBox width="60px" height="2px" borderRadius="2px" />
        <div style={stepItemStyle}>
            <SkeletonBox width="24px" height="24px" borderRadius="50%" />
            <SkeletonBox width="70px" height="11px" borderRadius="4px" />
        </div>
        <SkeletonBox width="60px" height="2px" borderRadius="2px" />
        <div style={stepItemStyle}>
            <SkeletonBox width="24px" height="24px" borderRadius="50%" />
            <SkeletonBox width="100px" height="11px" borderRadius="4px" />
        </div>
    </div>
)

const CardSkeleton = () => (
    <div style={{ ...cardStyle, cursor: "default" }}>
        <div style={cardHeaderStyle}>
            <SkeletonBox width="60px" height="60px" borderRadius="10px" />
            <div style={infoWrapperStyle}>
                <SkeletonBox width="150px" height="16px" borderRadius="6px" />
                <div style={{ marginTop: "8px" }}>
                    <SkeletonBox
                        width="100px"
                        height="14px"
                        borderRadius="6px"
                    />
                </div>
                <div style={{ marginTop: "8px" }}>
                    <SkeletonBox
                        width="120px"
                        height="18px"
                        borderRadius="6px"
                    />
                </div>
            </div>
            <SkeletonBox width="20px" height="20px" borderRadius="4px" />
        </div>
        <div style={noticeBoxStyle}>
            <SkeletonBox width="16px" height="16px" borderRadius="50%" />
            <SkeletonBox width="70%" height="13px" borderRadius="6px" />
        </div>
    </div>
)

// --- Icons ---
const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
            d="M10 3L4.5 8.5L2 6"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

const ChevronDown = ({ style }: { style?: React.CSSProperties }) => (
    <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8B95A1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
    >
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
)

const InfoIcon = () => (
    <div
        style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            backgroundColor: "#0066FF",
            color: "white",
            fontSize: "10px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: "6px",
            fontFamily: "serif",
            flexShrink: 0,
        }}
    >
        i
    </div>
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

const WonIcon = () => (
    <div
        style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: "bold",
            color: "white",
            fontFamily: "sans-serif",
        }}
    >
        ₩
    </div>
)

// --- Type Definitions ---
interface OrderSummary {
    petName: string
    capacity: string
    color: string
    price: number
    imageUrl: string
    formLink: string

    devicePrice: number
    installmentPrincipal: number
    ktMarketSubsidy: number
    commonDiscount: number
    doubleStorageDiscount: number
    promotionDiscount: number

    planName: string
    joinType: string
    discountType: string
    contract: number
    showInterest: boolean

    userName: string
    userDob: string
    userPhone: string
    totalMonthPayment: number
}

interface Props {
    nextPageUrl: string
}

// --- 가격 정보 섹션 ---
const PriceInfoSection = ({
    orderInfo,
    formatPrice,
}: {
    orderInfo: OrderSummary
    formatPrice: (price: number) => string
}) => (
    <div style={priceBoxStyle}>
        <PriceRow
            label="출시 가격"
            value={`${formatPrice(orderInfo.devicePrice)}원`}
        />
        {orderInfo.commonDiscount > 0 && (
            <PriceRow
                label="단말 할인 (공통)"
                value={`- ${formatPrice(orderInfo.commonDiscount)}원`}
                isHighlight
            />
        )}
        {orderInfo.promotionDiscount > 0 && (
            <PriceRow
                label="디바이스 추가지원금(단독)"
                value={`- ${formatPrice(orderInfo.promotionDiscount)}원`}
                isHighlight
            />
        )}
        {orderInfo.doubleStorageDiscount > 0 && (
            <PriceRow
                label="512GB 추가지원금(단독)"
                value={`- ${formatPrice(orderInfo.doubleStorageDiscount)}원`}
                isHighlight
            />
        )}
        {orderInfo.ktMarketSubsidy > 0 && (
            <PriceRow
                label="KT마켓 지원금"
                value={`- ${formatPrice(orderInfo.ktMarketSubsidy)}원`}
                isHighlight
            />
        )}
        <div
            style={{
                ...priceRowStyle,
                marginTop: "12px",
                paddingTop: "12px",
                borderTop: "1px solid #E5E8EB",
            }}
        >
            <span
                style={{
                    ...priceLabelStyle,
                    color: "#191F28",
                    fontWeight: 700,
                }}
            >
                최종 구매가
            </span>
            <span
                style={{
                    ...priceValueStyle,
                    fontSize: "18px",
                    fontWeight: 700,
                }}
            >
                {formatPrice(orderInfo.installmentPrincipal)}원
            </span>
        </div>
        <div style={paymentNoticeStyle}>
            <div style={{ marginRight: "8px", marginTop: "2px" }}>
                <InfoIcon />
            </div>
            <div>
                <div
                    style={{
                        fontWeight: 700,
                        fontSize: "13px",
                        color: "#191F28",
                        marginBottom: "4px",
                    }}
                >
                    결제는 나중에 해요
                </div>
                <div
                    style={{
                        fontSize: "12px",
                        color: "#6B7280",
                        lineHeight: "1.4",
                    }}
                >
                    일시불/할부 중 원하는 방법으로 납부할 수 있어요.
                </div>
            </div>
        </div>
    </div>
)

export default function ApplicationGateConfirm(props: Props) {
    const [orderInfo, setOrderInfo] = useState<OrderSummary | null>(null)
    const [isExpanded, setIsExpanded] = useState(false)
    const [isInitialLoading, setIsInitialLoading] = useState(true)

    useEffect(() => {
        loadSessionData()
    }, [])

    const loadSessionData = () => {
        if (typeof window === "undefined") return

        try {
            const sheetStr = sessionStorage.getItem("sheet")
            const dataStr = sessionStorage.getItem("data")
            const userStr = sessionStorage.getItem("user-info")

            let parsedSheet = null
            let parsedData = null
            let parsedUser = null

            if (sheetStr) parsedSheet = JSON.parse(sheetStr)
            if (dataStr) parsedData = JSON.parse(dataStr)
            if (userStr) parsedUser = JSON.parse(userStr)

            if (parsedSheet && parsedData) {
                const link =
                    parsedData.form_link ||
                    parsedData.device?.form_link ||
                    parsedSheet.formLink ||
                    ""

                const devicePrice = parsedSheet.devicePrice || 0
                const installmentPrincipal =
                    parsedSheet.installmentPrincipal || 0
                const ktMarketSubsidy = parsedSheet.ktmarketSubsidy || 0
                const doubleStorageDiscount =
                    parsedSheet.doubleStorageDiscount || 0
                const promotionDiscount = parsedSheet.promotionDiscount || 0

                const totalDiscount = devicePrice - installmentPrincipal
                const commonDiscount =
                    totalDiscount -
                    ktMarketSubsidy -
                    doubleStorageDiscount -
                    promotionDiscount

                const showInterest = sessionStorage.getItem("phone_installment_interest_visible") === "true"
                const displayTotalMonthPayment = showInterest
                    ? (parsedSheet.totalMonthPayment || 0)
                    : (parsedSheet.totalMonthPaymentNoInterest || parsedSheet.totalMonthPayment || 0)

                setOrderInfo({
                    petName: parsedData.device?.pet_name || "기기명 없음",
                    capacity: parsedData.device?.capacity || "",
                    color: parsedData.color?.kr || "",
                    price: displayTotalMonthPayment,
                    imageUrl: parsedData.color?.urls?.[0] || "",
                    formLink: link,
                    devicePrice,
                    installmentPrincipal,
                    ktMarketSubsidy,
                    commonDiscount: commonDiscount > 0 ? commonDiscount : 0,
                    doubleStorageDiscount,
                    promotionDiscount,
                    planName: parsedSheet.planName || "",
                    joinType: parsedData.register || "기기변경",
                    discountType: parsedSheet.discount || "공통지원금",
                    contract: parsedSheet.installment || 24,
                    showInterest: showInterest,
                    userName: parsedUser?.userName || "-",
                    userDob: parsedUser?.userDob || "-",
                    userPhone: parsedUser?.userPhone || "-",
                    totalMonthPayment: displayTotalMonthPayment,
                })
            } else {
                setOrderInfo({
                    petName: "아이폰17",
                    capacity: "256GB",
                    color: "라벤더",
                    price: 417000,
                    imageUrl: "",
                    formLink: "https://example.com/form",
                    devicePrice: 1287000,
                    installmentPrincipal: 417000,
                    ktMarketSubsidy: 420000,
                    commonDiscount: 450000,
                    doubleStorageDiscount: 0,
                    promotionDiscount: 0,
                    planName: "5G 초이스 베이직",
                    joinType: "기기변경",
                    discountType: "공시지원금",
                    contract: 24,
                    showInterest: false,
                    userName: "홍길동",
                    userDob: "990101",
                    userPhone: "01012345678",
                    totalMonthPayment: 90000,
                })
            }

            setTimeout(() => {
                setIsInitialLoading(false)
            }, 300)
        } catch (e) {
            console.error("Session load error:", e)
            setIsInitialLoading(false)
        }
    }

    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/[^0-9]/g, "")
        if (numbers.length <= 3) return numbers
        if (numbers.length <= 7)
            return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
    }

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("ko-KR").format(price)

    const handleContinueWriting = () => {
        if (orderInfo?.formLink) {
            window.open(orderInfo.formLink, "_blank")
        }
    }

    const handleComplete = () => {
        window.location.href = props.nextPageUrl
    }

    // --- 확장 상세 정보 ---
    const ExpandedDetails = () => {
        if (!orderInfo) return null
        return (
            <div style={expandedContentStyle}>
                <div style={dividerStyle} />
                <div style={sectionHeaderStyle}>
                    <div style={iconCircleStyle}>
                        <UserIcon />
                    </div>
                    <div style={headerTitleStyle}>가입자 정보</div>
                </div>
                <div style={listStyle}>
                    <InfoRow label="이름" value={orderInfo.userName} />
                    <InfoRow label="생년월일" value={orderInfo.userDob} />
                    <InfoRow
                        label="연락처"
                        value={formatPhoneNumber(orderInfo.userPhone)}
                    />
                </div>
                <div style={dividerStyle} />
                <div style={sectionHeaderStyle}>
                    <div
                        style={{
                            ...iconCircleStyle,
                            backgroundColor: "#8B5CF6",
                        }}
                    >
                        <PhoneIcon />
                    </div>
                    <div style={headerTitleStyle}>개통 정보</div>
                </div>
                <div style={listStyle}>
                    <InfoRow label="가입유형" value={orderInfo.joinType} />
                    <InfoRow label="할인유형" value={orderInfo.discountType} />
                    <InfoRow
                        label="약정기간"
                        value={`${orderInfo.contract}개월`}
                    />
                </div>
                <div style={dividerStyle} />
                <div style={sectionHeaderStyle}>
                    <div
                        style={{
                            ...iconCircleStyle,
                            backgroundColor: "#22C55E",
                        }}
                    >
                        <PlanIcon />
                    </div>
                    <div style={headerTitleStyle}>요금제 정보</div>
                </div>
                <div style={listStyle}>
                    <InfoRow label="요금제명" value={orderInfo.planName} />
                    <InfoRow
                        label={`월 납부액 (${orderInfo.showInterest ? "할부이자 포함" : "할부이자 미포함"})`}
                        value={`${formatPrice(orderInfo.price)}원`}
                    />
                </div>
                <div style={dividerStyle} />
                <div style={sectionHeaderStyle}>
                    <div
                        style={{
                            ...iconCircleStyle,
                            backgroundColor: "#FFCC00",
                        }}
                    >
                        <WonIcon />
                    </div>
                    <div style={headerTitleStyle}>가격 정보</div>
                </div>
                <PriceInfoSection
                    orderInfo={orderInfo}
                    formatPrice={formatPrice}
                />
            </div>
        )
    }

    if (isInitialLoading) {
        return (
            <div style={containerStyle}>
                <StepIndicatorSkeleton />
                <div style={titleContainerStyle}>
                    <SkeletonBox
                        width="200px"
                        height="26px"
                        borderRadius="8px"
                    />
                    <div style={{ marginTop: "12px" }}>
                        <SkeletonBox
                            width="150px"
                            height="26px"
                            borderRadius="8px"
                        />
                    </div>
                </div>
                <div style={contentContainerStyle}>
                    <SkeletonBox
                        width="100px"
                        height="16px"
                        borderRadius="6px"
                    />
                    <div style={{ marginTop: "12px" }}>
                        <CardSkeleton />
                    </div>
                </div>
                <div style={bottomContainerStyle}>
                    <SkeletonBox
                        width="100%"
                        height="56px"
                        borderRadius="16px"
                    />
                </div>
            </div>
        )
    }

    return (
        <div style={containerStyle}>
            {/* 스텝 인디케이터 */}
            <div style={stepContainerStyle}>
                <div style={stepItemStyle}>
                    <div style={{ ...stepCircleStyle, ...activeStepStyle }}>
                        <CheckIcon />
                    </div>
                    <span style={{ ...stepTextStyle, color: "#191F28" }}>
                        구매 신청
                    </span>
                </div>
                <div style={stepLineStyle(true)} />
                <div style={stepItemStyle}>
                    <div style={{ ...stepCircleStyle, ...activeStepStyle }}>
                        2
                    </div>
                    <span
                        style={{
                            ...stepTextStyle,
                            color: "#0066FF",
                            fontWeight: 700,
                        }}
                    >
                        신청서 작성
                    </span>
                </div>
                <div style={stepLineStyle(false)} />
                <div style={stepItemStyle}>
                    <div style={stepCircleStyle}>3</div>
                    <span style={stepTextStyle}>신청서 확인 요청</span>
                </div>
            </div>

            <div style={titleContainerStyle}>
                <h1 style={titleStyle}>
                    KT 신청서 작성을
                    <br />
                    모두 완료하셨나요?
                </h1>
            </div>

            {orderInfo && (
                <div style={contentContainerStyle}>
                    <div style={subTitleStyle}>내 신청 정보</div>
                    <div
                        style={cardStyle}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <div style={cardHeaderStyle}>
                            <div style={imageWrapperStyle}>
                                {orderInfo.imageUrl ? (
                                    <img
                                        src={orderInfo.imageUrl}
                                        alt="Device"
                                        style={imgStyle}
                                    />
                                ) : (
                                    <div
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            background: "#eee",
                                        }}
                                    />
                                )}
                            </div>
                            <div style={infoWrapperStyle}>
                                <div style={deviceNameStyle}>
                                    {orderInfo.petName}
                                </div>
                                <div style={deviceOptionStyle}>
                                    {orderInfo.capacity} · {orderInfo.color}
                                </div>
                                <div style={priceStyleBlue}>
                                    월 {formatPrice(orderInfo.totalMonthPayment)}원
                                </div>
                            </div>
                            <div style={arrowIconStyle}>
                                <ChevronDown
                                    style={{
                                        transform: isExpanded
                                            ? "rotate(180deg)"
                                            : "rotate(0deg)",
                                        transition: "transform 0.3s",
                                    }}
                                />
                            </div>
                        </div>

                        {isExpanded && <ExpandedDetails />}

                        {!isExpanded && (
                            <div style={noticeBoxStyle}>
                                <InfoIcon />
                                <span>
                                    신청서 작성 전에는 가격이 바뀔 수 있어요
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 버튼 영역 */}
            <div style={bottomContainerStyle}>
                <button
                    style={{
                        ...buttonStyle,
                        backgroundColor: "#F2F4F6",
                        color: "#191F28",
                        marginBottom: "12px",
                    }}
                    onClick={(e) => {
                        e.stopPropagation()
                        handleContinueWriting()
                    }}
                >
                    이어서 작성하기
                </button>
                <button
                    style={buttonStyle}
                    onClick={(e) => {
                        e.stopPropagation()
                        handleComplete()
                    }}
                >
                    작성 완료
                </button>
            </div>
        </div>
    )
}

// --- Sub Components ---
const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div style={rowStyle}>
        <span style={labelStyle}>{label}</span>
        <div style={valueContainerStyle}>
            <span style={valueStyle}>{value}</span>
        </div>
    </div>
)

const PriceRow = ({
    label,
    value,
    isHighlight,
}: {
    label: string
    value: string
    isHighlight?: boolean
}) => (
    <div style={priceRowStyle}>
        <span style={priceLabelStyle}>{label}</span>
        <span
            style={{
                ...priceValueStyle,
                color: isHighlight ? "#0066FF" : "#6B7280",
            }}
        >
            {value}
        </span>
    </div>
)

// --- Styles ---
const containerStyle: React.CSSProperties = {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    maxWidth: "440px",
    margin: "0 auto",
}

const stepContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "30px 0 20px 0",
    marginBottom: "20px",
}
const stepItemStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    zIndex: 1,
}
const stepCircleStyle: React.CSSProperties = {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#F2F4F6",
    color: "#B0B8C1",
    fontSize: "12px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}
const activeStepStyle: React.CSSProperties = {
    backgroundColor: "#0066FF",
    color: "white",
}
const stepTextStyle: React.CSSProperties = {
    fontSize: "11px",
    color: "#B0B8C1",
    fontWeight: 500,
}
const stepLineStyle = (isActive: boolean): React.CSSProperties => ({
    width: "60px",
    height: "2px",
    backgroundColor: isActive ? "#0066FF" : "#F2F4F6",
    margin: "0 4px 18px 4px",
})
const titleContainerStyle: React.CSSProperties = {
    padding: "0 20px",
    marginBottom: "40px",
}
const titleStyle: React.CSSProperties = {
    fontSize: "26px",
    fontWeight: 700,
    color: "#191F28",
    lineHeight: "1.4",
    margin: 0,
}
const contentContainerStyle: React.CSSProperties = {
    padding: "0 20px",
    flex: 1,
    paddingBottom: "40px",
    overflowY: "auto",
}
const subTitleStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 600,
    color: "#191F28",
    marginBottom: "12px",
}
const cardStyle: React.CSSProperties = {
    border: "1px solid #E5E8EB",
    borderRadius: "20px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
    cursor: "pointer",
    transition: "all 0.3s ease",
}
const cardHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: "10px",
}
const imageWrapperStyle: React.CSSProperties = {
    width: "60px",
    height: "60px",
    borderRadius: "10px",
    overflow: "hidden",
    marginRight: "16px",
    backgroundColor: "#F9FAFB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}
const imgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
}
const infoWrapperStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
}
const deviceNameStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 700,
    color: "#191F28",
    marginBottom: "4px",
}
const deviceOptionStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#8B95A1",
    marginBottom: "4px",
}
const priceStyleBlue: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 700,
    color: "#0066FF",
}
const arrowIconStyle: React.CSSProperties = { marginTop: "4px" }
const noticeBoxStyle: React.CSSProperties = {
    backgroundColor: "#F9FAFB",
    borderRadius: "12px",
    padding: "14px",
    display: "flex",
    alignItems: "center",
    fontSize: "13px",
    color: "#333D4B",
    fontWeight: 500,
    marginTop: "10px",
}

const expandedContentStyle: React.CSSProperties = {
    animation: "fadeIn 0.3s ease",
}
const dividerStyle: React.CSSProperties = {
    width: "100%",
    height: "2px",
    backgroundColor: "#F2F4F6",
    margin: "30px 0",
}
const sectionHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
}
const iconCircleStyle: React.CSSProperties = {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#0066FF",
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
    gap: "20px",
    padding: "0 4px",
}
const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "24px",
}
const labelStyle: React.CSSProperties = {
    fontSize: "15px",
    color: "#8B95A1",
    width: "100px",
    fontWeight: 500,
    textAlign: "left",
    flexShrink: 0,
}
const valueContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
    justifyContent: "flex-start",
}
const valueStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 500,
    color: "#333D4B",
}

const priceBoxStyle: React.CSSProperties = {
    backgroundColor: "#F9FAFB",
    borderRadius: "16px",
    padding: "20px",
}
const priceRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    alignItems: "center",
}
const priceLabelStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#8B95A1",
    fontWeight: 500,
}
const priceValueStyle: React.CSSProperties = {
    fontSize: "15px",
    fontWeight: 600,
}
const paymentNoticeStyle: React.CSSProperties = {
    marginTop: "20px",
    padding: "16px",
    backgroundColor: "#F2F4F6",
    borderRadius: "12px",
    display: "flex",
    alignItems: "flex-start",
}

const bottomContainerStyle: React.CSSProperties = {
    padding: "20px",
    paddingBottom: "40px",
    marginTop: "auto",
    backgroundColor: "#fff",
}

const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: "18px",
    backgroundColor: "#0066FF",
    color: "white",
    fontSize: "17px",
    fontWeight: 700,
    border: "none",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "background 0.2s",
}

if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style")
    styleSheet.innerText = `
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes skeleton-loading {
            0% { opacity: 1; }
            50% { opacity: 0.4; }
            100% { opacity: 1; }
        }
    `
    if (!document.getElementById("framer-confirm-styles")) {
        styleSheet.id = "framer-confirm-styles"
        document.head.appendChild(styleSheet)
    }
}

addPropertyControls(ApplicationGateConfirm, {
    nextPageUrl: {
        type: ControlType.String,
        title: "완료 후 이동 경로",
        defaultValue: "/phone/write/confirm",
        description: "작성 완료 버튼 클릭 시 이동할 페이지 URL입니다.",
    },
})
