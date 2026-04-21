// 실제 구매 후기 카드
// Figma: node 2093:820
// 별점 헤더 + 리뷰 목록 (최대 5개)

import { addPropertyControls, ControlType } from "framer"
import React from "react"

const FONT = '"Pretendard Variable", "Pretendard", sans-serif'

// ── 별점 아이콘 ──────────────────────────────────────────────
function StarIcon({ filled = true }: { filled?: boolean }) {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
                d="M7 1l1.545 3.13L12 4.635l-2.5 2.435.59 3.44L7 8.885l-3.09 1.625.59-3.44L2 4.635l3.455-.505L7 1z"
                fill={filled ? "#FBBF24" : "#E5E7EB"}
            />
        </svg>
    )
}

function Stars({ rating }: { rating: number }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {[1, 2, 3, 4, 5].map(n => (
                <StarIcon key={n} filled={n <= Math.round(rating)} />
            ))}
        </div>
    )
}

// ── 리뷰 아이템 ──────────────────────────────────────────────
function ReviewItem({
    product,
    reviewer,
    content,
    showDivider,
}: {
    product: string
    reviewer: string
    content: string
    showDivider: boolean
}) {
    return (
        <>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#868E96",
                    letterSpacing: -0.24,
                    lineHeight: 1.4,
                    fontFamily: FONT,
                }}>
                    {product}{reviewer ? ` · ${reviewer}` : ""}
                </span>
                <p style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 400,
                    color: "#24292E",
                    letterSpacing: -0.24,
                    lineHeight: 1.6,
                    wordBreak: "keep-all",
                    fontFamily: FONT,
                }}>
                    {content}
                </p>
            </div>
            {showDivider && (
                <div style={{
                    height: 1,
                    backgroundColor: "#F1F3F5",
                    width: "100%",
                }} />
            )}
        </>
    )
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 * @framerIntrinsicHeight 220
 */
export default function ReviewCard(props) {
    const {
        title = "실제 구매 후기",
        rating = 4.9,
        showArrow = true,
        onArrowClick,

        review1Product = "갤럭시 S26 울트라",
        review1Reviewer = "김*은",
        review1Content = "공식 사이트랑 비교해봤는데 여기가 훨씬 싸더라구요. 조건도 없고 담당자분이 다 챙겨줘서 너무 편했어요",

        review2Product = "아이폰17",
        review2Reviewer = "박*준",
        review2Content = "온라인 구매 처음인데 신청하니까 담당자분이 처음부터 끝까지 다 알아서 해주셨어요.",
        showReview2 = true,

        review3Product = "",
        review3Reviewer = "",
        review3Content = "",
        showReview3 = false,
    } = props

    const reviews = [
        { product: review1Product, reviewer: review1Reviewer, content: review1Content, show: true },
        { product: review2Product, reviewer: review2Reviewer, content: review2Content, show: showReview2 },
        { product: review3Product, reviewer: review3Reviewer, content: review3Content, show: showReview3 && !!review3Content },
    ].filter(r => r.show)

    const handleArrow = () => {
        if (typeof onArrowClick === "function") onArrowClick()
        if (typeof window !== "undefined") {
            const target = document.getElementById("review")
            if (target) {
                const y = target.getBoundingClientRect().top + window.scrollY - 300
                window.scrollTo({ top: y, behavior: "smooth" })
            }
        }
    }

    return (
        <div style={{
            width: "100%",
            backgroundColor: "#F8F9FB",
            borderRadius: 14,
            padding: "16px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            fontFamily: FONT,
        }}>
            {/* 헤더: 타이틀 + 별점 + 화살표 */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
            }}>
                <span style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#24292E",
                    letterSpacing: -0.3,
                    lineHeight: 1.4,
                    fontFamily: FONT,
                }}>
                    {title}
                </span>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: showArrow ? "pointer" : "default",
                    }}
                    onClick={showArrow ? handleArrow : undefined}
                >
                    <Stars rating={rating} />
                    <span style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#24292E",
                        letterSpacing: -0.24,
                        lineHeight: 1.4,
                        fontFamily: FONT,
                    }}>
                        {rating.toFixed(1)}
                    </span>
                    {showArrow && (
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6 4l4 4-4 4" stroke="#868E96" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
            </div>

            {/* 리뷰 목록 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {reviews.map((r, i) => (
                    <ReviewItem
                        key={i}
                        product={r.product}
                        reviewer={r.reviewer}
                        content={r.content}
                        showDivider={i < reviews.length - 1}
                    />
                ))}
            </div>
        </div>
    )
}

addPropertyControls(ReviewCard, {
    title: {
        type: ControlType.String,
        title: "타이틀",
        defaultValue: "실제 구매 후기",
    },
    rating: {
        type: ControlType.Number,
        title: "별점",
        defaultValue: 4.9,
        min: 0,
        max: 5,
        step: 0.1,
    },
    showArrow: {
        type: ControlType.Boolean,
        title: "화살표 표시",
        defaultValue: true,
    },
    review1Product: {
        type: ControlType.String,
        title: "리뷰1 기기명",
        defaultValue: "갤럭시 S26 울트라",
    },
    review1Reviewer: {
        type: ControlType.String,
        title: "리뷰1 작성자",
        defaultValue: "김*은",
    },
    review1Content: {
        type: ControlType.String,
        title: "리뷰1 내용",
        defaultValue: "공식 사이트랑 비교해봤는데 여기가 훨씬 싸더라구요. 조건도 없고 담당자분이 다 챙겨줘서 너무 편했어요",
        displayTextArea: true,
    },
    showReview2: {
        type: ControlType.Boolean,
        title: "리뷰2 표시",
        defaultValue: true,
    },
    review2Product: {
        type: ControlType.String,
        title: "리뷰2 기기명",
        defaultValue: "아이폰17",
        hidden: (props) => !props.showReview2,
    },
    review2Reviewer: {
        type: ControlType.String,
        title: "리뷰2 작성자",
        defaultValue: "박*준",
        hidden: (props) => !props.showReview2,
    },
    review2Content: {
        type: ControlType.String,
        title: "리뷰2 내용",
        defaultValue: "온라인 구매 처음인데 신청하니까 담당자분이 처음부터 끝까지 다 알아서 해주셨어요.",
        displayTextArea: true,
        hidden: (props) => !props.showReview2,
    },
    showReview3: {
        type: ControlType.Boolean,
        title: "리뷰3 표시",
        defaultValue: false,
    },
    review3Product: {
        type: ControlType.String,
        title: "리뷰3 기기명",
        defaultValue: "",
        hidden: (props) => !props.showReview3,
    },
    review3Reviewer: {
        type: ControlType.String,
        title: "리뷰3 작성자",
        defaultValue: "",
        hidden: (props) => !props.showReview3,
    },
    review3Content: {
        type: ControlType.String,
        title: "리뷰3 내용",
        defaultValue: "",
        displayTextArea: true,
        hidden: (props) => !props.showReview3,
    },
})
