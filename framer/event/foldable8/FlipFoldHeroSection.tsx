// Flip · Fold 사전예약 — Hero 섹션
// 전체 이미지 업로드 (KT 케이티마켓 · SAMSUNG · 사전예약 타이틀 · 디바이스 비주얼)

import { addPropertyControls, ControlType } from "framer"
import React from "react"
import { motion } from "framer-motion"

const FONT = '"Cafe24 Ohsquare", "Cafe24 Ohsquare OTF", sans-serif'

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 */
export default function FlipFoldHeroSection(props) {
    const { heroImage, alt = "갤럭시 Z 폴드8 플립8 사전예약", style } = props

    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{
                width: "100%",
                maxWidth: 440,
                minWidth: 360,
                margin: "0 auto",
                fontFamily: FONT,
                backgroundColor: "#FFFFFF",
                display: "block",
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
                        aspectRatio: "390 / 620",
                        backgroundColor: "#0A0A1A",
                        color: "#8B95A5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        fontFamily: FONT,
                    }}
                >
                    Hero 이미지를 업로드하세요
                </div>
            )}
        </motion.div>
    )
}

addPropertyControls(FlipFoldHeroSection, {
    heroImage: { type: ControlType.Image, title: "Hero 이미지" },
    alt: {
        type: ControlType.String,
        title: "alt",
        defaultValue: "갤럭시 Z 폴드8 플립8 사전예약",
    },
})
