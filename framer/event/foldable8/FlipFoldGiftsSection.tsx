// Flip · Fold 사전예약 — 프리미엄 사은품 3종 섹션

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

function GiftItem({ image, label }) {
    return (
        <div
            style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
            }}
        >
            <div
                style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    backgroundColor: "#FFFFFF",
                    borderRadius: 14,
                    border: "1px solid #EEF2F7",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {image ? (
                    <img
                        src={image}
                        alt={label}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                ) : (
                    <span style={{ color: "#94A3B8", fontSize: 10 }}>이미지</span>
                )}
            </div>
            <span
                style={{
                    fontSize: 12.5,
                    fontWeight: 500,
                    color: "#374151",
                    textAlign: "center",
                    lineHeight: 1.4,
                    letterSpacing: -0.2,
                    fontFamily: FONT,
                    whiteSpace: "pre-line",
                }}
            >
                {label}
            </span>
        </div>
    )
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 */
export default function FlipFoldGiftsSection(props) {
    const {
        topLabel = "끝나지 않는 혜택",
        title1 = "사전예약 고객 대상 증정!",
        title2 = "프리미엄 사은품 3종",
        badgeLabel = "프리미엄 사은품 3종 모두 증정",
        gift1Image,
        gift1Label = "프리미엄\n필름",
        gift2Image,
        gift2Label = "프리미엄\n케이스",
        gift3Image,
        gift3Label = "25W\n고속 충전기",
        footnote = "일부 품목이 품절될 경우,\n다른 품목으로 교체될 수 있어요",
        style,
    } = props

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
                padding: "40px 20px",
                boxSizing: "border-box",
                fontFamily: FONT,
                backgroundColor: "#F5F7FB",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                ...style,
            }}
        >
            <p
                style={{
                    margin: 0,
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#6B7280",
                    textAlign: "center",
                    letterSpacing: -0.3,
                    fontFamily: FONT,
                }}
            >
                {topLabel}
            </p>
            <h2
                style={{
                    margin: "6px 0 0",
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
                    margin: "20px auto 22px",
                    width: "fit-content",
                    padding: "8px 18px",
                    borderRadius: 999,
                    backgroundColor: "#0066FF",
                    color: "#FFFFFF",
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: -0.3,
                    fontFamily: FONT,
                    textAlign: "center",
                }}
            >
                {badgeLabel}
            </div>

            <div
                style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 10,
                }}
            >
                <GiftItem image={gift1Image} label={gift1Label} />
                <span
                    style={{
                        paddingTop: "30%",
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#9CA3AF",
                        fontFamily: FONT,
                    }}
                >
                    +
                </span>
                <GiftItem image={gift2Image} label={gift2Label} />
                <span
                    style={{
                        paddingTop: "30%",
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#9CA3AF",
                        fontFamily: FONT,
                    }}
                >
                    +
                </span>
                <GiftItem image={gift3Image} label={gift3Label} />
            </div>

            <p
                style={{
                    margin: "20px 0 0",
                    fontSize: 11.5,
                    color: "#9CA3AF",
                    textAlign: "center",
                    lineHeight: 1.5,
                    letterSpacing: -0.2,
                    whiteSpace: "pre-line",
                    fontFamily: FONT,
                }}
            >
                {footnote}
            </p>
        </motion.section>
    )
}

addPropertyControls(FlipFoldGiftsSection, {
    topLabel: {
        type: ControlType.String,
        title: "상단 문구",
        defaultValue: "끝나지 않는 혜택",
    },
    title1: {
        type: ControlType.String,
        title: "타이틀 1",
        defaultValue: "사전예약 고객 대상 증정!",
    },
    title2: {
        type: ControlType.String,
        title: "타이틀 2",
        defaultValue: "프리미엄 사은품 3종",
    },
    badgeLabel: {
        type: ControlType.String,
        title: "뱃지 문구",
        defaultValue: "프리미엄 사은품 3종 모두 증정",
    },
    gift1Image: { type: ControlType.Image, title: "① 사은품 이미지" },
    gift1Label: {
        type: ControlType.String,
        title: "① 사은품 라벨",
        defaultValue: "프리미엄\n필름",
        displayTextArea: true,
    },
    gift2Image: { type: ControlType.Image, title: "② 사은품 이미지" },
    gift2Label: {
        type: ControlType.String,
        title: "② 사은품 라벨",
        defaultValue: "프리미엄\n케이스",
        displayTextArea: true,
    },
    gift3Image: { type: ControlType.Image, title: "③ 사은품 이미지" },
    gift3Label: {
        type: ControlType.String,
        title: "③ 사은품 라벨",
        defaultValue: "25W\n고속 충전기",
        displayTextArea: true,
    },
    footnote: {
        type: ControlType.String,
        title: "하단 안내",
        defaultValue:
            "일부 품목이 품절될 경우,\n다른 품목으로 교체될 수 있어요",
        displayTextArea: true,
    },
})
