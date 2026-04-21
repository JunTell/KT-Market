// 이전 사전예약 고객들의 생생한 후기
// Figma: node 1804:1194
// 타이틀 + 가로 스크롤 카드 5장 (자동 슬라이드)

import { addPropertyControls, ControlType } from "framer"
import React from "react"
import { motion } from "framer-motion"

const FONT = '"Pretendard", "Inter", sans-serif'

// ─── 모션 ─────────────────────────────────────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
}

// ─── 후기 카드 ────────────────────────────────────────────
function ReviewCard({
    nickname,
    label,
    content,
}: {
    nickname: string
    label: string
    content: string
}) {
    return (
        <div
            style={{
                width: 220,
                minWidth: 220,
                padding: "20px 18px",
                borderRadius: 18,
                backgroundColor: "#F4F7FB",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                flexShrink: 0,
            }}
        >
            {/* 닉네임 뱃지 */}
            <span
                style={{
                    display: "inline-flex",
                    padding: "4px 12px",
                    borderRadius: 99,
                    border: "1px solid #B8D8FF",
                    backgroundColor: "#FFF",
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#2A86FF",
                    fontFamily: FONT,
                    whiteSpace: "nowrap",
                }}
            >
                {nickname}
            </span>

            {/* 레이블 */}
            <span
                style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#111827",
                    fontFamily: FONT,
                    textAlign: "center",
                }}
            >
                {label}
            </span>

            {/* 후기 내용 */}
            <p
                style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 400,
                    color: "#4B5563",
                    fontFamily: FONT,
                    lineHeight: 1.6,
                    textAlign: "center",
                    wordBreak: "keep-all",
                }}
            >
                {content}
            </p>
        </div>
    )
}

// ─── 메인 컴포넌트 ────────────────────────────────────────
/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 */
export default function PreorderReviewCarousel(props) {
    const {
        titleLine1 = "이전 사전예약 고객들의",
        titleLine2 = "생생한 후기",

        review1Nick = "@jds****님 후기",
        review1Label = "사전예약 고객",
        review1Content = "정보 얻어서 울트라25 사전예약 후 받았어요!! 포장도 정성스럽게 해주셔서 선물 받는 기분이어서 주변에 자랑하고, 덕분에 주변에 분들도 같이 이곳에서 개통 잘하고 잘받았어요!!",

        review2Nick = "@살찐북극곰님 후기",
        review2Label = "사전예약 고객",
        review2Content = "저렴한 가격에 s25 플러스 아이스블루 사전예약으로 구매했습니다. 충전기 서비스도 잘 받았고 배송도 서울인데 엄청 빨라서 기기변경 개통가능 날 전에 받았습니다",

        review3Nick = "@추억4890님 후기",
        review3Label = "사전예약 고객",
        review3Content = "kt마켓에서 s25 플러스 아이스블루 사전예약으로 구매했습니다. 안내도 친절히 해주시고 사은품 케이스 및 필름도 잘 받았고요",

        review4Nick = "@문영68님 후기",
        review4Label = "사전예약 고객",
        review4Content = "S25 사전 예약 이용해서 구입 했더니, 빠른 배송과 편리한 데이터 이동 등... 시스템도 좋고, 기존 폰에서 새 폰으로 데이터 보내기도 쉽고, 만족스러운 구입이었습니다.",

        review5Nick = "@hellotom님 후기",
        review5Label = "사전예약 고객",
        review5Content = "kt마켓에서 휴대폰 처음 구입했습니다. s25 사전예약해서 엄청 일찍 수령 & 첫날 개통까지 진행했어요. 무엇보다 가격이 투명하게 공개되니 신뢰가고, kt사용자라 포인트 전환해서 싸게 구입했어요!",

        autoScrollSpeed = 30,
        style,
    } = props

    const reviews = [
        { nick: review1Nick, label: review1Label, content: review1Content },
        { nick: review2Nick, label: review2Label, content: review2Content },
        { nick: review3Nick, label: review3Label, content: review3Content },
        { nick: review4Nick, label: review4Label, content: review4Content },
        { nick: review5Nick, label: review5Label, content: review5Content },
    ]

    // 무한 루프를 위해 리뷰 2벌 복제
    const doubled = [...reviews, ...reviews]

    // 카드 너비(220) + gap(12) = 232px per card, 5장 = 1160px
    const trackWidth = reviews.length * (220 + 12)

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.12 } },
            }}
            style={{
                width: "100%",
                maxWidth: 440,
                minWidth: 360,
                margin: "0 auto",
                boxSizing: "border-box",
                padding: "32px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
                fontFamily: FONT,
                backgroundColor: "#FFFFFF",
                overflow: "hidden",
                ...style,
            }}
        >
            {/* 타이틀 */}
            <motion.div
                variants={fadeUp}
                style={{
                    textAlign: "center",
                    letterSpacing: "0.716px",
                }}
            >
                <div
                    style={{
                        fontSize: 28,
                        fontWeight: 700,
                        color: "#000",
                        lineHeight: 1.25,
                        fontFamily: FONT,
                    }}
                >
                    {titleLine1}
                </div>
                <span
                    style={{
                        fontSize: 32,
                        fontWeight: 800,
                        color: "#2A86FF",
                        lineHeight: 1.25,
                        fontFamily: FONT,
                        backgroundImage:
                            "linear-gradient(transparent 60%, #D5F85D 60%)",
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "100% 100%",
                    }}
                >
                    {titleLine2}
                </span>
            </motion.div>

            {/* 가로 무한 슬라이드 */}
            <motion.div
                variants={fadeUp}
                style={{
                    width: "100%",
                    overflow: "hidden",
                }}
            >
                <style>{`
                    @keyframes kt-review-slide {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-${trackWidth}px); }
                    }
                `}</style>
                <div
                    style={{
                        display: "flex",
                        gap: 12,
                        paddingLeft: 16,
                        width: "fit-content",
                        animation: `kt-review-slide ${trackWidth / 15}s linear infinite`,
                    }}
                >
                    {doubled.map((r, i) => (
                        <ReviewCard
                            key={i}
                            nickname={r.nick}
                            label={r.label}
                            content={r.content}
                        />
                    ))}
                </div>
            </motion.div>
        </motion.div>
    )
}

// ─── Property Controls ────────────────────────────────────
addPropertyControls(PreorderReviewCarousel, {
    titleLine1: {
        type: ControlType.String,
        title: "타이틀 1줄",
        defaultValue: "이전 사전예약 고객들의",
    },
    titleLine2: {
        type: ControlType.String,
        title: "타이틀 2줄 (강조)",
        defaultValue: "생생한 후기",
    },
    review1Nick: { type: ControlType.String, title: "후기1 닉네임", defaultValue: "@jds****님 후기" },
    review1Label: { type: ControlType.String, title: "후기1 레이블", defaultValue: "사전예약 고객" },
    review1Content: { type: ControlType.String, title: "후기1 내용", defaultValue: "정보 얻어서 울트라25 사전예약 후 받았어요!! 포장도 정성스럽게 해주셔서 선물 받는 기분이어서 주변에 자랑하고, 덕분에 주변에 분들도 같이 이곳에서 개통 잘하고 잘받았어요!!", displayTextArea: true },
    review2Nick: { type: ControlType.String, title: "후기2 닉네임", defaultValue: "@살찐북극곰님 후기" },
    review2Label: { type: ControlType.String, title: "후기2 레이블", defaultValue: "사전예약 고객" },
    review2Content: { type: ControlType.String, title: "후기2 내용", defaultValue: "저렴한 가격에 s25 플러스 아이스블루 사전예약으로 구매했습니다. 충전기 서비스도 잘 받았고 배송도 서울인데 엄청 빨라서 기기변경 개통가능 날 전에 받았습니다", displayTextArea: true },
    review3Nick: { type: ControlType.String, title: "후기3 닉네임", defaultValue: "@추억4890님 후기" },
    review3Label: { type: ControlType.String, title: "후기3 레이블", defaultValue: "사전예약 고객" },
    review3Content: { type: ControlType.String, title: "후기3 내용", defaultValue: "kt마켓에서 s25 플러스 아이스블루 사전예약으로 구매했습니다. 안내도 친절히 해주시고 사은품 케이스 및 필름도 잘 받았고요", displayTextArea: true },
    review4Nick: { type: ControlType.String, title: "후기4 닉네임", defaultValue: "@문영68님 후기" },
    review4Label: { type: ControlType.String, title: "후기4 레이블", defaultValue: "사전예약 고객" },
    review4Content: { type: ControlType.String, title: "후기4 내용", defaultValue: "S25 사전 예약 이용해서 구입 했더니, 빠른 배송과 편리한 데이터 이동 등... 시스템도 좋고, 기존 폰에서 새 폰으로 데이터 보내기도 쉽고, 만족스러운 구입이었습니다.", displayTextArea: true },
    review5Nick: { type: ControlType.String, title: "후기5 닉네임", defaultValue: "@hellotom님 후기" },
    review5Label: { type: ControlType.String, title: "후기5 레이블", defaultValue: "사전예약 고객" },
    review5Content: { type: ControlType.String, title: "후기5 내용", defaultValue: "kt마켓에서 휴대폰 처음 구입했습니다. s25 사전예약해서 엄청 일찍 수령 & 첫날 개통까지 진행했어요. 무엇보다 가격이 투명하게 공개되니 신뢰가고, kt사용자라 포인트 전환해서 싸게 구입했어요!", displayTextArea: true },
})
