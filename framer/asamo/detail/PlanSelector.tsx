import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

export interface PlanData {
    id: string
    price: number
    data: string
    name: string
    description: string
    calls: string
    texts: string
    disclosureSubsidy: number
    marketSubsidy?: number
}

// 유튜브 프리미엄 요금제 UUID (detail 페이지 PLAN_METADATA 기준)
const YOUTUBE_PLAN_UUIDS = new Set(["plan_90"])
const YOUTUBE_BONUS = 30000

interface Props {
    plans: PlanData[]
    selectedPlanId: string
    discountMode: "device" | "plan"
    originPrice: number
    ktMarketDiscount: number
    onSelectPlan: (id: string) => void
    onChangeMode: (mode: "device" | "plan") => void
    registrationType: "chg" | "mnp"
    isSpecialModel?: boolean // 상위 컴포넌트에서 넘겨주더라도 무시되도록 처리
}

export default function PlanSelector(props: Props) {
    const {
        plans = [],
        selectedPlanId,
        discountMode,
        originPrice = 0,
        ktMarketDiscount = 0,
        onSelectPlan,
        onChangeMode,
    } = props

    const formatPrice = (n: number) => new Intl.NumberFormat("ko-KR").format(n)

    const formatManWon = (n: number) => {
        if (n >= 10000) return `${Math.floor(n / 10000)}만원`
        return `${formatPrice(n)}원`
    }

    const selectedPlan = plans.find((p) => p.id === selectedPlanId)
    const isDeviceMode = discountMode === "device"

    const currentPlanPrice = selectedPlan?.price ?? 0
    const currentMonthlyDiscount =
        Math.floor((currentPlanPrice * 0.25) / 10) * 10
    const currentDiscountedPrice = currentPlanPrice - currentMonthlyDiscount

    const currentDisclosureSubsidy = selectedPlan?.disclosureSubsidy ?? 0
    const currentMarketSubsidy = selectedPlan?.marketSubsidy ?? ktMarketDiscount

    // 유튜브 프리미엄 보너스 분리 (marketSubsidy는 base + youtubeBonus 합계)
    const isYoutubePlan = YOUTUBE_PLAN_UUIDS.has(selectedPlanId)
    const currentYoutubeBonus = isYoutubePlan ? YOUTUBE_BONUS : 0
    const currentBaseMarketSubsidy = Math.max(
        0,
        currentMarketSubsidy - currentYoutubeBonus
    )

    let finalPrice = 0
    if (isDeviceMode) {
        finalPrice = Math.max(
            0,
            originPrice - currentDisclosureSubsidy - currentMarketSubsidy
        )
    } else {
        finalPrice = Math.max(0, originPrice - currentMarketSubsidy)
    }

    const visiblePlans = plans.filter((p) => p.id !== "plan_69_v")

    const handleVariantChange = (
        e: React.ChangeEvent<HTMLSelectElement>,
        basePlanId: string
    ) => {
        const value = e.target.value
        if (value === "video") {
            onSelectPlan("plan_69")
        } else if (value === "simple") {
            onSelectPlan("plan_69_v")
        }
    }

    return (
        <div style={containerStyle}>
            {/* 탭 */}
            <div style={headerStyle}>
                <div style={labelStyle}>할인 방법을 선택해주세요</div>
                <div style={tabContainerStyle}>
                    <div
                        style={{
                            ...tabStyle,
                            ...(isDeviceMode ? activeTabStyle : {}),
                        }}
                        onClick={() => onChangeMode("device")}
                    >
                        기기할인
                    </div>
                    <div
                        style={{
                            ...tabStyle,
                            ...(!isDeviceMode ? activeTabStyle : {}),
                        }}
                        onClick={() => onChangeMode("plan")}
                    >
                        요금할인
                    </div>
                </div>
                <div style={infoTextStyle}>
                    <span style={{ marginRight: "4px" }}>ℹ️</span>
                    {isDeviceMode
                        ? "KT 공시지원금과 아사모 추가할인을 함께 받아요"
                        : "매월 요금할인(25%)과 아사모 추가할인을 함께 받아요"}
                </div>
            </div>

            {/* 리스트 */}
            <div style={headerStyle}>
                <div style={labelStyle}>
                    요금제를 선택해주세요{" "}
                    {!isDeviceMode && <span style={badgeStyle}>25% 할인</span>}
                </div>
                <div style={listContainerStyle}>
                    {visiblePlans.map((plan) => {
                        const is69PlanGroup =
                            plan.id === "plan_69" || plan.price === 69000

                        const isSelected =
                            plan.id === selectedPlanId ||
                            (is69PlanGroup &&
                                (selectedPlanId === "plan_69_v" ||
                                    selectedPlanId === "plan_69"))

                        const mDiscount =
                            Math.floor((plan.price * 0.25) / 10) * 10
                        const discountedMonthly = plan.price - mDiscount

                        const planDisclosure = plan.disclosureSubsidy || 0
                        const planMarket = plan.marketSubsidy || 0

                        let rightTextValue = 0
                        if (isDeviceMode) {
                            rightTextValue = planDisclosure + planMarket
                        } else {
                            rightTextValue = planMarket
                        }

                        let dropdownValue = "video"
                        if (selectedPlanId === "plan_69_v") {
                            dropdownValue = "simple"
                        }

                        return (
                            <div
                                key={plan.id}
                                style={{
                                    ...cardStyle,
                                    border: isSelected
                                        ? "2px solid #3B82F6"
                                        : "2px solid #E5E7EB",
                                    backgroundColor: "#FFFFFF",
                                }}
                                onClick={() => {
                                    if (is69PlanGroup) {
                                        if (
                                            !isSelected ||
                                            selectedPlanId !== "plan_69"
                                        )
                                            onSelectPlan("plan_69")
                                    } else {
                                        onSelectPlan(plan.id)
                                    }
                                }}
                            >
                                <div style={leftContentStyle}>
                                    <div
                                        style={{
                                            ...radioCircleStyle,
                                            borderColor: isSelected
                                                ? "#3B82F6"
                                                : "#D1D5DB",
                                            backgroundColor: isSelected
                                                ? "#3B82F6"
                                                : "transparent",
                                        }}
                                    >
                                        {isSelected && (
                                            <div style={radioDotStyle} />
                                        )}
                                    </div>
                                    <div style={textStackStyle}>
                                        <div style={priceTextStyle}>
                                            {formatPrice(plan.price)}원
                                        </div>

                                        {is69PlanGroup ? (
                                            <div
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <select
                                                    style={dropdownStyle}
                                                    value={dropdownValue}
                                                    onChange={(e) =>
                                                        handleVariantChange(
                                                            e,
                                                            plan.id
                                                        )
                                                    }
                                                >
                                                    <option value="video">
                                                        데이터ON 비디오
                                                    </option>
                                                    <option value="simple">
                                                        5G 심플 110GB
                                                    </option>
                                                </select>
                                            </div>
                                        ) : (
                                            <div style={dataTextStyle}>
                                                {plan.name}
                                            </div>
                                        )}

                                        {!isDeviceMode && (
                                            <div
                                                style={{
                                                    fontSize: "12px",
                                                    color: "#3B82F6",
                                                    marginTop: "2px",
                                                }}
                                            >
                                                월{" "}
                                                {formatPrice(discountedMonthly)}
                                                원 납부
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div style={rightContentStyle}>
                                    {formatManWon(rightTextValue)} 할인
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* 가격 요약 */}
            <div style={summaryContainerStyle}>
                <div style={dividerStyle} />
                <div style={rowStyle}>
                    <span style={rowLabelStyle}>출시 가격</span>
                    <span style={rowValueStyle}>
                        {formatPrice(originPrice)}원
                    </span>
                </div>

                {isDeviceMode && (
                    <div style={rowStyle}>
                        <span style={rowLabelStyle}>공통지원금 (KT)</span>
                        <span style={{ ...rowValueStyle, color: "#3B82F6" }}>
                            -{formatPrice(currentDisclosureSubsidy)}원
                        </span>
                    </div>
                )}

                <div style={rowStyle}>
                    <span
                        style={{
                            ...rowLabelStyle,
                            color: "#3B82F6",
                            fontWeight: 600,
                        }}
                    >
                        아사모 추가지원금
                    </span>
                    <span style={{ ...rowValueStyle, color: "#3B82F6" }}>
                        -{formatPrice(currentBaseMarketSubsidy)}원
                    </span>
                </div>

                {isYoutubePlan && (
                    <div style={rowStyle}>
                        <span
                            style={{
                                ...rowLabelStyle,
                                color: "#3B82F6",
                                fontWeight: 600,
                            }}
                        >
                            유튜브 프리미엄 추가지원금
                        </span>
                        <span style={{ ...rowValueStyle, color: "#3B82F6" }}>
                            -{formatPrice(currentYoutubeBonus)}원
                        </span>
                    </div>
                )}

                <div style={{ ...rowStyle, marginTop: "8px" }}>
                    <span style={finalLabelStyle}>최종 구매가(체감가)</span>
                    <span style={finalValueStyle}>
                        {formatPrice(finalPrice)}원
                    </span>
                </div>
            </div>

            {/* 하단 정보 */}
            <div style={infoSectionContainerStyle}>
                <div style={infoHeaderStyle}>요금제 정보</div>
                <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>이름</span>
                    <span style={infoValueStyle}>{selectedPlan?.name}</span>
                </div>
                <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>데이터</span>
                    <span style={infoValueStyle}>
                        {selectedPlan?.description}
                    </span>
                </div>
                <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>통화</span>
                    <span style={infoValueStyle}>{selectedPlan?.calls}</span>
                </div>
                <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>문자</span>
                    <span style={infoValueStyle}>{selectedPlan?.texts}</span>
                </div>
                <div style={infoRowStyle}>
                    <span style={infoLabelStyle}>월 요금</span>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                        }}
                    >
                        {!isDeviceMode && (
                            <span
                                style={{
                                    fontSize: "13px",
                                    color: "#9CA3AF",
                                    textDecoration: "line-through",
                                    marginBottom: "2px",
                                }}
                            >
                                <span
                                    style={{
                                        color: "#FF6B6B",
                                        fontWeight: 600,
                                        textDecoration: "none",
                                        marginRight: "4px",
                                    }}
                                >
                                    25%
                                </span>
                                {formatPrice(currentPlanPrice)}원
                            </span>
                        )}
                        <span style={{ ...infoValueStyle, fontWeight: 600 }}>
                            월{" "}
                            {formatPrice(
                                !isDeviceMode
                                    ? currentDiscountedPrice
                                    : currentPlanPrice
                            )}
                            원
                        </span>
                    </div>
                </div>

                {/* ✅ [추가] 데이터ON 비디오 플러스(plan_69) 선택 시 안내 문구 */}
                {selectedPlanId === "plan_69" && (
                    <div style={tooltipStyle}>
                        <div style={tooltipIconStyle}>i</div>
                        <div style={tooltipTextStyle}>
                            데이터ON비디오요금제는 현재 가입불가인 요금제로,
                            기존가입자만 유지되며 신규가입자는 데이터ON비디오
                            플러스로 가입돼요
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}

// --- Styles ---
const containerStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
}
const headerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
}
const labelStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 600,
    color: "#1d1d1f",
    display: "flex",
    alignItems: "center",
    gap: "8px",
}
const badgeStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#EF4444",
    backgroundColor: "#FEF2F2",
    padding: "2px 6px",
    borderRadius: "4px",
    fontWeight: 600,
}
const tabContainerStyle: React.CSSProperties = {
    display: "flex",
    backgroundColor: "#F3F4F6",
    borderRadius: "12px",
    padding: "4px",
    height: "48px",
    cursor: "pointer",
}
const tabStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: 400,
    color: "#6B7280",
    borderRadius: "10px",
    transition: "all 0.2s ease",
}
const activeTabStyle: React.CSSProperties = {
    backgroundColor: "#FFFFFF",
    color: "#1d1d1f",
    fontWeight: 600,
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
}
const infoTextStyle: React.CSSProperties = {
    fontSize: "13px",
    color: "#86868b",
    marginTop: "4px",
}
const listContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
}
const cardStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px",
    borderRadius: "16px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxSizing: "border-box",
}
const leftContentStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
}
const radioCircleStyle: React.CSSProperties = {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    borderWidth: "2px",
    borderStyle: "solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
    flexShrink: 0,
    marginTop: "2px",
}
const radioDotStyle: React.CSSProperties = {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#FFFFFF",
}
const textStackStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
}
const priceTextStyle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1d1d1f",
}
const dropdownStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 500,
    color: "#4B5563",
    padding: "6px 8px",
    borderRadius: "8px",
    border: "1px solid #D1D5DB",
    backgroundColor: "#F9FAFB",
    outline: "none",
    cursor: "pointer",
    marginTop: "2px",
    fontFamily: "inherit",
}
const dataTextStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#6B7280",
    fontWeight: 500,
    marginTop: "2px",
}
const rightContentStyle: React.CSSProperties = {
    fontSize: "15px",
    fontWeight: 600,
    color: "#3B82F6",
    textAlign: "right",
    whiteSpace: "nowrap",
    alignSelf: "center",
}
const summaryContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    paddingBottom: "20px",
}
const dividerStyle: React.CSSProperties = {
    width: "100%",
    height: "1px",
    backgroundColor: "#E5E7EB",
    marginBottom: "8px",
}
const rowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
}
const rowLabelStyle: React.CSSProperties = {
    fontSize: "15px",
    color: "#4B5563",
    fontWeight: 400,
}
const rowValueStyle: React.CSSProperties = {
    fontSize: "16px",
    color: "#1d1d1f",
    fontWeight: 500,
}
const finalLabelStyle: React.CSSProperties = {
    fontSize: "18px",
    color: "#1d1d1f",
    fontWeight: 600,
}
const finalValueStyle: React.CSSProperties = {
    fontSize: "22px",
    color: "#1d1d1f",
    fontWeight: 700,
}
const infoSectionContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    paddingTop: "24px",
    borderTop: "1px solid #E5E7EB",
}
const infoHeaderStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 600,
    color: "#1d1d1f",
}
const infoRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
}
const infoLabelStyle: React.CSSProperties = {
    width: "80px",
    fontSize: "15px",
    color: "#6B7280",
    fontWeight: 400,
}
const infoValueStyle: React.CSSProperties = {
    flex: 1,
    fontSize: "15px",
    color: "#1d1d1f",
    fontWeight: 400,
    textAlign: "right",
}

// ✅ [추가] 툴팁 스타일 정의
const tooltipStyle: React.CSSProperties = {
    backgroundColor: "#F3F4F6",
    borderRadius: "12px",
    padding: "16px",
    marginTop: "8px",
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
}
const tooltipIconStyle: React.CSSProperties = {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    backgroundColor: "#9CA3AF",
    color: "white",
    fontSize: "11px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: "2px",
    fontFamily: "serif",
}
const tooltipTextStyle: React.CSSProperties = {
    fontSize: "11px",
    color: "#4B5563",
    lineHeight: "1.5",
    fontWeight: "medium",
    letterSpacing: "-0.02em",
    wordBreak: "keep-all",
}

addPropertyControls(PlanSelector, {
    selectedPlanId: {
        type: ControlType.String,
        defaultValue: "plan_90",
    },
    discountMode: {
        type: ControlType.Enum,
        options: ["device", "plan"],
        defaultValue: "plan",
    },
    originPrice: { type: ControlType.Number, defaultValue: 1250000 },
    ktMarketDiscount: { type: ControlType.Number, defaultValue: 0 },
})
