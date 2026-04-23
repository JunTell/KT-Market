// Flip · Fold 사전예약 — 놓치기 쉬운 혜택 4카드
// 복지 / 결합 / 군인 / 폰 안심케어

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

function BenefitCard({ image, title, desc }) {
    return (
        <div
            style={{
                flex: "1 1 calc(50% - 6px)",
                minWidth: 0,
                backgroundColor: "#F8FAFC",
                borderRadius: 16,
                padding: "18px 16px 14px",
                border: "1px solid #EEF2F7",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                boxSizing: "border-box",
                minHeight: 170,
                position: "relative",
            }}
        >
            <span
                style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#0066FF",
                    letterSpacing: -0.3,
                    fontFamily: FONT,
                }}
            >
                {title}
            </span>
            <span
                style={{
                    fontSize: 12,
                    fontWeight: 500,
                    color: "#374151",
                    lineHeight: 1.5,
                    letterSpacing: -0.2,
                    fontFamily: FONT,
                    whiteSpace: "pre-line",
                }}
            >
                {desc}
            </span>
            <div
                style={{
                    marginTop: "auto",
                    alignSelf: "flex-end",
                    width: 64,
                    height: 64,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {image ? (
                    <img
                        src={image}
                        alt={title}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                        }}
                    />
                ) : (
                    <span style={{ color: "#94A3B8", fontSize: 10 }}>이미지</span>
                )}
            </div>
        </div>
    )
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 */
export default function FlipFoldExtraBenefitsSection(props) {
    const {
        title = "놓치기 쉬운 혜택까지",
        titleHighlight = "모두 챙겨드려요",
        b1Image,
        b1Title = "복지 할인",
        b1Desc = "사회적 배려 대상 고객에게\n할인 혜택을 드려요",
        b2Image,
        b2Title = "결합 할인",
        b2Desc = "가족끼리 뭉칠수록\n할인에 할인을 더해요",
        b3Image,
        b3Title = "군인 할인",
        b3Desc = "군인 할인 20%에\n요금 할인까지 드려요",
        b4Image,
        b4Title = "폰 안심케어",
        b4Desc = "분실·파손 등의 사고 시\n비용 및 수리비를 드려요",
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
                backgroundColor: "#FFFFFF",
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
                {title}
                <br />
                {titleHighlight}
            </h2>

            <div
                style={{
                    marginTop: 24,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 12,
                }}
            >
                <BenefitCard image={b1Image} title={b1Title} desc={b1Desc} />
                <BenefitCard image={b2Image} title={b2Title} desc={b2Desc} />
                <BenefitCard image={b3Image} title={b3Title} desc={b3Desc} />
                <BenefitCard image={b4Image} title={b4Title} desc={b4Desc} />
            </div>
        </motion.section>
    )
}

addPropertyControls(FlipFoldExtraBenefitsSection, {
    title: {
        type: ControlType.String,
        title: "타이틀 1",
        defaultValue: "놓치기 쉬운 혜택까지",
    },
    titleHighlight: {
        type: ControlType.String,
        title: "타이틀 2",
        defaultValue: "모두 챙겨드려요",
    },
    b1Image: { type: ControlType.Image, title: "① 이미지" },
    b1Title: { type: ControlType.String, title: "① 타이틀", defaultValue: "복지 할인" },
    b1Desc: {
        type: ControlType.String,
        title: "① 설명",
        defaultValue: "사회적 배려 대상 고객에게\n할인 혜택을 드려요",
        displayTextArea: true,
    },
    b2Image: { type: ControlType.Image, title: "② 이미지" },
    b2Title: { type: ControlType.String, title: "② 타이틀", defaultValue: "결합 할인" },
    b2Desc: {
        type: ControlType.String,
        title: "② 설명",
        defaultValue: "가족끼리 뭉칠수록\n할인에 할인을 더해요",
        displayTextArea: true,
    },
    b3Image: { type: ControlType.Image, title: "③ 이미지" },
    b3Title: { type: ControlType.String, title: "③ 타이틀", defaultValue: "군인 할인" },
    b3Desc: {
        type: ControlType.String,
        title: "③ 설명",
        defaultValue: "군인 할인 20%에\n요금 할인까지 드려요",
        displayTextArea: true,
    },
    b4Image: { type: ControlType.Image, title: "④ 이미지" },
    b4Title: {
        type: ControlType.String,
        title: "④ 타이틀",
        defaultValue: "폰 안심케어",
    },
    b4Desc: {
        type: ControlType.String,
        title: "④ 설명",
        defaultValue: "분실·파손 등의 사고 시\n비용 및 수리비를 드려요",
        displayTextArea: true,
    },
})
