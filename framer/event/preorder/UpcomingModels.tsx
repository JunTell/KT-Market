// framer/event/UpcomingModels.tsx
// Figma: KT마켓 준텔레콤 node-id 1813:1263
// "출시 예정인 모델들이에요" 섹션
//
// 디바이스 카드 4개 + 하단 CTA 버튼

import * as React from "react"
import { useCallback } from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion } from "framer-motion"

// ─── 폰트 ───────────────────────────────────────────────────────────
const FONT = '"Pretendard", "Inter", sans-serif'

// ─── 아이콘 ─────────────────────────────────────────────────────────
const CaretRight = ({
    size = 15,
    color = "#FFF",
}: {
    size?: number
    color?: string
}) => (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
        <path
            d="M7.5 5L12.5 10L7.5 15"
            stroke={color}
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

// ─── 배지 색상 ──────────────────────────────────────────────────────
const BADGE_COLORS: Record<string, { bg: string; dot: string }> = {
    green: { bg: "#E8F1EF", dot: "#34C759" },
    blue: { bg: "#E8F1FA", dot: "#2A86FF" },
    white: { bg: "#FFFFFF", dot: "#2A86FF" },
    purple: { bg: "#E6E7F5", dot: "#7B61FF" },
}

// ─── 디바이스 카드 ──────────────────────────────────────────────────
interface DeviceCardProps {
    badge: string
    badgeColor: string
    name: string
    date: string
    image?: string
    featured?: boolean
    imageWidth?: number
    imageHeight?: number
    imageRight?: number
    imageBottom?: number
}

function DeviceCard({
    badge,
    badgeColor,
    name,
    date,
    image,
    featured = false,
    imageWidth = 60,
    imageHeight = 52,
    imageRight = -6,
    imageBottom = 0,
}: DeviceCardProps) {
    const colors = BADGE_COLORS[badgeColor] || BADGE_COLORS.green

    return (
        <div
            style={{
                display: "flex",
                gap: 10,
                alignItems: "center",
                padding: featured ? "15px 16px" : "13px 15px",
                paddingRight: featured ? 80 : 70,
                borderRadius: featured ? 17 : 15,
                background: featured ? "#2A86FF" : "#FFF",
                boxShadow: "0 0 6px 0 rgba(0,0,0,0.13)",
                boxSizing: "border-box",
                width: "100%",
                maxWidth: featured ? 312 : 282,
                minHeight: featured ? 89 : undefined,
                alignSelf: "center",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* 배지 */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                    padding: "6px 7px",
                    borderRadius: 62,
                    background: colors.bg,
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                }}
            >
                <div
                    style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: colors.dot,
                        flexShrink: 0,
                    }}
                />
                <span
                    style={{
                        fontFamily: FONT,
                        fontSize: 11,
                        fontWeight: featured ? 500 : 400,
                        color: "#000",
                        lineHeight: "normal",
                    }}
                >
                    {badge}
                </span>
            </div>

            {/* 디바이스 정보 */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.709,
                }}
            >
                <div
                    style={{
                        fontFamily: FONT,
                        fontSize: featured ? 20 : 14,
                        fontWeight: featured ? 800 : 600,
                        color: featured ? "#FFF" : "#000",
                        lineHeight: "normal",
                        whiteSpace: "pre-line",
                    }}
                >
                    {name}
                </div>
                <span
                    style={{
                        fontFamily: FONT,
                        fontSize: featured ? 12 : 11.5,
                        fontWeight: 500,
                        color: featured ? "#FFF" : "#888",
                        lineHeight: "normal",
                    }}
                >
                    {date}
                </span>
            </div>

            {/* 디바이스 이미지 — 카드 우측, 일부 잘림 허용 */}
            {image && (
                <img
                    src={image}
                    alt=""
                    style={{
                        position: "absolute",
                        right: imageRight,
                        bottom: imageBottom,
                        width: imageWidth,
                        height: imageHeight,
                        objectFit: "contain",
                        pointerEvents: "none",
                    }}
                />
            )}
        </div>
    )
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 */
export default function UpcomingModels(props) {
    const {
        // 타이틀
        titleBlue = "출시 예정",
        titleBlack = "인\n모델들이에요",

        // 카드 1
        card1Badge = "4월~5월 예상",
        card1BadgeColor = "green",
        card1Name = "Galaxy A37",
        card1Date = "2026.04 - 2026.05",
        card1Image,

        // 카드 2
        card2Badge = "7월 예상",
        card2BadgeColor = "blue",
        card2Name = "Galaxy Z Fold 8\nGalaxy Z Flip 8",
        card2Date = "2026.07",
        card2Image,

        // 카드 3 (Featured)
        card3Badge = "9월~10월 예상",
        card3BadgeColor = "white",
        card3Name = "iPhone 18",
        card3Date = "2026.09 - 2026.10",
        card3Image,

        // 카드 4
        card4Badge = "2월~3월 예상",
        card4BadgeColor = "purple",
        card4Name = "Galaxy S27",
        card4Date = "2027.02 - 2027.03",
        card4Image,

        // CTA 버튼
        ctaText = "사전예약 알림 신청",
        ctaLink = "/forms/preorder-alram",
        ctaOnClick,

        style,
    } = props

    const handleCta = useCallback(() => {
        if (typeof ctaOnClick === "function") return ctaOnClick()
        if (ctaLink && typeof window !== "undefined")
            window.location.href = ctaLink
    }, [ctaOnClick, ctaLink])

    return (
        <div
            id="upcoming-models"
            style={{
                width: "100%",
                maxWidth: 440,
                minWidth: 360,
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 24,
                padding: "30px 0",
                background:
                    "linear-gradient(180deg, #F2F2F2 0%, #D9EBFF 75.61%, #C5DEF6 100%)",
                fontFamily: FONT,
                boxSizing: "border-box",
                ...style,
            }}
        >
            {/* ══ 타이틀 ══ */}
            <div
                style={{
                    fontFamily: FONT,
                    fontSize: 35,
                    fontWeight: 700,
                    lineHeight: 1.25,
                    letterSpacing: "0.7px",
                    color: "#000",
                    textAlign: "center",
                    whiteSpace: "pre-line",
                }}
            >
                <span
                    style={{
                        fontWeight: 800,
                        color: "#2A86FF",
                        backgroundImage: "linear-gradient(transparent 60%, #D5F85D 60%)",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "100% 100%",
                    }}
                >
                    {titleBlue}
                </span>
                {titleBlack}
            </div>

            {/* ══ 카드 리스트 + CTA ══ */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 27,
                }}
            >
                {/* 카드 그리드 */}
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 12,
                        width: 309,
                    }}
                >
                    <DeviceCard
                        badge={card1Badge}
                        badgeColor={card1BadgeColor}
                        name={card1Name}
                        date={card1Date}
                        image={card1Image}
                        imageWidth={60}
                        imageHeight={52}
                        imageRight={-6}

                    />
                    <DeviceCard
                        badge={card2Badge}
                        badgeColor={card2BadgeColor}
                        name={card2Name}
                        date={card2Date}
                        image={card2Image}
                        imageWidth={61}
                        imageHeight={64}
                        imageRight={-6}
                        imageBottom={-10}
                    />
                    <motion.div
                        animate={{
                            scale: [1, 1.03, 1],
                            boxShadow: [
                                "0 0 0px rgba(42,134,255,0)",
                                "0 0 18px rgba(42,134,255,0.5)",
                                "0 0 0px rgba(42,134,255,0)",
                            ],
                            y: [0, -3, 0],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1,
                            ease: "easeInOut",
                        }}
                        style={{
                            borderRadius: 17,
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                        }}
                    >
                        <DeviceCard
                            badge={card3Badge}
                            badgeColor={card3BadgeColor}
                            name={card3Name}
                            date={card3Date}
                            image={card3Image}
                            featured
                            imageWidth={72}
                            imageHeight={80}
                            imageRight={-6}
    
                        />
                    </motion.div>
                    <DeviceCard
                        badge={card4Badge}
                        badgeColor={card4BadgeColor}
                        name={card4Name}
                        date={card4Date}
                        image={card4Image}
                        imageWidth={53}
                        imageHeight={53}
                        imageRight={-4}

                    />
                </div>

                {/* CTA 버튼 */}
                <button
                    onClick={handleCta}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6.567,
                        padding: "7.388px 15.596px",
                        borderRadius: 8.208,
                        background: "#0066FF",
                        boxShadow:
                            "0 3.283px 4.104px 0 rgba(0,0,0,0.15)",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: FONT,
                        fontSize: 17.336,
                        fontWeight: 700,
                        lineHeight: "117%",
                        letterSpacing: "0.347px",
                        color: "#FFF",
                        whiteSpace: "nowrap",
                    }}
                >
                    {ctaText}
                    <CaretRight size={15} color="#FFF" />
                </button>
            </div>
        </div>
    )
}

// ─── Framer 프롭 컨트롤 ───────────────────────────────────────────────
addPropertyControls(UpcomingModels, {
    // 타이틀
    titleBlue: {
        type: ControlType.String,
        title: "타이틀 (파란색)",
        defaultValue: "출시 예정",
    },
    titleBlack: {
        type: ControlType.String,
        title: "타이틀 (검정)",
        displayTextArea: true,
        defaultValue: "인\n모델들이에요",
    },

    // 카드 1
    card1Badge: {
        type: ControlType.String,
        title: "카드1 배지",
        defaultValue: "4월~5월 예상",
    },
    card1BadgeColor: {
        type: ControlType.Enum,
        title: "카드1 배지색",
        options: ["green", "blue", "white", "purple"],
        optionTitles: ["초록", "파랑", "흰색", "보라"],
        defaultValue: "green",
    },
    card1Name: {
        type: ControlType.String,
        title: "카드1 모델명",
        defaultValue: "Galaxy A37",
    },
    card1Date: {
        type: ControlType.String,
        title: "카드1 출시일",
        defaultValue: "2026.04 - 2026.05",
    },
    card1Image: {
        type: ControlType.Image,
        title: "카드1 이미지",
    },

    // 카드 2
    card2Badge: {
        type: ControlType.String,
        title: "카드2 배지",
        defaultValue: "7월 예상",
    },
    card2BadgeColor: {
        type: ControlType.Enum,
        title: "카드2 배지색",
        options: ["green", "blue", "white", "purple"],
        optionTitles: ["초록", "파랑", "흰색", "보라"],
        defaultValue: "blue",
    },
    card2Name: {
        type: ControlType.String,
        title: "카드2 모델명",
        displayTextArea: true,
        defaultValue: "Galaxy Z Fold 8\nGalaxy Z Flip 8",
    },
    card2Date: {
        type: ControlType.String,
        title: "카드2 출시일",
        defaultValue: "2026.07",
    },
    card2Image: {
        type: ControlType.Image,
        title: "카드2 이미지",
    },

    // 카드 3 (Featured)
    card3Badge: {
        type: ControlType.String,
        title: "카드3 배지",
        defaultValue: "9월~10월 예상",
    },
    card3BadgeColor: {
        type: ControlType.Enum,
        title: "카드3 배지색",
        options: ["green", "blue", "white", "purple"],
        optionTitles: ["초록", "파랑", "흰색", "보라"],
        defaultValue: "white",
    },
    card3Name: {
        type: ControlType.String,
        title: "카드3 모델명",
        defaultValue: "iPhone 18",
    },
    card3Date: {
        type: ControlType.String,
        title: "카드3 출시일",
        defaultValue: "2026.09 - 2026.10",
    },
    card3Image: {
        type: ControlType.Image,
        title: "카드3 이미지",
    },

    // 카드 4
    card4Badge: {
        type: ControlType.String,
        title: "카드4 배지",
        defaultValue: "2월~3월 예상",
    },
    card4BadgeColor: {
        type: ControlType.Enum,
        title: "카드4 배지색",
        options: ["green", "blue", "white", "purple"],
        optionTitles: ["초록", "파랑", "흰색", "보라"],
        defaultValue: "purple",
    },
    card4Name: {
        type: ControlType.String,
        title: "카드4 모델명",
        defaultValue: "Galaxy S27",
    },
    card4Date: {
        type: ControlType.String,
        title: "카드4 출시일",
        defaultValue: "2027.02 - 2027.03",
    },
    card4Image: {
        type: ControlType.Image,
        title: "카드4 이미지",
    },

    // CTA 버튼
    ctaText: {
        type: ControlType.String,
        title: "CTA 텍스트",
        defaultValue: "사전예약 알림 신청",
    },
    ctaLink: {
        type: ControlType.String,
        title: "CTA 링크",
        defaultValue: "/forms/preorder-alram",
    },
})
