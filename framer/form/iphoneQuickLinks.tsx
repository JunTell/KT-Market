import * as React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { addPropertyControls, ControlType } from "framer"

// --- Supabase Setup ---
const supabaseUrl = "https://crooiozzbjwdaghqddnu.supabase.co"
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyb29pb3p6Ymp3ZGFnaHFkZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3NzIzNjMsImV4cCI6MjAyNTM0ODM2M30.A51d6iu60yiGWL4cka8j9-r6QLQ2skXAHiqBGaTIEcM"
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- 기기별 이미지 폴더·색상 ---
const DEVICE_IMAGES: Record<string, { folder: string; color: string }> = {
    "aip17e-256":  { folder: "iphone17e",      color: "black" },
    "aip17-256":   { folder: "iphone17",        color: "black" },
    "aip17p-256":  { folder: "iphone17pro",     color: "natural_titanium" },
    "aip17pm-256": { folder: "iphone17promax",  color: "natural_titanium" },
    "aipa-256":    { folder: "iphone17air",     color: "black" },
}

// --- 요금제 데이터 정보 (iPhone 17 — 번호이동 기준) ---
const PLAN_INFO = {
    ppllistobj_0937: {
        title: "(유튜브 프리미엄) 초이스 베이직",
        planPrice: 90000,
        type: "youtube",
    },
    ppllistobj_0993: {
        title: "가전구독 초이스 스페셜",
        planPrice: 110000,
        type: "appliance",
    },
    ppllistobj_0864: {
        title: "디바이스 초이스 스페셜",
        planPrice: 110000,
        type: "device",
    },
}

const BASE_URL = "https://ktmarket.co.kr/phone"

const IPHONE17_LINKS = [
    {
        category: "아이폰 17e 256GB",
        modelCode: "aip17e-256",
        items: [
            { planId: "ppllistobj_0937", url: `${BASE_URL}/aip17e-256?plan=ppllistobj_0937` },
            { planId: "ppllistobj_0993", url: `${BASE_URL}/aip17e-256?plan=ppllistobj_0993` },
            { planId: "ppllistobj_0864", url: `${BASE_URL}/aip17e-256?plan=ppllistobj_0864` },
        ],
    },
    {
        category: "아이폰 17 256GB",
        modelCode: "aip17-256",
        items: [
            { planId: "ppllistobj_0937", url: `${BASE_URL}/aip17-256?plan=ppllistobj_0937` },
            { planId: "ppllistobj_0993", url: `${BASE_URL}/aip17-256?plan=ppllistobj_0993` },
            { planId: "ppllistobj_0864", url: `${BASE_URL}/aip17-256?plan=ppllistobj_0864` },
        ],
    },
    {
        category: "아이폰 17 프로 256GB",
        modelCode: "aip17p-256",
        items: [
            { planId: "ppllistobj_0937", url: `${BASE_URL}/aip17p-256?plan=ppllistobj_0937` },
            { planId: "ppllistobj_0993", url: `${BASE_URL}/aip17p-256?plan=ppllistobj_0993` },
            { planId: "ppllistobj_0864", url: `${BASE_URL}/aip17p-256?plan=ppllistobj_0864` },
        ],
    },
    {
        category: "아이폰 17 프로맥스 256GB",
        modelCode: "aip17pm-256",
        items: [
            { planId: "ppllistobj_0937", url: `${BASE_URL}/aip17pm-256?plan=ppllistobj_0937` },
            { planId: "ppllistobj_0993", url: `${BASE_URL}/aip17pm-256?plan=ppllistobj_0993` },
            { planId: "ppllistobj_0864", url: `${BASE_URL}/aip17pm-256?plan=ppllistobj_0864` },
        ],
    },
    {
        category: "아이폰 17 에어 256GB",
        modelCode: "aipa-256",
        items: [
            { planId: "ppllistobj_0937", url: `${BASE_URL}/aipa-256?plan=ppllistobj_0937` },
            { planId: "ppllistobj_0993", url: `${BASE_URL}/aipa-256?plan=ppllistobj_0993` },
            { planId: "ppllistobj_0864", url: `${BASE_URL}/aipa-256?plan=ppllistobj_0864` },
        ],
    },
]

// 지원금 구간 매칭 (번호이동 기준)
function calcKTmarketSubsidy(
    planId: string,
    planPrice: number,
    ktmarketSubsidies: any
): number {
    const discount = "device"
    const register = "mnp"
    if (planPrice <= 0 || !ktmarketSubsidies) return 0

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

    return ktmarketSubsidies[matchedKey] ?? 0
}

export default function Iphone17QuickLinks(props) {
    const { pageType = "youtube" } = props
    const [prices, setPrices] = useState<
        Record<
            string,
            Record<
                string,
                { orig: number; final: number; disclosure: number; ktmarket: number }
            >
        >
    >({})
    const [isLoading, setIsLoading] = useState(true)

    const fetchPricing = async () => {
        setIsLoading(true)
        try {
            const models = IPHONE17_LINKS.map((g) => g.modelCode)
            const { data: devices } = await supabase
                .from("devices")
                .select(`*, device_plans_mnp (*)`)
                .in("model", models)
            const { data: subsidies } = await supabase
                .from("ktmarket_subsidy")
                .select("*")
                .in("model", models)

            const newPrices: any = {}
            devices?.forEach((device) => {
                newPrices[device.model] = {}
                const deviceSubsidies = subsidies?.find((s) => s.model === device.model)
                Object.keys(PLAN_INFO).forEach((planId) => {
                    const planInfo = PLAN_INFO[planId]
                    const planData = device.device_plans_mnp?.find(
                        (p: any) => p.plan_id === planId
                    )
                    const disclosureSubsidy = planData?.disclosure_subsidy ?? 0
                    const ktmarketSubsidy = calcKTmarketSubsidy(
                        planId,
                        planInfo.planPrice,
                        deviceSubsidies
                    )
                    const discountPrice =
                        device.price - disclosureSubsidy - ktmarketSubsidy
                    newPrices[device.model][planId] = {
                        orig: device.price,
                        final: discountPrice > 0 ? discountPrice : 0,
                        disclosure: disclosureSubsidy,
                        ktmarket: ktmarketSubsidy,
                    }
                })
            })
            setPrices(newPrices)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchPricing()
    }, [])

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h1 style={titleStyle}>원하시는 모델을 선택해주세요</h1>
            </div>
            <div style={contentStyle}>
                {IPHONE17_LINKS.map((group, groupIdx) => {
                    const filteredItems = group.items.filter(
                        (item) => PLAN_INFO[item.planId].type === pageType
                    )
                    const img = DEVICE_IMAGES[group.modelCode]

                    return (
                        <React.Fragment key={groupIdx}>
                            {filteredItems.map((item, itemIdx) => {
                                const pricing = prices[group.modelCode]?.[item.planId]
                                const discountRate = pricing
                                    ? Math.round(
                                          ((pricing.orig - pricing.final) /
                                              pricing.orig) *
                                              100
                                      )
                                    : 0

                                return (
                                    <div
                                        key={`${groupIdx}-${itemIdx}`}
                                        style={cardStyle}
                                        onClick={() => window.open(item.url, "_blank")}
                                    >
                                        {/* 이미지 */}
                                        <div style={imageBoxStyle}>
                                            <img
                                                src={`https://juntell.s3.ap-northeast-2.amazonaws.com/phone/${img?.folder}/${img?.color}/01.png`}
                                                style={imageStyle}
                                                onError={(e) => {
                                                    ;(e.target as HTMLImageElement).style.display = "none"
                                                }}
                                            />
                                        </div>

                                        {/* 텍스트 */}
                                        <div style={infoBoxStyle}>
                                            <span style={petNameStyle}>
                                                {group.category}
                                            </span>
                                            <span style={finalPriceStyle}>
                                                {isLoading
                                                    ? "계산 중..."
                                                    : pricing?.final != null
                                                    ? `${pricing.final.toLocaleString()}원`
                                                    : "-"}
                                            </span>
                                            {!isLoading && discountRate > 0 && (
                                                <div style={discountBadgeStyle}>
                                                    <svg
                                                        width="10"
                                                        height="8"
                                                        viewBox="0 0 10 8"
                                                        fill="none"
                                                    >
                                                        <path
                                                            d="M5 8L0 0H10L5 8Z"
                                                            fill="#EF4444"
                                                        />
                                                    </svg>
                                                    <span style={discountTextStyle}>
                                                        {discountRate}%
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* 보러가기 버튼 */}
                                        <div style={ctaButtonStyle}>보러가기</div>
                                    </div>
                                )
                            })}
                        </React.Fragment>
                    )
                })}
            </div>
        </div>
    )
}

addPropertyControls(Iphone17QuickLinks, {
    pageType: {
        type: ControlType.Enum,
        title: "페이지 요금제 유형",
        options: ["youtube", "appliance", "device"],
        optionTitles: [
            "유튜브 초이스 베이직",
            "가전구독 초이스 스페셜",
            "디바이스 초이스 스페셜",
        ],
    },
})

// --- 스타일 ---
const containerStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "500px",
    margin: "0 auto",
    backgroundColor: "#FFFFFF",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Pretendard, sans-serif",
}
const headerStyle: React.CSSProperties = {
    padding: "30px 20px 10px 20px",
}
const titleStyle: React.CSSProperties = {
    fontSize: "18px",
    fontWeight: 700,
    color: "#191F28",
    lineHeight: "1.4",
    margin: 0,
}
const contentStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
}
const cardStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "clamp(10px, 2.5vw, 16px)",
    padding: "16px clamp(12px, 3vw, 20px)",
    backgroundColor: "white",
    cursor: "pointer",
    borderBottom: "1px solid #F4F4F5",
    width: "100%",
    boxSizing: "border-box",
    overflow: "hidden",
}
const imageBoxStyle: React.CSSProperties = {
    width: "clamp(88px, 22vw, 110px)",
    height: "clamp(88px, 22vw, 110px)",
    minWidth: "clamp(88px, 22vw, 110px)",
    borderRadius: "14px",
    backgroundColor: "#F4F5F7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
}
const imageStyle: React.CSSProperties = {
    width: "clamp(70px, 18vw, 90px)",
    height: "clamp(70px, 18vw, 90px)",
    objectFit: "contain",
}
const infoBoxStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
}
const petNameStyle: React.CSSProperties = {
    fontSize: "clamp(12px, 3.2vw, 14px)",
    fontFamily: "Pretendard Medium, sans-serif",
    color: "#868E96",
    letterSpacing: -0.24,
    lineHeight: 1.4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
}
const finalPriceStyle: React.CSSProperties = {
    fontSize: "clamp(18px, 5vw, 22px)",
    fontFamily: "Pretendard Bold, sans-serif",
    fontWeight: 700,
    color: "#24292E",
    letterSpacing: "-0.5px",
}
const discountBadgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    backgroundColor: "#FEE2E2",
    borderRadius: "8px",
    padding: "4px 8px",
    width: "fit-content",
    marginTop: "2px",
}
const discountTextStyle: React.CSSProperties = {
    fontSize: "clamp(11px, 3vw, 13px)",
    fontFamily: "Pretendard Bold, sans-serif",
    fontWeight: 700,
    color: "#EF4444",
    letterSpacing: -0.24,
    lineHeight: 1.5,
}
const ctaButtonStyle: React.CSSProperties = {
    flexShrink: 0,
    padding: "9px clamp(10px, 3vw, 16px)",
    borderRadius: "12px",
    backgroundColor: "#EFF6FF",
    color: "#3B82F6",
    fontSize: "clamp(12px, 3.2vw, 14px)",
    fontFamily: "Pretendard Medium, sans-serif",
    fontWeight: 600,
    textAlign: "center",
    whiteSpace: "nowrap",
    letterSpacing: -0.24,
    lineHeight: 1.4,
}
