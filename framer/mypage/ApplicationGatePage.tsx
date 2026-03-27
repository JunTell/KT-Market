import { addPropertyControls, ControlType } from "framer"
import * as React from "react"
import { useState, useEffect } from "react"

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

const PriceAlertSkeleton = () => (
    <div
        style={{
            ...priceAlertContainerStyle,
            height: "180px",
            alignItems: "center",
        }}
    >
        <SkeletonBox width="60px" height="14px" borderRadius="4px" />
        <div style={{ marginTop: "16px" }}>
            <SkeletonBox width="180px" height="20px" borderRadius="6px" />
        </div>
        <div style={{ marginTop: "8px" }}>
            <SkeletonBox width="140px" height="20px" borderRadius="6px" />
        </div>
        <div style={{ marginTop: "8px", marginBottom: "16px" }}>
            <SkeletonBox width="160px" height="20px" borderRadius="6px" />
        </div>
        <SkeletonBox width="250px" height="14px" borderRadius="4px" />
        <div style={{ marginTop: "4px" }}>
            <SkeletonBox width="230px" height="14px" borderRadius="4px" />
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

const ChevronRight = () => (
    <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#8B95A1"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polyline points="9 18 15 12 9 6"></polyline>
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
    // ✨ 프로모션 할인 속성 추가
    promotionDiscount: number

    planName: string
    joinType: string
    discountType: string
    contract: number

    userName: string
    userDob: string
    userPhone: string
    totalMonthPayment: number
}

interface Props {
    nextPageUrl: string
}

const mustReadListStyle: React.CSSProperties = {
    margin: 0,
    paddingLeft: "16px",
}

const getMustReadSteps = (planName: string) => [
    {
        title: "요금제 유지기간을 확인해주세요. 유지기간 내 요금제를 변경하면 위약금이 발생해요.",
        content: (
            <ul style={mustReadListStyle}>
                <li>{planName || "선택하신"} 요금제를 만 184일 사용해요.</li>
                <li>만 184일 이내 변경시, 지원금을 전액 반환해야 해요.</li>
                <li>
                    만 184일 이후 50,000원 미만 요금제로 변경 시 위약금이
                    발생해요.
                </li>
            </ul>
        ),
    },
    {
        title: "KT 통신사를 2년간 유지해주세요. 약정을 해지하면 위약금이 발생해요.",
        content: (
            <>
                <div style={{ fontWeight: 600, marginBottom: "8px" }}>
                    공통지원금 / 추가지원금
                </div>
                <ul style={{ ...mustReadListStyle, paddingLeft: "16px" }}>
                    <li>184일 이내 해지하면 전액 반환해야 해요.</li>
                    <li>
                        184일 후, 해지하면 사용기간에 따라 일부 반환해야 해요.
                    </li>
                </ul>
            </>
        ),
    },
    {
        title: "개통후 184일 이내 정지, 해지, 유심·기기변경, 명의 변경, 미사용 시 추가지원금이 전액 환수돼요.",
        content: null,
    },
    {
        title: "개통완료 전까지 기기는 개봉하지 말아주세요. 박스 개봉 및 개통 후 모델변경, 취소, 교환 불가능해요.",
        content: (
            <ul style={mustReadListStyle}>
                <li>
                    초기불량 발생 시, 제조사 서비스센터 방문(14일 이내)해주세요.
                </li>
            </ul>
        ),
    },
    {
        title: "통신사 온라인 신청서를 작성하면 지원금이 확정돼요.",
        content: (
            <ul style={mustReadListStyle}>
                <li>
                    통신사 온라인 신청서 작성 전에는 지원금이 변경될 수 있어요.
                </li>
                <li>
                    온라인 신청서를 작성하여 지원금 확정 후에는 지원금 변경이
                    불가능해요.
                </li>
            </ul>
        ),
    },
    {
        title: "이런경우 KT마켓 추가지원금이 미지급돼요.",
        content: (
            <ul style={mustReadListStyle}>
                <li>타사에서 KT로 이동 후 50일 이내 기기변경시</li>
                <li>기기변경 후 184일 이내 재기기변경시</li>
            </ul>
        ),
    },
]

// --- 가격 정보 렌더링 공통 컴포넌트 ---
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
        {/* ✨ 초이스 요금제 프로모션 할인 렌더링 추가 */}
        {orderInfo.promotionDiscount > 0 && (
            <PriceRow
                label="디바이스 추가지원금(단독)"
                value={`- ${formatPrice(orderInfo.promotionDiscount)}원`}
                isHighlight
            />
        )}
        {/* ✨ 명칭이 512GB 추가지원금(단독)으로 수정되었습니다 */}
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
            <div
                style={{
                    marginRight: "8px",
                    marginTop: "2px",
                }}
            >
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

export default function ApplicationGatePage(props: Props) {
    const [orderInfo, setOrderInfo] = useState<OrderSummary | null>(null)
    const [isExpanded, setIsExpanded] = useState(false)
    const [isInitialLoading, setIsInitialLoading] = useState(true)

    const [showMustRead, setShowMustRead] = useState(false)
    const [showReturnMessage, setShowReturnMessage] = useState(false)
    const [showCompletionCheck, setShowCompletionCheck] = useState(false)

    const [agreements, setAgreements] = useState<boolean[]>(
        new Array(6).fill(false)
    )

    const isAllAgreed = agreements.every((agreed) => agreed === true)

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
                // ✨ 프로모션 할인 데이터 파싱 추가
                const promotionDiscount = parsedSheet.promotionDiscount || 0

                const totalDiscount = devicePrice - installmentPrincipal
                const commonDiscount =
                    totalDiscount -
                    ktMarketSubsidy -
                    doubleStorageDiscount -
                    promotionDiscount

                setOrderInfo({
                    petName: parsedData.device?.pet_name || "기기명 없음",
                    capacity: parsedData.device?.capacity || "",
                    color: parsedData.color?.kr || "",
                    price: parsedSheet.totalMonthPayment || 0,
                    imageUrl: parsedData.color?.urls?.[0] || "",
                    formLink: link,
                    devicePrice,
                    installmentPrincipal,
                    ktMarketSubsidy,
                    commonDiscount: commonDiscount > 0 ? commonDiscount : 0,
                    doubleStorageDiscount,
                    promotionDiscount, // ✨ 데이터 매핑 추가
                    planName: parsedSheet.planName || "",
                    joinType: parsedData.register || "기기변경",
                    discountType: parsedSheet.discount || "공통지원금",
                    contract: parsedSheet.installment || 24,
                    userName: parsedUser?.userName || "-",
                    userDob: parsedUser?.userDob || "-",
                    userPhone: parsedUser?.userPhone || "-",
                    totalMonthPayment: parsedSheet.totalMonthPayment || 0,
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
                    promotionDiscount: 0, // ✨ 기본값 처리
                    planName: "5G 초이스 베이직",
                    joinType: "기기변경",
                    discountType: "공시지원금",
                    contract: 24,
                    userName: "홍길동",
                    userDob: "990101",
                    userPhone: "01012345678",
                    totalMonthPayment: 90000,
                })
            }

            setTimeout(() => {
                setIsInitialLoading(false)
            }, 300)
        } catch (error) {
            console.error("Session load error:", error)
            setIsInitialLoading(false)
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        loadSessionData()
    }, [])

    useEffect(() => {
        const handlePopState = () => {
            if (showCompletionCheck || showReturnMessage || showMustRead) {
                const dataStr = sessionStorage.getItem("data")
                if (dataStr) {
                    try {
                        const data = JSON.parse(dataStr)
                        const model =
                            data.device?.model || data.model || "default"
                        window.location.href = `/phone/${model}`
                    } catch (_e) {
                        window.location.href = "/phone"
                    }
                } else {
                    window.location.href = "/phone"
                }
            }
        }

        window.addEventListener("popstate", handlePopState)
        return () => window.removeEventListener("popstate", handlePopState)
    }, [showCompletionCheck, showReturnMessage, showMustRead])

    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/[^0-9]/g, "")
        if (numbers.length <= 3) return numbers
        if (numbers.length <= 7)
            return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
    }

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("ko-KR").format(price)

    const toggleAgreement = (index: number) => {
        const newAgreements = [...agreements]
        newAgreements[index] = !newAgreements[index]
        setAgreements(newAgreements)
    }

    const handleNext = () => {
        setShowMustRead(true)
    }

    const handleBottomSubmit = () => {
        if (!isAllAgreed) {
            setAgreements(new Array(6).fill(true))
            return
        }

        setShowMustRead(false)
        setShowReturnMessage(true)

        setTimeout(() => {
            setShowReturnMessage(false)
            if (orderInfo?.formLink) {
                window.open(orderInfo.formLink, "_blank")
            }
            setShowCompletionCheck(true)
        }, 2000)
    }

    const handleContinueWriting = () => {
        if (orderInfo?.formLink) {
            window.open(orderInfo.formLink, "_blank")
        }
    }

    const handleComplete = () => {
        window.location.href = props.nextPageUrl
    }

    const handleGuideClick = () => {
        window.open(
            "https://www.notion.so/KT-48369cbc6f5982118b690193be80b25d",
            "_blank"
        )
    }

    const steps = getMustReadSteps(orderInfo?.planName || "")

    // --- 카드 내 확장 콘텐츠 공통 컴포넌트 ---
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
                        label="월 납부액"
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
                    <div style={{ marginTop: "24px" }}>
                        <PriceAlertSkeleton />
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
            {showMustRead && (
                <div style={mustReadContainerStyle}>
                    <div style={topProgressWrapperStyle}>
                        <div style={progressBarBgStyle}>
                            <div
                                style={{
                                    ...progressBarFillStyle,
                                    width: isAllAgreed ? "100%" : "30%",
                                }}
                            />
                        </div>
                    </div>

                    <div style={mustReadContentStyle}>
                        <h2 style={mustReadMainTitleStyle}>
                            상품 유의사항을 확인해주세요
                        </h2>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "32px",
                            }}
                        >
                            {steps.map((step, idx) => (
                                <div key={idx}>
                                    <div style={stepBadgeStyle}>
                                        {idx + 1}/{steps.length}
                                    </div>
                                    <div style={stepTitleStyle}>
                                        {step.title}
                                    </div>

                                    {step.content && (
                                        <div style={stepContentBoxStyle}>
                                            {step.content}
                                        </div>
                                    )}

                                    <button
                                        style={{
                                            ...stepConfirmButtonStyle,
                                            backgroundColor: agreements[idx]
                                                ? "#EBF2FF"
                                                : "#FFFFFF",
                                            color: agreements[idx]
                                                ? "#0066FF"
                                                : "#191F28",
                                            border: agreements[idx]
                                                ? "1px solid #0066FF"
                                                : "1px solid #D1D6DB",
                                        }}
                                        onClick={() => toggleAgreement(idx)}
                                    >
                                        확인했어요
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={mustReadBottomStyle}>
                        <button
                            style={{
                                ...bottomSubmitButtonStyle,
                                backgroundColor: "#2563EB",
                                color: "#FFFFFF",
                                cursor: "pointer",
                            }}
                            onClick={handleBottomSubmit}
                        >
                            {isAllAgreed ? "다음" : "모두 확인했어요"}
                        </button>
                    </div>
                </div>
            )}

            {showReturnMessage && (
                <div style={returnMessageOverlayStyle}>
                    <div style={returnMessageContentStyle}>
                        <div style={iconSectionStyle}>
                            <div style={iconBoxStyle}>
                                <img
                                    src="https://juntell.s3.ap-northeast-2.amazonaws.com/images/ktmarket_logo.png"
                                    alt="KTmarketLogo"
                                    style={logoImgStyle}
                                />
                            </div>
                            <div style={arrowContainerStyle}>
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    style={arrowAnimation1Style}
                                >
                                    <path
                                        d="M9 18l6-6-6-6"
                                        stroke="#D1D6DB"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    style={arrowAnimation2Style}
                                >
                                    <path
                                        d="M9 18l6-6-6-6"
                                        stroke="#D1D6DB"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    style={arrowAnimation3Style}
                                >
                                    <path
                                        d="M9 18l6-6-6-6"
                                        stroke="#0066FF"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                </svg>
                            </div>
                            <div style={ktLogoBoxStyle}>
                                <img
                                    src="https://juntell.s3.ap-northeast-2.amazonaws.com/images/kt_logo.png"
                                    alt="KT Logo"
                                    style={logoImgStyle}
                                />
                            </div>
                        </div>
                        <div style={messageTextSectionStyle}>
                            <div style={messageSubtitleStyle}>
                                신청서 작성을 위해 KT로 이동할게요
                            </div>
                            <div style={messageTitleStyle}>작성 완료 후</div>
                            <div style={messageTitleStyle}>
                                이 화면으로 돌아와 주세요
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCompletionCheck && (
                <div style={completionCheckContainerStyle}>
                    <div style={stepContainerStyle}>
                        <div style={stepItemStyle}>
                            <div
                                style={{
                                    ...stepCircleStyle,
                                    ...activeStepStyle,
                                }}
                            >
                                <CheckIcon />
                            </div>
                            <span
                                style={{ ...stepTextStyle, color: "#191F28" }}
                            >
                                구매 신청
                            </span>
                        </div>
                        <div style={stepLineStyle(true)} />
                        <div style={stepItemStyle}>
                            <div
                                style={{
                                    ...stepCircleStyle,
                                    ...activeStepStyle,
                                }}
                            >
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
                                            {orderInfo.capacity} ·{" "}
                                            {orderInfo.color}
                                        </div>
                                        <div style={priceStyleBlue}>
                                            월{" "}
                                            {formatPrice(
                                                orderInfo.totalMonthPayment
                                            )}
                                            원
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

                                {isExpanded && ExpandedDetails()}

                                {!isExpanded && (
                                    <div style={noticeBoxStyle}>
                                        <InfoIcon />
                                        <span>
                                            신청서 작성 전에는 가격이 바뀔 수
                                            있어요
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

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
            )}

            {!showMustRead && !showReturnMessage && !showCompletionCheck && (
                <>
                    <div style={stepContainerStyle}>
                        <div style={stepItemStyle}>
                            <div
                                style={{
                                    ...stepCircleStyle,
                                    ...activeStepStyle,
                                }}
                            >
                                <CheckIcon />
                            </div>
                            <span
                                style={{ ...stepTextStyle, color: "#191F28" }}
                            >
                                구매 신청
                            </span>
                        </div>
                        <div style={stepLineStyle(true)} />
                        <div style={stepItemStyle}>
                            <div
                                style={{
                                    ...stepCircleStyle,
                                    ...activeStepStyle,
                                }}
                            >
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
                            이제 신청서 작성을
                            <br />
                            하러 다녀올게요
                        </h1>
                    </div>

                    {orderInfo && (
                        <div
                            style={{
                                ...contentContainerStyle,
                                position: "relative",
                                zIndex: 2,
                            }}
                        >
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
                                            {orderInfo.capacity} ·{" "}
                                            {orderInfo.color}
                                        </div>
                                        <div style={priceStyleBlue}>
                                            월{" "}
                                            {formatPrice(
                                                orderInfo.totalMonthPayment
                                            )}
                                            원
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

                                {isExpanded && ExpandedDetails()}

                                {!isExpanded && (
                                    <div style={noticeBoxStyle}>
                                        <InfoIcon />
                                        <span>
                                            신청서 작성 전에는 가격이 바뀔 수
                                            있어요
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div style={priceAlertContainerStyle}>
                                <div style={priceAlertLabelStyle}>
                                    금액 안내
                                </div>
                                <div style={priceAlertMainTextStyle}>
                                    지금 선택하신 요금제/옵션을
                                    <br />
                                    공식신청서에서도 동일하게 선택하시면,
                                    <br />
                                    <span style={priceAlertHighlightStyle}>
                                        최종 개통은 KT마켓 가격표 기준으로
                                        진행됩니다.
                                    </span>
                                </div>
                                <div style={priceAlertSubTextStyle}>
                                    <br />
                                    공식신청서 화면 지원금 표시는 다르게 보일 수
                                    있으나,
                                    <br />
                                    개통 시 가격표 기준으로 적용됩니다.
                                </div>
                            </div>

                            <div
                                style={guideLinkContainerStyle}
                                onClick={handleGuideClick}
                            >
                                <span style={guideLinkTextStyle}>
                                    신청서 작성 방법 확인하기
                                </span>
                                <ChevronRight />
                            </div>
                        </div>
                    )}

                    <div
                        style={{
                            ...bottomContainerStyle,
                            position: "relative",
                            zIndex: 2,
                        }}
                    >
                        <button style={buttonStyle} onClick={handleNext}>
                            다음
                        </button>
                    </div>
                </>
            )}
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
    // ❌ fontFamily 선언 삭제됨
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

const priceAlertContainerStyle: React.CSSProperties = {
    backgroundColor: "#F5F7FF",
    borderRadius: "20px",
    padding: "30px 20px",
    marginTop: "24px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
}

const priceAlertLabelStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 600,
    color: "#8B95A1",
    marginBottom: "16px",
}

const priceAlertMainTextStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 700,
    color: "#191F28",
    lineHeight: "1.5",
    marginBottom: "16px",
}

const priceAlertHighlightStyle: React.CSSProperties = {
    color: "#446DF6",
}

const priceAlertSubTextStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 500,
    color: "#4E5968",
    lineHeight: "1.6",
    wordBreak: "keep-all",
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
    // ❌ fontFamily 선언 삭제됨
}

const mustReadContainerStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    maxWidth: "440px",
    margin: "0 auto",
    right: 0,
    animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
}

const topProgressWrapperStyle: React.CSSProperties = {
    padding: "20px 0 10px 0",
    width: "100%",
}

const progressBarBgStyle: React.CSSProperties = {
    width: "calc(100% - 40px)",
    height: "4px",
    backgroundColor: "#E5E8EB",
    borderRadius: "4px",
    margin: "0 auto",
    overflow: "hidden",
}

const progressBarFillStyle: React.CSSProperties = {
    height: "100%",
    backgroundColor: "#2563EB",
    transition: "width 0.3s ease",
}

const mustReadContentStyle: React.CSSProperties = {
    flex: 1,
    padding: "20px 24px 40px 24px",
    overflowY: "auto",
}

const mustReadMainTitleStyle: React.CSSProperties = {
    fontSize: "22px",
    fontWeight: 700,
    color: "#191F28",
    marginBottom: "32px",
    lineHeight: "1.4",
}

const stepBadgeStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "4px 8px",
    backgroundColor: "#EBF2FF",
    color: "#2563EB",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: 700,
    marginBottom: "12px",
}

const stepTitleStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 700,
    color: "#191F28",
    lineHeight: "1.5",
    marginBottom: "12px",
    wordBreak: "keep-all",
}

const stepContentBoxStyle: React.CSSProperties = {
    backgroundColor: "#F9FAFB",
    borderRadius: "12px",
    padding: "16px",
    marginBottom: "12px",
    color: "#4E5968",
    fontSize: "14px",
    lineHeight: "1.6",
}

const stepConfirmButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.2s",
    // ❌ fontFamily 선언 삭제됨
}

const mustReadBottomStyle: React.CSSProperties = {
    padding: "20px 24px 40px 24px",
    borderTop: "1px solid #F2F4F6",
    backgroundColor: "#fff",
}

const bottomSubmitButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "16px",
    borderRadius: "16px",
    fontSize: "17px",
    fontWeight: 700,
    border: "none",
    transition: "all 0.2s",
    // ❌ fontFamily 선언 삭제됨
}

const returnMessageOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#fff",
    zIndex: 99999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "440px",
    margin: "0 auto",
    right: 0,
}

const returnMessageContentStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 24px",
    width: "100%",
}

const iconSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "24px",
    marginBottom: "60px",
}

const iconBoxStyle: React.CSSProperties = {
    width: "80px",
    height: "80px",
    borderRadius: "20px",
    backgroundColor: "#F9FAFB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}

const ktLogoBoxStyle: React.CSSProperties = {
    width: "80px",
    height: "80px",
    borderRadius: "20px",
    backgroundColor: "#F9FAFB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}

const logoImgStyle: React.CSSProperties = {
    width: "48px",
    height: "48px",
    objectFit: "contain",
}

const arrowContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "4px",
}

const arrowAnimation1Style: React.CSSProperties = {
    animation: "arrowMove 1.5s ease-in-out infinite",
    animationDelay: "0s",
}
const arrowAnimation2Style: React.CSSProperties = {
    animation: "arrowMove 1.5s ease-in-out infinite",
    animationDelay: "0.3s",
}
const arrowAnimation3Style: React.CSSProperties = {
    animation: "arrowMove 1.5s ease-in-out infinite",
    animationDelay: "0.6s",
}

const messageTextSectionStyle: React.CSSProperties = {
    textAlign: "center",
}

const messageSubtitleStyle: React.CSSProperties = {
    fontSize: "15px",
    color: "#8B95A1",
    marginBottom: "16px",
    fontWeight: 500,
}

const messageTitleStyle: React.CSSProperties = {
    fontSize: "24px",
    fontWeight: 700,
    color: "#191F28",
    lineHeight: "1.5",
}

const guideLinkContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    marginTop: "20px",
    cursor: "pointer",
}

const guideLinkTextStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#8B95A1",
    fontWeight: 500,
}

const completionCheckContainerStyle: React.CSSProperties = {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    // ❌ fontFamily 선언 삭제됨
    maxWidth: "440px",
    margin: "0 auto",
}

if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style")
    styleSheet.innerText = `
        @keyframes fadeIn { 
            from { opacity: 0; transform: translateY(-5px); } 
            to { opacity: 1; transform: translateY(0); } 
        }
        @keyframes arrowMove {
            0%, 100% { 
                transform: translateX(0);
                opacity: 0.3;
            }
            50% { 
                transform: translateX(8px);
                opacity: 1;
            }
        }
        @keyframes skeleton-loading {
            0% { opacity: 1; }
            50% { opacity: 0.4; }
            100% { opacity: 1; }
        }
        @keyframes slideUp { 
            from { transform: translateY(100%); } 
            to { transform: translateY(0); } 
        }
    `
    if (!document.getElementById("framer-guide-styles")) {
        styleSheet.id = "framer-guide-styles"
        document.head.appendChild(styleSheet)
    }
}

addPropertyControls(ApplicationGatePage, {
    nextPageUrl: {
        type: ControlType.String,
        title: "다음 페이지 경로",
        defaultValue: "/phone/write/confirm",
        description: "작성 완료 확인 페이지의 URL입니다.",
    },
})
