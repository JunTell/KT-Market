// 가정의 달 이벤트 - ReviewSection
// "믿고 맡길 수 있도록 생생한 후기까지"
// 별점 + 닉네임 + 후기 카드 (가로 무한 스크롤)

import { addPropertyControls, ControlType } from "framer"
import React, { useEffect } from "react"
import { motion } from "framer-motion"

const FONT = '"Pretendard", "Inter", sans-serif'
const FONT_TITLE_KO = '"Cafe24 Ohsquare OTF", "Pretendard", sans-serif'
const FONT_TITLE_POP = '"ONE Mobile POP", "Pretendard", sans-serif'

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
}

// ─── 별점 ─────────────────────────────────────────────────
function StarRating({ rating = 5 }: { rating?: number }) {
    return (
        <div style={{ display: "flex", gap: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
                <svg
                    key={i}
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill={i < rating ? "#FBBF24" : "#E5E7EB"}
                >
                    <path d="M7 0.5L8.85 4.95L13.5 5.4L9.85 8.55L11 13.5L7 10.85L3 13.5L4.15 8.55L0.5 5.4L5.15 4.95L7 0.5Z" />
                </svg>
            ))}
        </div>
    )
}

// ─── 후기 카드 ────────────────────────────────────────────
function ReviewCard({
    nickname,
    rating,
    content,
}: {
    nickname: string
    rating: number
    content: string
}) {
    return (
        <div
            style={{
                width: 240,
                minWidth: 240,
                padding: "20px 18px",
                borderRadius: 14,
                backgroundColor: "#FFFFFF",
                border: "1px solid #F1F5F9",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: 10,
                flexShrink: 0,
            }}
        >
            <span
                style={{
                    display: "inline-flex",
                    padding: "4px 10px",
                    borderRadius: 99,
                    border: "1px solid #FBCFE8",
                    backgroundColor: "#FFF",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#EB408A",
                    fontFamily: FONT,
                    whiteSpace: "nowrap",
                }}
            >
                {nickname}
            </span>
            <StarRating rating={rating} />
            <p
                style={{
                    margin: 0,
                    fontSize: 12.5,
                    fontWeight: 400,
                    color: "#4B5563",
                    fontFamily: FONT,
                    lineHeight: 1.6,
                    wordBreak: "keep-all",
                }}
            >
                {content}
            </p>
        </div>
    )
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 */
export default function FamilyMonthReviewSection(props) {
    const {
        titleLine1 = "믿고 맡길 수 있도록",
        titleLine2 = "생생한 후기까지",

        review1Nick = "@네츄럴라이프님 후기",
        review1Rating = 5,
        review1Content = "핸드폰 구입하려고 찾아보다 혜택이 괜찮아서 여기서 구입했어요 이상없이 잘 개통했습니다",

        review2Nick = "@sumin932님 후기",
        review2Rating = 5,
        review2Content = "여기서 사기 전 여러곳 다 뒤져봤는데 여기가 제일 싸서 샀네요 상담해주시는 분들도 다 친절해요!",

        review3Nick = "@별빛새벽님 후기",
        review3Rating = 5,
        review3Content = "어머니 핸드폰 바꿔드리려고 알아봤는데 가격이 정말 합리적이에요. 사은품도 푸짐하고 만족합니다.",

        review4Nick = "@happyJ님 후기",
        review4Rating = 5,
        review4Content = "스승의 날 선물로 부모님 핸드폰 구매했습니다. 친절한 상담과 빠른 배송 감사드려요!",

        background = "#F8F9FA",
        style,
    } = props

    const reviews = [
        { nick: review1Nick, rating: review1Rating, content: review1Content },
        { nick: review2Nick, rating: review2Rating, content: review2Content },
        { nick: review3Nick, rating: review3Rating, content: review3Content },
        { nick: review4Nick, rating: review4Rating, content: review4Content },
    ]

    const doubled = [...reviews, ...reviews]
    const trackWidth = reviews.length * (240 + 12)

    useEffect(() => {
        if (typeof document === "undefined") return
        const id = "kt-fm-review-fonts"
        if (document.getElementById(id)) return
        const tag = document.createElement("style")
        tag.id = id
        tag.textContent = `
            @font-face {
                font-family: 'ONE Mobile POP';
                src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2105_2@1.0/ONE-Mobile-POP.woff') format('woff');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
            }
            @font-face {
                font-family: 'Cafe24 Ohsquare OTF';
                src: url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_2001@1.1/Cafe24Ohsquare.woff') format('woff');
                font-weight: normal;
                font-style: normal;
                font-display: swap;
            }
        `
        document.head.appendChild(tag)
    }, [])

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
                padding: "44px 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
                fontFamily: FONT,
                backgroundColor: background,
                overflow: "hidden",
                ...style,
            }}
        >
            {/* 타이틀 */}
            <motion.div variants={fadeUp} style={{ textAlign: "center", padding: "0 16px", letterSpacing: "0.68px", marginTop: 20 }}>
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
                        color: "#EB408A",
                        fontFamily: FONT_TITLE_POP,
                        fontWeight: 400,
                    }}
                >
                    {titleLine2}
                </p>
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
                    @keyframes kt-fm-review-slide {
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
                        animation: `kt-fm-review-slide ${trackWidth / 18}s linear infinite`,
                    }}
                >
                    {doubled.map((r, i) => (
                        <ReviewCard
                            key={i}
                            nickname={r.nick}
                            rating={r.rating}
                            content={r.content}
                        />
                    ))}
                </div>
            </motion.div>
        </motion.div>
    )
}

addPropertyControls(FamilyMonthReviewSection, {
    titleLine1: {
        type: ControlType.String,
        title: "타이틀 1줄",
        defaultValue: "믿고 맡길 수 있도록",
    },
    titleLine2: {
        type: ControlType.String,
        title: "타이틀 2줄 (강조)",
        defaultValue: "생생한 후기까지",
    },
    review1Nick: { type: ControlType.String, title: "후기1 닉네임", defaultValue: "@네츄럴라이프님 후기" },
    review1Rating: { type: ControlType.Number, title: "후기1 별점", min: 1, max: 5, step: 1, defaultValue: 5 },
    review1Content: {
        type: ControlType.String,
        title: "후기1 내용",
        defaultValue: "핸드폰 구입하려고 찾아보다 혜택이 괜찮아서 여기서 구입했어요 이상없이 잘 개통했습니다",
        displayTextArea: true,
    },
    review2Nick: { type: ControlType.String, title: "후기2 닉네임", defaultValue: "@sumin932님 후기" },
    review2Rating: { type: ControlType.Number, title: "후기2 별점", min: 1, max: 5, step: 1, defaultValue: 5 },
    review2Content: {
        type: ControlType.String,
        title: "후기2 내용",
        defaultValue: "여기서 사기 전 여러곳 다 뒤져봤는데 여기가 제일 싸서 샀네요 상담해주시는 분들도 다 친절해요!",
        displayTextArea: true,
    },
    review3Nick: { type: ControlType.String, title: "후기3 닉네임", defaultValue: "@별빛새벽님 후기" },
    review3Rating: { type: ControlType.Number, title: "후기3 별점", min: 1, max: 5, step: 1, defaultValue: 5 },
    review3Content: {
        type: ControlType.String,
        title: "후기3 내용",
        defaultValue: "어머니 핸드폰 바꿔드리려고 알아봤는데 가격이 정말 합리적이에요. 사은품도 푸짐하고 만족합니다.",
        displayTextArea: true,
    },
    review4Nick: { type: ControlType.String, title: "후기4 닉네임", defaultValue: "@happyJ님 후기" },
    review4Rating: { type: ControlType.Number, title: "후기4 별점", min: 1, max: 5, step: 1, defaultValue: 5 },
    review4Content: {
        type: ControlType.String,
        title: "후기4 내용",
        defaultValue: "스승의 날 선물로 부모님 핸드폰 구매했습니다. 친절한 상담과 빠른 배송 감사드려요!",
        displayTextArea: true,
    },
    background: {
        type: ControlType.Color,
        title: "배경색",
        defaultValue: "#F8F9FA",
    },
})
