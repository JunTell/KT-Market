// 가정의 달 이벤트 - HeroSection
// 메인 히어로 이미지 (디자이너 업로드)

import { addPropertyControls, ControlType } from "framer"
import React from "react"
import { motion } from "framer-motion"

const FONT = '"Pretendard", "Inter", sans-serif'

const fadeIn = {
    hidden: { opacity: 0, y: 16 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 */
export default function FamilyMonthHeroSection(props) {
    const { heroImage, alt = "가정의 달 특가", style } = props

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20px" }}
            variants={fadeIn}
            style={{
                width: "100%",
                maxWidth: 440,
                minWidth: 360,
                margin: "0 auto",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                fontFamily: FONT,
                backgroundColor: "#FFFFFF",
                ...style,
            }}
        >
            {heroImage ? (
                <img
                    src={heroImage}
                    alt={alt}
                    style={{
                        width: "100%",
                        height: "auto",
                        display: "block",
                        objectFit: "contain",
                    }}
                />
            ) : (
                <div
                    style={{
                        width: "100%",
                        aspectRatio: "390 / 600",
                        backgroundColor: "#E0F2FE",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#94A3B8",
                        fontSize: 14,
                    }}
                >
                    Hero 이미지를 업로드하세요
                </div>
            )}
        </motion.div>
    )
}

addPropertyControls(FamilyMonthHeroSection, {
    heroImage: {
        type: ControlType.Image,
        title: "Hero 이미지",
    },
    alt: {
        type: ControlType.String,
        title: "alt 텍스트",
        defaultValue: "가정의 달 특가",
    },
})
