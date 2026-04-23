// 가정의 달 이벤트 - 하단 고정 CTA 바
// Figma: 2431:7323
// 카카오톡 상담하기 (노란 버튼) + 신청하기 (핑크 버튼)

import { addPropertyControls, ControlType } from "framer"
import React from "react"
import { motion } from "framer-motion"

const FONT = '"Pretendard", "Inter", sans-serif'

const slideUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
    },
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 */
export default function FamilyMonthBottomCTA(props) {
    const {
        kakaoLabel = "카카오톡 상담하기",
        kakaoLink = "https://pf.kakao.com/",
        applyLabel = "신청하기",
        applyLink = "",
        background = "#F4F0EE",
        kakaoBg = "#FACF03",
        kakaoColor = "#4E0B00",
        applyBg = "#C42A5D",
        applyColor = "#FFFFFF",
        style,
    } = props

    const handleKakao = () => {
        if (kakaoLink && typeof window !== "undefined") {
            window.open(kakaoLink, "_blank")
        }
    }

    const handleApply = () => {
        if (!applyLink || typeof window === "undefined") return
        if (applyLink.startsWith("#")) {
            const target = document.querySelector(applyLink) as HTMLElement | null
            if (target) {
                const top = target.getBoundingClientRect().top + window.scrollY
                window.scrollTo({ top, behavior: "smooth" })
                return
            }
        }
        window.location.href = applyLink
    }

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20px" }}
            variants={slideUp}
            style={{
                width: "100%",
                maxWidth: 440,
                minWidth: 360,
                margin: "0 auto",
                boxSizing: "border-box",
                backgroundColor: background,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 11,
                padding: "18px 16px calc(18px + env(safe-area-inset-bottom))",
                fontFamily: FONT,
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                marginLeft: "auto",
                marginRight: "auto",
                zIndex: 50,
                ...style,
            }}
        >
            {/* 카카오톡 상담하기 */}
            <motion.button
                onClick={handleKakao}
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                style={{
                    flex: "1 1 0",
                    minWidth: 0,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: kakaoBg,
                    color: kakaoColor,
                    padding: "11px 16px",
                    borderRadius: 113,
                    boxShadow: "0 4px 4px rgba(0,0,0,0.12)",
                    fontFamily: FONT,
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: 0.36,
                    lineHeight: 1.25,
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {kakaoLabel}
            </motion.button>

            {/* 신청하기 */}
            <motion.button
                onClick={handleApply}
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.02 }}
                style={{
                    flex: "1 1 0",
                    minWidth: 0,
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: applyBg,
                    color: applyColor,
                    padding: "11px 16px",
                    borderRadius: 113,
                    boxShadow: "0 4px 4px rgba(0,0,0,0.12)",
                    fontFamily: FONT,
                    fontSize: 16,
                    fontWeight: 700,
                    letterSpacing: 0.36,
                    lineHeight: 1.25,
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                }}
            >
                {applyLabel}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path
                        d="M5 3L9 7L5 11"
                        stroke={applyColor}
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </motion.button>
        </motion.div>
    )
}

addPropertyControls(FamilyMonthBottomCTA, {
    kakaoLabel: {
        type: ControlType.String,
        title: "카카오 버튼 텍스트",
        defaultValue: "카카오톡 상담하기",
    },
    kakaoLink: {
        type: ControlType.String,
        title: "카카오 링크",
        defaultValue: "https://pf.kakao.com/",
    },
    applyLabel: {
        type: ControlType.String,
        title: "신청 버튼 텍스트",
        defaultValue: "신청하기",
    },
    applyLink: {
        type: ControlType.String,
        title: "신청 링크",
        defaultValue: "",
    },
    background: {
        type: ControlType.Color,
        title: "바 배경",
        defaultValue: "#F4F0EE",
    },
    kakaoBg: {
        type: ControlType.Color,
        title: "카카오 배경",
        defaultValue: "#FACF03",
    },
    kakaoColor: {
        type: ControlType.Color,
        title: "카카오 텍스트",
        defaultValue: "#4E0B00",
    },
    applyBg: {
        type: ControlType.Color,
        title: "신청 배경",
        defaultValue: "#C42A5D",
    },
    applyColor: {
        type: ControlType.Color,
        title: "신청 텍스트",
        defaultValue: "#FFFFFF",
    },
})
