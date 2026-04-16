import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { createClient } from "@supabase/supabase-js"
import GongguDealCard from "https://framer.com/m/GongguDealCard-zD4y.js@R3T7VSBgmw4SzUm2H8Hb"
import {
    getDeviceImageUrl,
    getDeviceImageUrls,
} from "https://framer.com/m/ImageURL-ZpyQ.js@jxQ3mJka4J3c1PpXMlnv"

// --- Supabase 설정 ---
const supabaseUrl = "https://crooiozzbjwdaghqddnu.supabase.co"
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyb29pb3p6Ymp3ZGFnaHFkZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3NzIzNjMsImV4cCI6MjAyNTM0ODM2M30.A51d6iu60yiGWL4cka8j9-r6QLQ2skXAHiqBGaTIEcM"

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 재고 현황 (재고.md 기준 2026-04-06) — 모델별 총 잔여 수량
const TOTAL_STOCK_MAP: Record<string, number> = {
    "aip17-256": 75,  // BK16 + PE4 + WE55 (BE 품절)
    "aip17e-256": 50,  // BK13 + PK23 + WE14
    "aip17p-256": 12,  // BE12
    "aip17p-512": 4,   // SR4
    "aip17pm-256": 5,   // BE5
    "aip17pm-512": 18,  // SR18
    "aipa-1t": 2,   // BE1 + BK1
    "aipa-256": 25,  // BE6 + BK5 + GD8 + WE6
    "aipa-512": 34,  // BE5 + BK14 + GD4 + WE11
}

// 현재 모델(17시리즈) 추가 및 중복 오타 수정
const GONGGU_MODELS = [
    "aip17e-256",
    // "aip17e-512",
    "aip17-256",
    // "aip17-512",
    // "aip17p-256",
    // "aip17p-512",
    // "aip17pm-256",
    "aip17pm-512",
    "aipa-256",
    "aipa-512",
]

type Mode = "device" | "plan"
type RegType = "chg" | "mnp"

interface AsamoDeal {
    model: string
    title: string
    capacity: string
    originPrice: number
    disclosureSubsidy: number
    ktmarketDiscount: number
    specialDiscount: number
    planMonthlyDiscount: number
    imageUrl: string
    imageUrls: string[]
    totalStock: number // -1 = 데이터 없음, 0 = 품절, 양수 = 잔여 수량
}

interface Props {
    sectionTitle: string
    planId: string
    userCarrier?: string
    registrationType?: RegType
}

export default function AsamoList(props: Props) {
    const { sectionTitle, planId } = props

    const [mode, setMode] = React.useState<Mode>("device")
    const [deals, setDeals] = React.useState<AsamoDeal[]>([])
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState<string | null>(null)

    // 통신사 초기값 설정
    const [selectedCarrier, setSelectedCarrier] = React.useState(() => {
        if (props.userCarrier) return props.userCarrier
        if (typeof window !== "undefined") {
            try {
                const prefStr = sessionStorage.getItem("asamo_user_preference")
                if (prefStr) {
                    const pref = JSON.parse(prefStr)
                    if (pref.userCarrier) return pref.userCarrier
                }
            } catch (e) {
                console.error(e)
            }
        }
        return "LG U+"
    })

    // 가입유형 초기값 설정
    const [registrationType, setRegistrationType] = React.useState<RegType>(
        () => {
            if (props.registrationType) return props.registrationType
            if (typeof window !== "undefined") {
                try {
                    const prefStr = sessionStorage.getItem(
                        "asamo_user_preference"
                    )
                    if (prefStr) {
                        const pref = JSON.parse(prefStr)
                        if (pref.registrationType) return pref.registrationType
                        if (pref.userCarrier) {
                            return pref.userCarrier === "KT" ? "chg" : "mnp"
                        }
                    }
                } catch (e) {
                    console.error(e)
                }
            }
            return "mnp"
        }
    )

    // Props 변경 동기화
    React.useEffect(() => {
        if (props.userCarrier && props.userCarrier !== selectedCarrier) {
            setSelectedCarrier(props.userCarrier)
        }
        if (
            props.registrationType &&
            props.registrationType !== registrationType
        ) {
            setRegistrationType(props.registrationType)
        }
    }, [props.userCarrier, props.registrationType])

    const [rawDevices, setRawDevices] = React.useState<any[]>([])
    const [rawSubsidies, setRawSubsidies] = React.useState<any[]>([])

    // 데이터 가져오기
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)

                const planTable =
                    registrationType === "chg"
                        ? "device_plans_chg"
                        : "device_plans_mnp"

                const { data: devicesData, error: devicesError } =
                    await supabase
                        .from("devices")
                        .select(`*, ${planTable} (*)`)
                        .in("model", GONGGU_MODELS)
                        .eq(`${planTable}.plan_id`, planId)

                if (devicesError) throw devicesError

                const { data: subsidiesData, error: subsidiesError } =
                    await supabase
                        .from("ktmarket_subsidy")
                        .select("*")
                        .in("model", GONGGU_MODELS)

                if (subsidiesError) throw subsidiesError

                setRawDevices(devicesData ?? [])
                setRawSubsidies(subsidiesData ?? [])
                setError(null)
            } catch (err: any) {
                console.error("Fetch Error:", err)
                setError("공구 정보를 불러오지 못했습니다.")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [planId, registrationType])

    // 데이터 계산 및 매핑
    React.useEffect(() => {
        if (rawDevices.length === 0) return

        const planTableKey =
            registrationType === "chg" ? "device_plans_chg" : "device_plans_mnp"

        const mapped: AsamoDeal[] = rawDevices
            .map((device: any) => {
                const planList = device[planTableKey] || []
                const plan = planList[0]
                if (!plan) return null

                const originPrice = device.price ?? 0
                const disclosureSubsidy = plan.disclosure_subsidy ?? 0
                const subsidyRow = rawSubsidies?.find(
                    (s) => s.model === device.model
                )

                const ktmarketDiscount = calcKTmarketSubsidy(
                    planId,
                    plan.price ?? 0,
                    subsidyRow,
                    registrationType
                )

                // 번호이동 금액 추가지원금 일괄 삭제
                const specialDiscount = 0

                const planMonthlyDiscount = Math.floor((plan.price ?? 0) * 0.25)
                const imageUrls = getDeviceImageUrls(device)

                return {
                    model: device.model,
                    title: device.pet_name ?? device.model,
                    capacity: device.capacity ?? "",
                    originPrice,
                    disclosureSubsidy,
                    ktmarketDiscount,
                    specialDiscount,
                    planMonthlyDiscount,
                    imageUrl: getDeviceImageUrl(device),
                    imageUrls: imageUrls,
                    totalStock: TOTAL_STOCK_MAP[device.model] ?? 0,
                }
            })
            .filter(Boolean)

        const sortedDeals: AsamoDeal[] = []
        GONGGU_MODELS.forEach((modelKey) => {
            const foundDeals = mapped.filter((m) => m.model === modelKey)
            if (foundDeals.length > 0) {
                const dealToAdd = foundDeals.shift()
                if (dealToAdd) {
                    sortedDeals.push(dealToAdd)
                    const index = mapped.findIndex((m) => m === dealToAdd)
                    if (index > -1) mapped.splice(index, 1)
                }
            }
        })

        setDeals(sortedDeals)
    }, [mode, rawDevices, rawSubsidies, planId, registrationType])

    const handleCarrierChange = (newCarrier: string) => {
        const newRegType: RegType = newCarrier === "KT" ? "chg" : "mnp"

        setSelectedCarrier(newCarrier)
        setRegistrationType(newRegType)

        try {
            const prefData = {
                carrierSelected: true,
                userCarrier: newCarrier,
                registrationType: newRegType,
                savedAt: new Date().toISOString(),
            }
            sessionStorage.setItem(
                "asamo_user_preference",
                JSON.stringify(prefData)
            )

            const existing = sessionStorage.getItem("asamoDeal")
            const parsed = existing ? JSON.parse(existing) : {}
            sessionStorage.setItem(
                "asamoDeal",
                JSON.stringify({ ...parsed, ...prefData })
            )
        } catch (e) {
            console.error("Session Save Error", e)
        }
    }

    return (
        <div style={containerStyle}>
            {/* 타이틀 */}
            <div style={headerContainerStyle}>
                <h2 style={titleStyle}>{sectionTitle}</h2>
            </div>

            {/* 1. 통신사 선택 */}
            <CarrierSelector
                selected={selectedCarrier}
                onChange={handleCarrierChange}
            />

            <div style={infoTextStyle}>
                <span>
                    {registrationType === "chg"
                        ? "이용중인 KT 번호 그대로 핸드폰만 바꿀 수 있어요"
                        : `쓰던 번호 그대로 ${selectedCarrier} 통신사를 KT로 바꿀 수 있어요`}
                </span>
            </div>

            {/* 2. 할인 방법 선택 */}
            <div style={{ marginTop: "30px", marginBottom: "10px" }}>
                <h3 style={subHeaderStyle}>할인 방법을 선택해주세요</h3>

                <div style={tabContainerStyle}>
                    <div
                        style={{
                            ...tabItemStyle,
                            backgroundColor: isDevice(mode)
                                ? "#FFFFFF"
                                : "transparent",
                            color: isDevice(mode) ? "#1d1d1f" : "#86868b",
                            boxShadow: isDevice(mode)
                                ? "0 2px 4px rgba(0,0,0,0.08)"
                                : "none",
                        }}
                        onClick={() => setMode("device")}
                    >
                        기기 할인
                    </div>
                    <div
                        style={{
                            ...tabItemStyle,
                            backgroundColor: !isDevice(mode)
                                ? "#FFFFFF"
                                : "transparent",
                            color: !isDevice(mode) ? "#1d1d1f" : "#86868b",
                            boxShadow: !isDevice(mode)
                                ? "0 2px 4px rgba(0,0,0,0.08)"
                                : "none",
                        }}
                        onClick={() => setMode("plan")}
                    >
                        요금 할인
                    </div>
                </div>

                <div style={infoTextStyle}>
                    <span style={{ marginRight: "4px" }}>ℹ️</span>
                    {mode === "device"
                        ? "공통지원금과 KT마켓지원금을 함께 받아요"
                        : "매월 요금25%와 KT마켓지원금을 함께 받아요"}
                </div>
            </div>

            {/* 3. 리스트 영역 */}
            <div style={listContainerStyle}>
                {loading && <div style={msgStyle}>정보를 불러오는 중...</div>}
                {error && (
                    <div style={{ ...msgStyle, color: "red" }}>{error}</div>
                )}

                {!loading && !error && deals.length > 0 && (
                    <div style={groupContainerStyle}>
                        <div style={groupHeaderStyle}>최신 모델</div>
                        {deals.map((deal, idx) => {
                            const isSoldOut = deal.totalStock === 0
                            return (
                                <div key={`deal-${deal.model}-${idx}`}>
                                    <StockUrgencyBanner
                                        totalStock={deal.totalStock}
                                    />
                                    <div
                                        style={{
                                            position: "relative",
                                            opacity: isSoldOut ? 0.45 : 1,
                                            transition: "opacity 0.2s",
                                        }}
                                    >
                                        <GongguDealCard
                                            title={deal.title}
                                            capacity={deal.capacity}
                                            originPrice={deal.originPrice}
                                            disclosureSubsidy={deal.disclosureSubsidy}
                                            ktmarketDiscount={deal.ktmarketDiscount}
                                            specialDiscount={deal.specialDiscount}
                                            planMonthlyDiscount={deal.planMonthlyDiscount}
                                            mode={mode}
                                            model={deal.model}
                                            detailPath={isSoldOut ? "" : `/asamo-page/asamo-detail`}
                                            imageUrl={deal.imageUrl}
                                            imageUrls={deal.imageUrls}
                                        />
                                        {isSoldOut && (
                                            <div
                                                style={{
                                                    position: "absolute",
                                                    inset: 0,
                                                    cursor: "not-allowed",
                                                    borderRadius: "inherit",
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}

// --- Stock Urgency Banner ---
function StockUrgencyBanner({ totalStock }: { totalStock: number }) {
    if (totalStock > 20) return null

    const isUrgent = totalStock <= 5
    const isSoldOut = totalStock === 0

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "9px 14px",
                borderRadius: "10px",
                marginBottom: "8px",
                fontSize: "13px",
                fontWeight: 600,
                backgroundColor: isSoldOut
                    ? "#F3F4F6"
                    : isUrgent
                        ? "#FFF1F0"
                        : "#FFF8F0",
                color: isSoldOut
                    ? "#86868b"
                    : isUrgent
                        ? "#FF3B30"
                        : "#FF9500",
            }}
        >
            <span>{isSoldOut ? "⚠️" : isUrgent ? "🔥" : "⏰"}</span>
            <span>
                {isSoldOut
                    ? "현재 일시품절 상태입니다"
                    : isUrgent
                        ? `잔여 ${totalStock}개 · 지금 바로 신청하세요`
                        : `마감 임박 · 잔여 ${totalStock}개`}
            </span>
        </div>
    )
}

// --- Carrier Selector Components ---
const CARRIERS = ["SKT", "KT", "LG U+", "알뜰폰"]

function CarrierSelector({
    selected,
    onChange,
}: {
    selected: string
    onChange: (v: string) => void
}) {
    const [isOpen, setIsOpen] = React.useState(false)

    const toggle = () => setIsOpen(!isOpen)
    const handleSelect = (val: string) => {
        onChange(val)
        setIsOpen(false)
    }

    const collapsedStyle: React.CSSProperties = {
        width: "100%",
        height: "60px",
        backgroundColor: "#FFFFFF",
        borderRadius: "20px",
        border: "1px solid #E5E5EA",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        cursor: "pointer",
        transition: "all 0.2s ease",
    }

    const expandedContainerStyle: React.CSSProperties = {
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderRadius: "24px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        border: "1px solid #E5E5EA",
    }

    if (isOpen) {
        return (
            <div style={expandedContainerStyle}>
                <div
                    style={{
                        fontSize: "18px",
                        fontWeight: 600,
                        color: "#1d1d1f",
                        marginBottom: "8px",
                    }}
                >
                    어떤 통신사를 이용 중인가요?
                </div>
                {CARRIERS.map((carrier) => (
                    <CarrierOption
                        key={carrier}
                        label={carrier}
                        isSelected={selected === carrier}
                        onClick={() => handleSelect(carrier)}
                    />
                ))}
            </div>
        )
    }

    return (
        <div style={collapsedStyle} onClick={toggle}>
            <div style={{ display: "flex", gap: "8px", fontSize: "16px" }}>
                <span style={{ color: "#86868b", fontWeight: 500 }}>
                    현재 통신사
                </span>
                <span
                    style={{
                        color: "#1d1d1f",
                        fontWeight: 600,
                    }}
                >
                    {selected} 사용 중
                </span>
            </div>
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                <path
                    d="M1 1L7 7L13 1"
                    stroke="#86868B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    )
}

function CarrierOption({
    label,
    isSelected,
    onClick,
}: {
    label: string
    isSelected: boolean
    onClick: () => void
}) {
    const [isHovered, setIsHovered] = React.useState(false)

    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                width: "100%",
                padding: "16px 20px",
                borderRadius: "16px",
                backgroundColor: "#F5F5F7",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
                transition: "background-color 0.2s ease",
            }}
        >
            <span
                style={{
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#1d1d1f",
                }}
            >
                {label}
            </span>
            {isSelected ? (
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="12" cy="12" r="12" fill="#5CCA5F" />
                    <path
                        d="M8 12L11 15L16 9"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ) : (
                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <circle cx="12" cy="12" r="12" fill="#D1D1D6" />
                    <path
                        d="M8 12L11 15L16 9"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </div>
    )
}

// --- Helper Functions ---
function isDevice(mode: Mode) {
    return mode === "device"
}

// 지원금 계산 로직
function calcKTmarketSubsidy(
    planId: string,
    planPrice: number,
    subsidyRow: any,
    registrationType: RegType
): number {
    if (!subsidyRow) return 0
    if (planPrice <= 0) return 0

    const discount = "device"
    const register = registrationType

    const forceTierByPlanId: Record<string, number> = {
        ppllistobj_0893: 61000,
        ppllistobj_0778: 61000,
        ppllistobj_0844: 61000,
        ppllistobj_0845: 37000,
        ppllistobj_0535: 37000,
        ppllistobj_0765: 37000,
        ppllistobj_0775: 37000,
    }

    const forcedTier = forceTierByPlanId[planId]
    const priceTiers = [110000, 100000, 90000, 61000, 37000]
    let matchedKey = ""

    if (forcedTier) {
        matchedKey = `${discount}_discount_${register}_gte_${forcedTier}`
    } else {
        for (const tier of priceTiers) {
            if (planPrice >= tier) {
                matchedKey = `${discount}_discount_${register}_gte_${tier}`
                break
            }
        }
        if (!matchedKey) {
            matchedKey = `${discount}_discount_${register}_lt_37000`
        }
    }

    let subsidy = subsidyRow[matchedKey] ?? 0

    return subsidy
}

// --- Styles ---
const containerStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    padding: "20px 0",
}
const headerContainerStyle: React.CSSProperties = {
    textAlign: "left",
    marginBottom: "20px",
}
const titleStyle: React.CSSProperties = {
    fontSize: "26px",
    fontWeight: 600,
    color: "#1d1d1f",
    margin: 0,
}
const subHeaderStyle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: 600,
    color: "#1d1d1f",
    marginBottom: "12px",
    marginTop: "0px",
}
const infoTextStyle: React.CSSProperties = {
    fontSize: "13px",
    color: "#86868b",
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
}
const tabContainerStyle: React.CSSProperties = {
    width: "100%",
    height: "50px",
    borderRadius: "12px",
    backgroundColor: "#F5F5F7",
    padding: "4px",
    display: "flex",
    boxSizing: "border-box",
}
const tabItemStyle: React.CSSProperties = {
    flex: 1,
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s ease",
    userSelect: "none",
}
const listContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    marginTop: "30px",
    gap: "24px",
}
const groupContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
}
const groupHeaderStyle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1d1d1f",
    paddingLeft: "4px",
    marginBottom: "-8px",
}
const msgStyle: React.CSSProperties = {
    textAlign: "center",
    padding: "40px",
    color: "#86868b",
    fontSize: "14px",
}

addPropertyControls(AsamoList, {
    sectionTitle: {
        type: ControlType.String,
        defaultValue: "오늘의 공구",
    },
    planId: {
        type: ControlType.String,
        defaultValue: "ppllistobj_0747",
    },
})
