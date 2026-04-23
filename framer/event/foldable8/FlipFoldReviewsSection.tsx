// Flip · Fold 사전예약 — 후기 + 하단 CTA

import { addPropertyControls, ControlType } from "framer"
import React from "react"
import { motion } from "framer-motion"

const FONT = '"Cafe24 Ohsquare", "Cafe24 Ohsquare OTF", sans-serif'

const fade = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
}

function ReviewCard({ handle, tag, content }) {
    return (
        <div
            style={{
                flex: 1,
                minWidth: 0,
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                border: "1px solid #EEF2F7",
                padding: "16px 14px",
                display: "flex",
                flexDirection: "column",
                gap: 8,
                boxSizing: "border-box",
            }}
        >
            <span
                style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#0066FF",
                    fontFamily: FONT,
                    letterSpacing: -0.2,
                }}
            >
                {handle}
            </span>
            <span
                style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#111827",
                    fontFamily: FONT,
                    letterSpacing: -0.3,
                }}
            >
                {tag}
            </span>
            <span
                style={{
                    fontSize: 11.5,
                    fontWeight: 400,
                    color: "#6B7280",
                    lineHeight: 1.5,
                    letterSpacing: -0.2,
                    fontFamily: FONT,
                    whiteSpace: "pre-line",
                }}
            >
                {content}
            </span>
        </div>
    )
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 */
export default function FlipFoldReviewsSection(props) {
    const {
        title1 = "믿고 맡길 수 있는",
        title2 = "생생한 후기",
        r1Handle = "@jjoo****실 후기",
        r1Tag = "사전예약 고객",
        r1Content = "사전 예약이 올트라의 S25 프리미엄 사은품으로 받았는데요 포장도 정성스럽게 해주셔서 선물 받는 기분이더라구요. 몇번에 자랑하고, 덕분에 주변에 분들도 같이 이곳에서 개통 받아보겠다 말씀하셨어요.",
        r2Handle = "@삼전폭공님 후기",
        r2Tag = "사전예약 고객",
        r2Content = "저렴한 가격에 S25 플러스 아이폰17 서 사전예약으로 구매했습니다. 충전기 서비스가 꽉 찬 작은 걸 서울인데 인천 빨리 가다 늘 더 늦게 오긴 걸이 되어서요.",
        ctaLabel = "사전예약 알림 신청",
        ctaLink = "#flip-fold-apply",
        style,
    } = props

    const onCta = () => {
        if (typeof window === "undefined" || !ctaLink) return
        if (ctaLink.startsWith("#")) {
            const el = document.querySelector(ctaLink)
            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
        } else {
            window.open(ctaLink, "_blank", "noopener,noreferrer")
        }
    }

    return (
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20px" }}
            variants={fade}
            style={{
                width: "100%",
                maxWidth: 440,
                minWidth: 360,
                margin: "0 auto",
                padding: "40px 20px 48px",
                boxSizing: "border-box",
                fontFamily: FONT,
                backgroundColor: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                ...style,
            }}
        >
            <h2
                style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 700,
                    color: "#111827",
                    letterSpacing: -0.6,
                    textAlign: "center",
                    lineHeight: 1.35,
                    fontFamily: FONT,
                }}
            >
                {title1}
                <br />
                {title2}
            </h2>

            <div
                style={{
                    marginTop: 24,
                    display: "flex",
                    gap: 10,
                }}
            >
                <ReviewCard handle={r1Handle} tag={r1Tag} content={r1Content} />
                <ReviewCard handle={r2Handle} tag={r2Tag} content={r2Content} />
            </div>

            <button
                type="button"
                onClick={onCta}
                style={{
                    marginTop: 28,
                    width: "100%",
                    height: 56,
                    borderRadius: 14,
                    border: "none",
                    backgroundColor: "#0066FF",
                    color: "#FFFFFF",
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: -0.3,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    fontFamily: FONT,
                    boxShadow: "0 4px 16px rgba(0, 102, 255, 0.25)",
                }}
            >
                {ctaLabel}
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M9 6l6 6-6 6" />
                </svg>
            </button>
        </motion.section>
    )
}

addPropertyControls(FlipFoldReviewsSection, {
    title1: {
        type: ControlType.String,
        title: "타이틀 1",
        defaultValue: "믿고 맡길 수 있는",
    },
    title2: {
        type: ControlType.String,
        title: "타이틀 2",
        defaultValue: "생생한 후기",
    },
    r1Handle: {
        type: ControlType.String,
        title: "① 핸들",
        defaultValue: "@jjoo****실 후기",
    },
    r1Tag: {
        type: ControlType.String,
        title: "① 태그",
        defaultValue: "사전예약 고객",
    },
    r1Content: {
        type: ControlType.String,
        title: "① 내용",
        defaultValue:
            "사전 예약이 올트라의 S25 프리미엄 사은품으로 받았는데요 포장도 정성스럽게 해주셔서 선물 받는 기분이더라구요. 몇번에 자랑하고, 덕분에 주변에 분들도 같이 이곳에서 개통 받아보겠다 말씀하셨어요.",
        displayTextArea: true,
    },
    r2Handle: {
        type: ControlType.String,
        title: "② 핸들",
        defaultValue: "@삼전폭공님 후기",
    },
    r2Tag: {
        type: ControlType.String,
        title: "② 태그",
        defaultValue: "사전예약 고객",
    },
    r2Content: {
        type: ControlType.String,
        title: "② 내용",
        defaultValue:
            "저렴한 가격에 S25 플러스 아이폰17 서 사전예약으로 구매했습니다. 충전기 서비스가 꽉 찬 작은 걸 서울인데 인천 빨리 가다 늘 더 늦게 오긴 걸이 되어서요.",
        displayTextArea: true,
    },
    ctaLabel: {
        type: ControlType.String,
        title: "버튼 텍스트",
        defaultValue: "사전예약 알림 신청",
    },
    ctaLink: {
        type: ControlType.String,
        title: "버튼 링크",
        defaultValue: "#flip-fold-apply",
    },
})
