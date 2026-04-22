// 가정의 달 이벤트 - BuyNowSection
// Figma node 2405:5024 기반 — "지금 가장 좋은 특가 핸드폰이에요"
// 대상 기종: iPhone 17, 갤럭시 S26, 갤럭시 Jump4, 갤럭시 S25FE, 아이폰 17E, 갤럭시 폴드7

import { addPropertyControls, ControlType } from "framer"
import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { createClient } from "@supabase/supabase-js"

const FONT = '"Pretendard", "Inter", sans-serif'
const FONT_TITLE_KO = '"Cafe24 Ohsquare OTF", "Pretendard", sans-serif'
const FONT_TITLE_POP = '"ONE Mobile POP", "Pretendard", sans-serif'

const supabaseUrl = "https://crooiozzbjwdaghqddnu.supabase.co"
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNyb29pb3p6Ymp3ZGFnaHFkZG51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk3NzIzNjMsImV4cCI6MjAyNTM0ODM2M30.A51d6iu60yiGWL4cka8j9-r6QLQ2skXAHiqBGaTIEcM"
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ─── 가정의 달 대상 기종 ──────────────────────────────────
// 아이폰 17e / 아이폰 17 / 갤럭시 S26 (기본·플러스·울트라) / 갤럭시 점프4 / 갤럭시 A17
const TARGET_PREFIXES = [
    "aip17e",   // iPhone 17e
    "aip17-",   // iPhone 17
    "sm-s942",  // Galaxy S26
    "sm-s947",  // Galaxy S26+
    "sm-s948",  // Galaxy S26 Ultra
    "sm-m366",  // Galaxy Jump4
    "sm-a175",  // Galaxy A17
]

const isTargetModel = (model: string) =>
    TARGET_PREFIXES.some((p) => model.startsWith(p))

const getModelPriority = (model: string): number => {
    if (model.startsWith("aip17e")) return 1
    if (model.startsWith("aip17-")) return 2
    if (model.startsWith("sm-s942")) return 3
    if (model.startsWith("sm-s947")) return 4
    if (model.startsWith("sm-s948")) return 5
    if (model.startsWith("sm-m366")) return 6
    if (model.startsWith("sm-a175")) return 7
    return 99
}

// 모델별 추천 배지 설정
type RecommendBadge = { label: string; bg: string; color: string }
const RECOMMEND_BADGES: { prefix: string; badge: RecommendBadge }[] = [
    {
        prefix: "sm-m366", // Jump4 → 어린이 추천
        badge: { label: "어린이 추천", bg: "#60A5FA", color: "#FFFFFF" },
    },
    {
        prefix: "sm-a175", // A17 → 부모님 추천
        badge: { label: "부모님 추천", bg: "#EB408A", color: "#FFFFFF" },
    },
]

function getRecommendBadge(model: string): RecommendBadge | null {
    const found = RECOMMEND_BADGES.find(({ prefix }) => model.startsWith(prefix))
    return found ? found.badge : null
}

// ─── KT마켓 지원금 계산 ──────────────────────────────────
const YOUTUBE_PLAN_PIDS = new Set(["ppllistobj_0937", "ppllistobj_0938", "ppllistobj_0939"])

function calcKTmarketSubsidy(_product: any, ktmarketSubsidies: any): number {
    const discount = "device"
    const register = "chg"
    const planPrice = 90000
    const planId = "ppllistobj_0937"
    if (!ktmarketSubsidies || typeof ktmarketSubsidies !== "object") return 0

    const forceTierByPlanId: Record<string, number> = {
        ppllistobj_0893: 61000, ppllistobj_0778: 61000, ppllistobj_0844: 61000,
        ppllistobj_0845: 37000, ppllistobj_0535: 37000, ppllistobj_0765: 37000, ppllistobj_0775: 37000,
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
        if (!matchedKey) matchedKey = `${discount}_discount_${register}_lt_37000`
    }
    return (ktmarketSubsidies[matchedKey] ?? 0) + (YOUTUBE_PLAN_PIDS.has(planId) ? 30000 : 0)
}

// ─── 모션 ─────────────────────────────────────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}
const staggerWrap = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
}
const cardMotion = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

// ─── 상품 카드 ────────────────────────────────────────────
function ProductCard({
    product,
    subsidies,
    recommendBadge,
}: {
    product: any
    subsidies: any
    recommendBadge: RecommendBadge | null
}) {
    const ktSub = calcKTmarketSubsidy(product, subsidies)
    const disclosure = product.device_plans_chg?.[0]?.disclosure_subsidy ?? 0
    const finalPrice = Math.max(product.price - disclosure - ktSub, 0)
    const discountRate = product.price > 0
        ? Math.round(((product.price - finalPrice) / product.price) * 100)
        : 0

    const colorKey = product.thumbnail || product.colors_en?.[0] || "black"
    const imageList = product.images?.[colorKey] ?? []
    const imageKey = imageList[0] ?? null
    const imageUrl = imageKey
        ? `https://juntell.s3.ap-northeast-2.amazonaws.com/phone/${product.category}/${colorKey}/${imageKey}.png`
        : ""

    return (
        <motion.div
            variants={cardMotion}
            style={{
                position: "relative",
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
            }}
            onClick={() => {
                window.location.href = `/phone/${product.model}`
            }}
        >
            <div
                style={{
                    width: "clamp(88px, 22vw, 110px)",
                    height: "clamp(88px, 22vw, 110px)",
                    minWidth: "clamp(88px, 22vw, 110px)",
                    borderRadius: 14,
                    backgroundColor: "#F4F5F7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    flexShrink: 0,
                }}
            >
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt=""
                        style={{
                            width: "clamp(70px, 18vw, 90px)",
                            height: "clamp(70px, 18vw, 90px)",
                            objectFit: "contain",
                        }}
                    />
                )}
            </div>

            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                <span
                    style={{
                        fontSize: "clamp(12px, 3.2vw, 14px)",
                        fontFamily: FONT,
                        fontWeight: 500,
                        color: "#868E96",
                        letterSpacing: -0.24,
                        lineHeight: 1.4,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {product.pet_name}
                </span>
                <span
                    style={{
                        fontSize: "clamp(18px, 5vw, 22px)",
                        fontFamily: FONT,
                        fontWeight: 700,
                        color: "#24292E",
                        letterSpacing: "-0.5px",
                    }}
                >
                    {finalPrice.toLocaleString()}원
                </span>
                {discountRate > 0 && (
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            backgroundColor: "#FCE7F3",
                            borderRadius: 8,
                            padding: "4px 8px",
                            width: "fit-content",
                            marginTop: 2,
                        }}
                    >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M5 8L0 0H10L5 8Z" fill="#EB408A" />
                        </svg>
                        <span
                            style={{
                                fontSize: "clamp(11px, 3vw, 13px)",
                                fontFamily: FONT,
                                fontWeight: 700,
                                color: "#EB408A",
                                letterSpacing: -0.24,
                                lineHeight: 1.5,
                            }}
                        >
                            {discountRate}%
                        </span>
                    </div>
                )}
            </div>

            <div
                style={{
                    flexShrink: 0,
                    padding: "9px clamp(10px, 3vw, 16px)",
                    borderRadius: 12,
                    backgroundColor: "#EFF6FF",
                    color: "#3B82F6",
                    fontSize: "clamp(12px, 3.2vw, 14px)",
                    fontFamily: FONT,
                    fontWeight: 600,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    letterSpacing: -0.24,
                    lineHeight: 1.4,
                }}
            >
                보러가기
            </div>

            {recommendBadge && (
                <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    style={{
                        position: "absolute",
                        top: 8,
                        right: 12,
                        backgroundColor: recommendBadge.bg,
                        color: recommendBadge.color,
                        fontSize: 10,
                        fontWeight: 700,
                        fontFamily: FONT,
                        letterSpacing: 0.2,
                        padding: "3px 8px",
                        borderRadius: 99,
                        whiteSpace: "nowrap",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                    }}
                >
                    {recommendBadge.label}
                </motion.div>
            )}
        </motion.div>
    )
}

// ─── 스켈레톤 ─────────────────────────────────────────────
function SkeletonCard() {
    return (
        <>
            <style>{`
                @keyframes kt-fm-shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
                .kt-fm-sk { background: linear-gradient(90deg, #F4F5F7 25%, #EAECEF 50%, #F4F5F7 75%); background-size: 800px 100%; animation: kt-fm-shimmer 1.4s infinite linear; border-radius: 8px; }
            `}</style>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "clamp(10px, 2.5vw, 16px)",
                    padding: "16px clamp(12px, 3vw, 20px)",
                    backgroundColor: "white",
                    borderBottom: "1px solid #F4F4F5",
                    width: "100%",
                    boxSizing: "border-box",
                }}
            >
                <div className="kt-fm-sk" style={{ width: "clamp(88px, 22vw, 110px)", height: "clamp(88px, 22vw, 110px)", minWidth: "clamp(88px, 22vw, 110px)", borderRadius: 14, flexShrink: 0 }} />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    <div className="kt-fm-sk" style={{ width: "55%", height: 14 }} />
                    <div className="kt-fm-sk" style={{ width: "70%", height: 24 }} />
                    <div className="kt-fm-sk" style={{ width: "20%", height: 26, borderRadius: 8 }} />
                </div>
                <div className="kt-fm-sk" style={{ flexShrink: 0, width: 72, height: 38, borderRadius: 12 }} />
            </div>
        </>
    )
}

// ─── 메인 컴포넌트 ────────────────────────────────────────
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 */
export default function FamilyMonthBuyNowSection(props) {
    const {
        titleLine1 = "지금 가장 좋은",
        titleHighlight = "특가 핸드폰",
        titleSuffix = "이에요",
        background = "#F6F3F1",
        listBackground = "#FFFFFF",
        style,
    } = props

    const [products, setProducts] = useState<any[]>([])
    const [subsidyMap, setSubsidyMap] = useState<Record<string, any>>({})
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: devices } = await supabase
                    .from("devices")
                    .select("*, device_plans_chg (model, model_price, plan_id, name, disclosure_subsidy)")
                    .eq("device_plans_chg.plan_id", "ppllistobj_0937")
                    .eq("is_available", true)

                if (!devices) return

                // pet_name에서 용량 제거
                const storageKeywords = ["128GB", "256GB", "512GB", "1TB"]
                devices.forEach((d) => {
                    if (typeof d.pet_name === "string") {
                        storageKeywords.forEach((kw) => {
                            d.pet_name = d.pet_name.replace(kw, "").trim()
                        })
                    }
                })

                // 대상 모델 + 최소 용량만
                const filtered = devices
                    .filter((d) => isTargetModel(d.model) && d.capacities?.[0] === d.capacity)
                    .sort((a, b) => getModelPriority(a.model) - getModelPriority(b.model))

                setProducts(filtered)

                // KT마켓 지원금
                const models = filtered.map((d) => d.model)
                const { data: subs } = await supabase
                    .from("ktmarket_subsidy")
                    .select("*")
                    .in("model", models)
                const map: Record<string, any> = {}
                subs?.forEach((s) => {
                    map[s.model] = s
                })
                setSubsidyMap(map)
            } catch (err) {
                console.error(err)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [])

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={staggerWrap}
            style={{
                width: "100%",
                maxWidth: 440,
                minWidth: 360,
                margin: "0 auto",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
                padding: "30px 16px",
                fontFamily: FONT,
                backgroundColor: background,
                ...style,
            }}
        >
            {/* 타이틀 */}
            <motion.div
                variants={fadeUp}
                style={{
                    textAlign: "center",
                    letterSpacing: "0.68px",
                }}
            >
                <p
                    style={{
                        margin: 0,
                        fontSize: 30,
                        lineHeight: 1.25,
                        color: "#161616",
                        fontFamily: FONT_TITLE_KO,
                        fontWeight: 400,
                    }}
                >
                    {titleLine1}
                </p>
                <p
                    style={{
                        margin: 0,
                        fontSize: 32,
                        lineHeight: 1.25,
                        fontFamily: FONT_TITLE_POP,
                        fontWeight: 400,
                    }}
                >
                    <span style={{ color: "#EB408A" }}>{titleHighlight}</span>
                    <span style={{ color: "#161616" }}>{titleSuffix}</span>
                </p>
            </motion.div>

            {/* 상품 리스트 카드 */}
            <motion.div
                variants={fadeUp}
                style={{
                    width: "100%",
                    backgroundColor: listBackground,
                    borderRadius: 21,
                    overflow: "hidden",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
            >
                <motion.div variants={staggerWrap}>
                    {isLoading
                        ? Array.from({ length: 7 }).map((_, i) => <SkeletonCard key={i} />)
                        : products.map((product) => (
                              <ProductCard
                                  key={product.model}
                                  product={product}
                                  subsidies={subsidyMap[product.model]}
                                  recommendBadge={getRecommendBadge(product.model)}
                              />
                          ))}
                </motion.div>
            </motion.div>
        </motion.div>
    )
}

addPropertyControls(FamilyMonthBuyNowSection, {
    titleLine1: {
        type: ControlType.String,
        title: "타이틀 1줄",
        defaultValue: "지금 가장 좋은",
    },
    titleHighlight: {
        type: ControlType.String,
        title: "타이틀 강조 (핑크)",
        defaultValue: "특가 핸드폰",
    },
    titleSuffix: {
        type: ControlType.String,
        title: "타이틀 접미",
        defaultValue: "이에요",
    },
    background: {
        type: ControlType.Color,
        title: "섹션 배경",
        defaultValue: "#F6F3F1",
    },
    listBackground: {
        type: ControlType.Color,
        title: "리스트 배경",
        defaultValue: "#FFFFFF",
    },
})
