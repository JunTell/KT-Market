// Flip · Fold 사전예약 — 알림 필수 섹션
// 타이틀/서브 (텍스트) + 3단계 아이콘 이미지 + CTA 버튼

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

function StepItem({ number, label, image }) {
    return (
        <div
            style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
            }}
        >
            <div
                style={{
                    width: 96,
                    height: 96,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {image ? (
                    <img
                        src={image}
                        alt={label}
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "contain",
                            display: "block",
                        }}
                    />
                ) : (
                    <span style={{ color: "#94A3B8", fontSize: 10 }}>아이콘</span>
                )}
            </div>
            <span
                style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#0066FF",
                    letterSpacing: 0.4,
                    fontFamily: FONT,
                }}
            >
                {number}
            </span>
            <span
                style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#111827",
                    textAlign: "center",
                    letterSpacing: -0.3,
                    fontFamily: FONT,
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
export default function FlipFoldNoticeSection(props) {
    const {
        title = "갤럭시 Z 폴드8 | 플립8",
        highlight = "“사전예약 알림 필수”",
        subtitle = "사전예약 알림을 신청해두면,\nKT마켓이 공식 예약 시간에 알려드려요",
        step1Label = "빠른 정보 확인",
        step2Label = "최대 혜택&할인",
        step3Label = "인기 물량 선점",
        step1Image,
        step2Image,
        step3Image,
        ctaLabel = "사전예약 알림 신청",
        ctaLink = "#flip-fold-apply",
        style,
    } = props

    const onCta = () => {
        if (typeof window !== "undefined" && ctaLink) {
            if (ctaLink.startsWith("#")) {
                const el = document.querySelector(ctaLink)
                if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
            } else {
                window.open(ctaLink, "_blank", "noopener,noreferrer")
            }
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
                padding: "48px 20px 40px",
                boxSizing: "border-box",
                fontFamily: FONT,
                backgroundColor: "#FFFFFF",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                ...style,
            }}
        >
            <h2
                style={{
                    margin: 0,
                    fontSize: 17,
                    fontWeight: 500,
                    color: "#111827",
                    letterSpacing: -0.4,
                    textAlign: "center",
                    fontFamily: FONT,
                }}
            >
                {title}
            </h2>
            <h3
                style={{
                    margin: "6px 0 12px",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#111827",
                    letterSpacing: -0.6,
                    textAlign: "center",
                    fontFamily: FONT,
                }}
            >
                {highlight}
            </h3>
            <p
                style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: "#4B5563",
                    textAlign: "center",
                    letterSpacing: -0.3,
                    whiteSpace: "pre-line",
                    fontFamily: FONT,
                }}
            >
                {subtitle}
            </p>

            <div
                style={{
                    width: "100%",
                    display: "flex",
                    gap: 12,
                    margin: "28px 0 24px",
                }}
            >
                <StepItem number="01" label={step1Label} image={step1Image} />
                <StepItem number="02" label={step2Label} image={step2Image} />
                <StepItem number="03" label={step3Label} image={step3Image} />
            </div>

            <button
                type="button"
                onClick={onCta}
                style={{
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

addPropertyControls(FlipFoldNoticeSection, {
    title: {
        type: ControlType.String,
        title: "소제목",
        defaultValue: "갤럭시 Z 폴드8 | 플립8",
    },
    highlight: {
        type: ControlType.String,
        title: "강조 타이틀",
        defaultValue: "“사전예약 알림 필수”",
    },
    subtitle: {
        type: ControlType.String,
        title: "설명",
        defaultValue:
            "사전예약 알림을 신청해두면,\nKT마켓이 공식 예약 시간에 알려드려요",
        displayTextArea: true,
    },
    step1Image: { type: ControlType.Image, title: "01 아이콘" },
    step1Label: {
        type: ControlType.String,
        title: "01 텍스트",
        defaultValue: "빠른 정보 확인",
    },
    step2Image: { type: ControlType.Image, title: "02 아이콘" },
    step2Label: {
        type: ControlType.String,
        title: "02 텍스트",
        defaultValue: "최대 혜택&할인",
    },
    step3Image: { type: ControlType.Image, title: "03 아이콘" },
    step3Label: {
        type: ControlType.String,
        title: "03 텍스트",
        defaultValue: "인기 물량 선점",
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
