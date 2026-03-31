import { addPropertyControls, ControlType } from "framer"
import { checkAuth, userState } from "https://framer.com/m/AuthStore-jiikDX.js@QRzzhL7x0LkccW6oL0Cw"
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

const StatusBadgeSkeleton = () => (
    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "16px",
        }}
    >
        <SkeletonBox width="24px" height="24px" borderRadius="50%" />
        <SkeletonBox width="120px" height="15px" borderRadius="6px" />
    </div>
)

const StepCardSkeleton = () => (
    <div style={stepCardStyle}>
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                flex: 1,
            }}
        >
            <SkeletonBox width="24px" height="24px" borderRadius="50%" />
            <SkeletonBox width="60px" height="11px" borderRadius="4px" />
        </div>
        <SkeletonBox width="40px" height="1px" />
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                flex: 1,
            }}
        >
            <SkeletonBox width="24px" height="24px" borderRadius="50%" />
            <SkeletonBox width="70px" height="11px" borderRadius="4px" />
        </div>
        <SkeletonBox width="40px" height="1px" />
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                flex: 1,
            }}
        >
            <SkeletonBox width="24px" height="24px" borderRadius="50%" />
            <SkeletonBox width="60px" height="11px" borderRadius="4px" />
        </div>
    </div>
)

const DeviceCardSkeleton = () => (
    <div style={deviceCardStyle}>
        <SkeletonBox width="60px" height="60px" borderRadius="12px" />
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                flex: 1,
            }}
        >
            <SkeletonBox width="150px" height="16px" borderRadius="6px" />
            <SkeletonBox width="100px" height="13px" borderRadius="6px" />
            <SkeletonBox width="120px" height="16px" borderRadius="6px" />
        </div>
    </div>
)

const SectionSkeleton = () => (
    <div>
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "16px",
            }}
        >
            <SkeletonBox width="32px" height="32px" borderRadius="50%" />
            <SkeletonBox width="100px" height="18px" borderRadius="6px" />
        </div>
        <div style={listStyle}>
            <div style={rowStyle}>
                <SkeletonBox width="100px" height="16px" borderRadius="6px" />
                <SkeletonBox width="120px" height="16px" borderRadius="6px" />
            </div>
            <div style={rowStyle}>
                <SkeletonBox width="100px" height="16px" borderRadius="6px" />
                <SkeletonBox width="100px" height="16px" borderRadius="6px" />
            </div>
            <div style={rowStyle}>
                <SkeletonBox width="100px" height="16px" borderRadius="6px" />
                <SkeletonBox width="140px" height="16px" borderRadius="6px" />
            </div>
        </div>
    </div>
)

const PriceBoxSkeleton = () => (
    <div style={priceContainerStyle}>
        <div style={{ marginBottom: "12px" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                }}
            >
                <SkeletonBox width="80px" height="14px" borderRadius="6px" />
                <SkeletonBox width="100px" height="15px" borderRadius="6px" />
            </div>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                }}
            >
                <SkeletonBox width="100px" height="14px" borderRadius="6px" />
                <SkeletonBox width="110px" height="15px" borderRadius="6px" />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <SkeletonBox width="100px" height="14px" borderRadius="6px" />
                <SkeletonBox width="110px" height="15px" borderRadius="6px" />
            </div>
        </div>
        <div style={{ ...finalPriceRowStyle, marginTop: "16px" }}>
            <SkeletonBox width="80px" height="15px" borderRadius="6px" />
            <SkeletonBox width="120px" height="18px" borderRadius="6px" />
        </div>
    </div>
)

// --- Icons ---
const CheckCircleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="12" fill="#0066FF" />
        <path
            d="M17 8L10 15L7 12"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
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

const InfoIcon = () => (
    <div
        style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            backgroundColor: "#6B7280",
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

// --- Interface ---
interface OrderSummary {
    petName: string
    capacity: string
    color: string
    imageUrl: string
    userName: string
    userDob: string
    userPhone: string
    telecom: string
    discountType: string
    contract: number
    planName: string
    planData: string
    monthlyPayment: number
    devicePrice: number
    publicSubsidy: number
    marketSubsidy: number
    finalPrice: number
    totalMonthPayment: number // 💡 월 납부액 추가
    doubleStorageDiscount: number // ✨ 더블스토리지 할인 추가
    promotionDiscount: number // ✨ 프로모션 할인 추가
}

interface Props {
    homeUrl: string
}

export default function ApplicationConfirmPage(props: Props) {
    const [data, setData] = useState<OrderSummary | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // 💡 Kakao Sync State
    const [kakaoStatus, setKakaoStatus] = useState<"NONE" | "ADDED" | "BLOCKED" | "LOADING" | null>(null)
    const [syncMessage, setSyncMessage] = useState("")

    useEffect(() => {
        checkAuth() // Ensure AuthStore knows login state
        if (typeof window === "undefined") return

        try {
            const sheetStr = sessionStorage.getItem("sheet")
            const dataStr = sessionStorage.getItem("data")
            const userStr = sessionStorage.getItem("user-info")

            const parsedSheet = sheetStr ? JSON.parse(sheetStr) : {}
            const parsedData = dataStr ? JSON.parse(dataStr) : {}
            const parsedUser = userStr ? JSON.parse(userStr) : {}

            const devicePrice = parsedSheet.devicePrice || 0
            const installmentPrincipal = parsedSheet.installmentPrincipal || 0
            const marketSubsidy = parsedSheet.ktmarketSubsidy || 0
            // ✨ 더블스토리지 값 가져오기
            const doubleStorageDiscount = parsedSheet.doubleStorageDiscount || 0
            // ✨ 프로모션 할인 값 가져오기
            const promotionDiscount = parsedSheet.promotionDiscount || 0

            const totalDiscount = devicePrice - installmentPrincipal
            // 💡 공시지원금 = 총 할인 - KT마켓지원금 - 더블스토리지할인 - 프로모션할인
            const publicSubsidy =
                totalDiscount -
                marketSubsidy -
                doubleStorageDiscount -
                promotionDiscount

            const registerType = parsedData.register || "기기변경"
            const telecomStr =
                registerType === "번호이동" ? "타사 -> KT" : "기기변경 (KT)"

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setData({
                petName: parsedData.device?.pet_name || "기기명 없음",
                capacity: parsedData.device?.capacity || "",
                color: parsedData.color?.kr || "",
                imageUrl: parsedData.color?.urls?.[0] || "",
                userName: parsedUser.userName || "-",
                userDob: parsedUser.userDob || "-",
                userPhone: parsedUser.userPhone || "-",
                telecom: telecomStr,
                discountType: parsedSheet.discount || "공시지원금",
                contract: parsedSheet.installment || 24,
                planName: parsedSheet.planName || "요금제 정보 없음",
                planData: "무제한",
                monthlyPayment: parsedSheet.planPrice || 0,
                devicePrice: devicePrice,
                publicSubsidy: publicSubsidy > 0 ? publicSubsidy : 0,
                marketSubsidy: marketSubsidy,
                finalPrice: installmentPrincipal,
                totalMonthPayment: parsedSheet.totalMonthPayment || 0,
                doubleStorageDiscount: doubleStorageDiscount, // ✨ 데이터 객체에 추가
                promotionDiscount: promotionDiscount, // ✨ 데이터 객체에 추가
            })

            // 로딩 완료 (자연스러운 전환을 위해 0.3초 딜레이)
            setTimeout(() => {
                setIsLoading(false)
            }, 300)
        } catch (e) {
            console.error("Data load error", e)
            setIsLoading(false)
        }
    }, [])

    const handleKakaoSync = async () => {
        if (!userState.isLoggedIn || !userState.id) {
            setSyncMessage("로그인이 필요한 혜택입니다.")
            return
        }
        
        setKakaoStatus("LOADING")
        try {
            const res = await fetch("/api/kakao/sync-channel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ profile_id: userState.id })
            })
            const result = await res.json()
            
            if (res.ok && result.success) {
                setKakaoStatus(result.status)
                if (result.status === "ADDED") {
                    setSyncMessage("")
                } else {
                    setSyncMessage("아직 채널 추가가 확인되지 않았습니다.")
                }
            } else {
                setKakaoStatus("NONE")
                setSyncMessage(result.error || "확인 중 오류가 발생했습니다.")
            }
        } catch {
            setKakaoStatus("NONE")
            setSyncMessage("네트워크 오류가 발생했습니다.")
        }
    }

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("ko-KR").format(price)

    // 전화번호 포맷팅 함수 (010-0000-0000)
    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/[^0-9]/g, "")
        if (numbers.length <= 3) return numbers
        if (numbers.length <= 7)
            return `${numbers.slice(0, 3)}-${numbers.slice(3)}`
        return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
    }

    const handleHomeClick = () => {
        window.location.href = props.homeUrl
    }

    // 스켈레톤 로딩 화면
    if (isLoading) {
        return (
            <div style={containerStyle}>
                {/* Header Section Skeleton */}
                <div style={topSectionStyle}>
                    <StatusBadgeSkeleton />
                    <SkeletonBox
                        width="200px"
                        height="32px"
                        borderRadius="8px"
                    />
                    <div style={{ marginTop: "12px" }}>
                        <SkeletonBox
                            width="150px"
                            height="32px"
                            borderRadius="8px"
                        />
                    </div>
                    <div style={{ marginTop: "12px", marginBottom: "30px" }}>
                        <SkeletonBox
                            width="250px"
                            height="15px"
                            borderRadius="6px"
                        />
                    </div>

                    <StepCardSkeleton />
                </div>

                <div style={dividerStyle} />

                {/* Info Section Skeleton */}
                <div style={infoSectionStyle}>
                    <SkeletonBox
                        width="120px"
                        height="18px"
                        borderRadius="6px"
                    />
                    <div style={{ marginTop: "20px" }}>
                        <DeviceCardSkeleton />
                    </div>

                    <div style={separatorStyle} />

                    <SectionSkeleton />

                    <div style={separatorStyle} />

                    <SectionSkeleton />

                    <div style={separatorStyle} />

                    <SectionSkeleton />

                    <div style={{ marginTop: "20px" }}>
                        <SkeletonBox
                            width="100%"
                            height="80px"
                            borderRadius="12px"
                        />
                    </div>

                    <div style={separatorStyle} />

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                            marginBottom: "16px",
                        }}
                    >
                        <SkeletonBox
                            width="32px"
                            height="32px"
                            borderRadius="50%"
                        />
                        <SkeletonBox
                            width="100px"
                            height="18px"
                            borderRadius="6px"
                        />
                    </div>

                    <PriceBoxSkeleton />

                    <div style={{ marginTop: "20px" }}>
                        <SkeletonBox
                            width="100%"
                            height="80px"
                            borderRadius="12px"
                        />
                    </div>
                </div>

                {/* Bottom Button Skeleton */}
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
            {/* Header Section */}
            <div style={topSectionStyle}>
                <div style={statusBadgeStyle}>
                    <CheckCircleIcon />
                    <span style={statusTextStyle}>신청서 확인 대기</span>
                </div>

                {/* 💡 수정된 텍스트 부분 */}
                <h1 style={titleStyle}>신청서가 접수되었어요</h1>
                <p style={subTitleStyle}>
                    1~3일 이내 1522-6562로
                    <br />
                    주문확인 전화드릴 예정이니 꼭 받아주세요.
                </p>

                {/* Step Indicator */}
                <div style={stepCardStyle}>
                    <StepItem number="1" text="신청서 확인" active />
                    <div style={stepLineStyle} />
                    <StepItem number="2" text="휴대폰 배송" />
                    <div style={stepLineStyle} />
                    <StepItem number="3" text="개통하기" />
                </div>
            </div>

            {/* 💡 카카오 채널 혜택 섹션 */}
            {userState.isLoggedIn && (
                <div style={kakaoBannerContainerStyle}>
                    <div style={kakaoBannerHeaderStyle}>
                        <div style={kakaoIconBoxStyle}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#3B1E1E">
                                <path d="M12 3c-5.5 0-10 3.5-10 8 0 2.8 1.8 5.3 4.6 6.7l-1 3.7c-.1.5.4.9.9.6l4.2-2.8c.4.1.8.1 1.3.1 5.5 0 10-3.5 10-8s-4.5-8-10-8z" />
                            </svg>
                        </div>
                        <h3 style={kakaoBannerTitleStyle}>채널 추가하고 KT마켓 혜택받기</h3>
                    </div>
                    <p style={kakaoBannerDescStyle}>
                        주문 완료 후 아래 버튼을 눌러 카카오톡 채널을 추가하면, 
                        특별 단말기 지원금 혜택이 확정됩니다.
                    </p>
                    {kakaoStatus === "ADDED" ? (
                        <div style={kakaoSuccessBoxStyle}>
                            🎉 채널 추가가 확인되었습니다! 혜택이 정상 적용됩니다.
                        </div>
                    ) : (
                        <div style={kakaoActionBoxStyle}>
                            <button 
                                style={kakaoAddButtonStyle}
                                onClick={() => window.open("http://pf.kakao.com/_HfItxj/friend", "_blank")}
                            >
                                1. 채널 추가하기
                            </button>
                            <button 
                                style={{
                                    ...kakaoSyncButtonStyle,
                                    opacity: kakaoStatus === "LOADING" ? 0.7 : 1
                                }}
                                onClick={handleKakaoSync}
                                disabled={kakaoStatus === "LOADING"}
                            >
                                {kakaoStatus === "LOADING" ? "확인 중..." : "2. 추가 완료! 혜택 확인하기"}
                            </button>
                            {syncMessage && <div style={kakaoMessageStyle}>{syncMessage}</div>}
                        </div>
                    )}
                </div>
            )}

            <div style={dividerStyle} />

            {/* Info Section */}
            <div style={infoSectionStyle}>
                <h3 style={sectionTitleStyle}>내 신청 정보</h3>

                {/* Device Card */}
                {data && (
                    <div style={deviceCardStyle}>
                        <div style={imageWrapperStyle}>
                            {data.imageUrl ? (
                                <img
                                    src={data.imageUrl}
                                    style={imgStyle}
                                    alt="Device"
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
                        <div style={deviceInfoStyle}>
                            <div style={deviceNameStyle}>{data.petName}</div>
                            <div style={deviceOptionStyle}>
                                {data.capacity} · {data.color}
                            </div>
                            {/* 💡 최종 기기값(finalPrice) 대신 "월 납부액(totalMonthPayment)"으로 변경 */}
                            <div style={devicePriceStyle}>
                                월 납부액 {formatPrice(data.totalMonthPayment)}
                                원
                            </div>
                        </div>
                    </div>
                )}

                <div style={separatorStyle} />

                {/* User Info */}
                <SectionHeader
                    icon={<UserIcon />}
                    bgColor="#0066FF"
                    title="가입자 정보"
                />
                <div style={listStyle}>
                    <InfoRow label="이름" value={data?.userName || ""} />
                    <InfoRow label="생년월일" value={data?.userDob || ""} />
                    <InfoRow
                        label="휴대폰 번호"
                        value={formatPhoneNumber(data?.userPhone || "")}
                    />
                </div>

                <div style={separatorStyle} />

                {/* Opening Info */}
                <SectionHeader
                    icon={<PhoneIcon />}
                    bgColor="#8B5CF6"
                    title="개통 정보"
                />
                <div style={listStyle}>
                    <InfoRow label="통신사" value={data?.telecom || ""} />
                    <InfoRow
                        label="할인 유형"
                        value={data?.discountType || ""}
                    />
                    <InfoRow label="약정" value={`${data?.contract}개월`} />
                </div>

                <div style={separatorStyle} />

                {/* Plan Info */}
                <SectionHeader
                    icon={<PlanIcon />}
                    bgColor="#22C55E"
                    title="요금제 정보"
                />
                <div style={listStyle}>
                    <InfoRow label="이름" value={data?.planName || ""} />
                    <InfoRow label="데이터" value={data?.planData || ""} />
                    <InfoRow
                        label="월 금액"
                        value={`${formatPrice(data?.monthlyPayment || 0)}원`}
                    />
                </div>

                <div style={warningBoxStyle}>
                    <InfoIcon />
                    <div>
                        <div style={warningTitleStyle}>
                            최소 6개월간 요금제를 유지해주세요.
                        </div>
                        <div style={warningDescStyle}>
                            6개월 뒤에는 원가 기준 47,000원 이상 요금제로 변경할
                            수 있어요.
                        </div>
                    </div>
                </div>

                <div style={separatorStyle} />

                {/* Price Info */}
                <SectionHeader
                    icon={<WonIcon />}
                    bgColor="#FFCC00"
                    title="가격 정보"
                />
                <div style={priceContainerStyle}>
                    <PriceRow
                        label="출시 가격"
                        value={`${formatPrice(data?.devicePrice || 0)}원`}
                    />
                    {data?.publicSubsidy > 0 && (
                        <PriceRow
                            label="통신사 지원금"
                            value={`- ${formatPrice(data.publicSubsidy)}원`}
                        />
                    )}
                    {/* ✨ 프로모션 할인 렌더링 추가 */}
                    {data?.promotionDiscount > 0 && (
                        <PriceRow
                            label="디바이스 추가지원금(단독)"
                            value={`- ${formatPrice(data.promotionDiscount)}원`}
                            isBlue
                        />
                    )}
                    {/* ✨ 더블스토리지 할인 렌더링 (값이 0보다 클 때만 노출) */}
                    {data?.doubleStorageDiscount > 0 && (
                        <PriceRow
                            label="512GB 추가지원금(단독)"
                            value={`- ${formatPrice(data.doubleStorageDiscount)}원`}
                            isBlue
                        />
                    )}
                    {data?.marketSubsidy > 0 && (
                        <PriceRow
                            label="KT마켓 지원금"
                            value={`- ${formatPrice(data.marketSubsidy)}원`}
                            isBlue
                        />
                    )}

                    <div style={finalPriceRowStyle}>
                        <span style={finalPriceLabelStyle}>최종 구매가</span>
                        <span style={finalPriceValueStyle}>
                            {formatPrice(data?.finalPrice || 0)}원
                        </span>
                    </div>
                </div>

                <div style={paymentNoticeStyle}>
                    <InfoIcon />
                    <div style={paymentNoticeTextStyle}>
                        <div style={{ fontWeight: 700, marginBottom: "2px" }}>
                            결제는 나중에 해요
                        </div>
                        <div>
                            일시불/할부 중 원하는 방법으로 납부할 수 있어요.
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Button */}
            <div style={bottomContainerStyle}>
                <button style={homeButtonStyle} onClick={handleHomeClick}>
                    홈으로 돌아가기
                </button>
            </div>
        </div>
    )
}

// --- Sub Components ---

const StepItem = ({
    number,
    text,
    active,
}: {
    number: string
    text: string
    active?: boolean
}) => (
    <div
        style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            flex: 1,
        }}
    >
        <div
            style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                backgroundColor: active ? "#0066FF" : "#F2F4F6",
                color: active ? "white" : "#B0B8C1",
                fontSize: "12px",
                fontWeight: "bold",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {number}
        </div>
        <span
            style={{
                fontSize: "11px",
                color: active ? "#0066FF" : "#B0B8C1",
                fontWeight: active ? 700 : 500,
            }}
        >
            {text}
        </span>
    </div>
)

const SectionHeader = ({ icon, title, bgColor }: any) => (
    <div
        style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "16px",
        }}
    >
        <div
            style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                backgroundColor: bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {icon}
        </div>
        <span style={{ fontSize: "18px", fontWeight: 700, color: "#191F28" }}>
            {title}
        </span>
    </div>
)

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
    isBlue,
}: {
    label: string
    value: string
    isBlue?: boolean
}) => (
    <div
        style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
        }}
    >
        <span style={{ fontSize: "14px", color: "#8B95A1", fontWeight: 500 }}>
            {label}
        </span>
        <span
            style={{
                fontSize: "15px",
                color: isBlue ? "#0066FF" : "#6B7280",
                fontWeight: isBlue ? 600 : 500,
            }}
        >
            {value}
        </span>
    </div>
)

// --- Updated Styles (Font Family & Align) ---
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

// --- General Styles ---
const containerStyle: React.CSSProperties = {
    width: "100%",
    minHeight: "100vh",
    backgroundColor: "#FFFFFF",
    // ❌ 전역 폰트 선언(fontFamily) 삭제됨
    display: "flex",
    flexDirection: "column",
}

const topSectionStyle: React.CSSProperties = {
    padding: "40px 24px 30px 24px",
}

const statusBadgeStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "16px",
}

const statusTextStyle: React.CSSProperties = {
    fontSize: "15px",
    fontWeight: 700,
    color: "#0066FF",
}

const titleStyle: React.CSSProperties = {
    fontSize: "26px",
    fontWeight: 700,
    color: "#191F28",
    lineHeight: "1.35",
    marginBottom: "10px",
    marginTop: 0,
}

const subTitleStyle: React.CSSProperties = {
    fontSize: "15px",
    color: "#8B95A1",
    margin: "0 0 30px 0",
}

const stepCardStyle: React.CSSProperties = {
    backgroundColor: "#F9FAFB",
    borderRadius: "20px",
    padding: "20px",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "20px",
}

const stepLineStyle: React.CSSProperties = {
    width: "40px",
    height: "1px",
    backgroundColor: "#E5E8EB",
    marginTop: "12px",
}

const dividerStyle: React.CSSProperties = {
    width: "100%",
    height: "1px",
    backgroundColor: "#F2F4F6",
}

const infoSectionStyle: React.CSSProperties = {
    padding: "30px 24px",
    flex: 1,
}

const sectionTitleStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 700,
    color: "#191F28",
    margin: "0 0 20px 0",
}

const deviceCardStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "30px",
}

const imageWrapperStyle: React.CSSProperties = {
    width: "60px",
    height: "60px",
    borderRadius: "12px",
    backgroundColor: "#F9FAFB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
}

const imgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
}

const deviceInfoStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
}

const deviceNameStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 700,
    color: "#191F28",
}

const deviceOptionStyle: React.CSSProperties = {
    fontSize: "13px",
    color: "#8B95A1",
}

const devicePriceStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: 700,
    color: "#0066FF",
}

const separatorStyle: React.CSSProperties = {
    width: "100%",
    height: "1px",
    backgroundColor: "#F2F4F6",
    margin: "30px 0",
}

const listStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
}

const warningBoxStyle: React.CSSProperties = {
    marginTop: "20px",
    backgroundColor: "#F2F4F6",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
}

const warningTitleStyle: React.CSSProperties = {
    fontSize: "13px",
    fontWeight: 700,
    color: "#191F28",
    marginBottom: "4px",
}

const warningDescStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#6B7280",
    lineHeight: "1.4",
}

const priceContainerStyle: React.CSSProperties = {
    backgroundColor: "#F9FAFB",
    borderRadius: "16px",
    padding: "20px",
}

const finalPriceRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #E5E8EB",
}

const finalPriceLabelStyle: React.CSSProperties = {
    fontSize: "15px",
    fontWeight: 700,
    color: "#191F28",
}

const finalPriceValueStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 700,
    color: "#191F28",
}

const paymentNoticeStyle: React.CSSProperties = {
    marginTop: "20px",
    backgroundColor: "#F0F7FF",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    gap: "8px",
    alignItems: "flex-start",
}

const paymentNoticeTextStyle: React.CSSProperties = {
    fontSize: "13px",
    color: "#4B5563",
    lineHeight: "1.4",
}

const bottomContainerStyle: React.CSSProperties = {
    padding: "20px 24px 40px 24px",
    marginTop: "20px",
}

// 💡 추가된 카카오 배너 스타일
const kakaoBannerContainerStyle: React.CSSProperties = {
    margin: "0 24px 30px 24px",
    padding: "20px",
    backgroundColor: "#FAE100", // 카카오톡 노란색
    borderRadius: "20px",
    boxShadow: "0 4px 12px rgba(250, 225, 0, 0.2)"
}

const kakaoBannerHeaderStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px"
}

const kakaoIconBoxStyle: React.CSSProperties = {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#FFFFFF",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
}

const kakaoBannerTitleStyle: React.CSSProperties = {
    fontSize: "17px",
    fontWeight: 800,
    color: "#3B1E1E", // 짙은 갈색
    margin: 0
}

const kakaoBannerDescStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#3B1E1E",
    lineHeight: "1.4",
    marginBottom: "16px",
    fontWeight: 500,
    wordBreak: "keep-all"
}

const kakaoSuccessBoxStyle: React.CSSProperties = {
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: "16px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 700,
    color: "#0066FF",
    textAlign: "center"
}

const kakaoActionBoxStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
}

const kakaoAddButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "16px",
    backgroundColor: "#3B1E1E",
    color: "#FAE100",
    fontSize: "15px",
    fontWeight: 700,
    borderRadius: "12px",
    border: "none",
    cursor: "pointer"
}

const kakaoSyncButtonStyle: React.CSSProperties = {
    width: "100%",
    padding: "16px",
    backgroundColor: "#FFFFFF",
    color: "#3B1E1E",
    fontSize: "15px",
    fontWeight: 700,
    borderRadius: "12px",
    border: "1px solid rgba(59, 30, 30, 0.1)",
    cursor: "pointer"
}

const kakaoMessageStyle: React.CSSProperties = {
    fontSize: "13px",
    color: "#E11D48",
    fontWeight: 600,
    textAlign: "center",
    marginTop: "4px"
}

// 💡 수정된 버튼 스타일 (색상 연하게 변경 및 폰트 상속)
const homeButtonStyle: React.CSSProperties = {
    width: "100%",
    height: "56px",
    borderRadius: "16px",
    backgroundColor: "#F2F4F6", // 연한 회색
    color: "#333D4B", // 진한 회색 텍스트
    fontSize: "16px",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    transition: "background 0.2s ease",
}

// CSS 애니메이션 추가
if (typeof document !== "undefined") {
    const styleSheet = document.createElement("style")
    styleSheet.innerText = `
        @keyframes skeleton-loading {
            0% { opacity: 1; }
            50% { opacity: 0.4; }
            100% { opacity: 1; }
        }
    `
    if (!document.getElementById("confirm-page-styles")) {
        styleSheet.id = "confirm-page-styles"
        document.head.appendChild(styleSheet)
    }
}

addPropertyControls(ApplicationConfirmPage, {
    homeUrl: {
        type: ControlType.String,
        title: "홈 링크",
        defaultValue: "/",
    },
})
