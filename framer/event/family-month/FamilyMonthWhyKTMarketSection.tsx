// 가정의 달 이벤트 - WhyKTMarketSection
// "휴대폰, 왜 KT마켓일까요?" — 디자이너 PNG 업로드

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
export default function FamilyMonthWhyKTMarketSection(props) {
    const { image, alt = "휴대폰, 왜 KT마켓일까요?", style } = props

    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
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
            {image ? (
                <img
                    src={image}
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
                        aspectRatio: "390 / 480",
                        backgroundColor: "#F6F3F1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#94A3B8",
                        fontSize: 14,
                    }}
                >
                    왜 KT마켓 이미지를 업로드하세요
                </div>
            )}
        </motion.div>
    )
}

addPropertyControls(FamilyMonthWhyKTMarketSection, {
    image: {
        type: ControlType.Image,
        title: "왜 KT마켓 이미지",
    },
    alt: {
        type: ControlType.String,
        title: "alt 텍스트",
        defaultValue: "휴대폰, 왜 KT마켓일까요?",
    },
})
