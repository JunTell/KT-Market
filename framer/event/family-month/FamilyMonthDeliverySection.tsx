// 가정의 달 이벤트 - DeliverySection
// 제목/소제목은 코드, 그 아래(달력 + 4단계 프로세스)는 디자이너 PNG 업로드

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

const staggerWrap = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 */
export default function FamilyMonthDeliverySection(props) {
    const {
        titleLine1 = "배송이 늦지 않도록",
        titleLine2 = "여유 있게 준비하세요",
        subtitle = "지금 신청하면 여유 있게 받을 수 있어요",
        image,
        alt = "배송 일정 안내",
        background = "#FFFFFF",
        style,
    } = props

    useEffect(() => {
        if (typeof document === "undefined") return
        const id = "kt-fm-delivery-fonts"
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
            variants={staggerWrap}
            style={{
                width: "100%",
                maxWidth: 440,
                minWidth: 360,
                margin: "0 auto",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
                padding: "30px 16px",
                fontFamily: FONT,
                backgroundColor: background,
                ...style,
            }}
        >
            {/* 타이틀 */}
            <motion.div
                variants={fadeUp}
                style={{
                    textAlign: "center",
                    letterSpacing: "0.68px",
                    marginTop: 20,
                }}
            >
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
                <p
                    style={{
                        margin: "10px 0 0",
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: "#6B7280",
                        fontFamily: FONT,
                        fontWeight: 500,
                        letterSpacing: -0.2,
                    }}
                >
                    {subtitle}
                </p>
            </motion.div>

            {/* 본문 이미지 (달력 + 4단계 프로세스) */}
            <motion.div variants={fadeUp} style={{ width: "100%" }}>
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
                            backgroundColor: "#EAF6FB",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#94A3B8",
                            fontSize: 14,
                            borderRadius: 12,
                        }}
                    >
                        달력 + 4단계 프로세스 이미지를 업로드하세요
                    </div>
                )}
            </motion.div>
        </motion.div>
    )
}

addPropertyControls(FamilyMonthDeliverySection, {
    titleLine1: {
        type: ControlType.String,
        title: "타이틀 1줄",
        defaultValue: "배송이 늦지 않도록",
    },
    titleLine2: {
        type: ControlType.String,
        title: "타이틀 2줄 (강조)",
        defaultValue: "여유 있게 준비하세요",
    },
    subtitle: {
        type: ControlType.String,
        title: "소제목",
        defaultValue: "지금 신청하면 여유 있게 받을 수 있어요",
    },
    image: {
        type: ControlType.Image,
        title: "본문 이미지",
    },
    alt: {
        type: ControlType.String,
        title: "alt 텍스트",
        defaultValue: "배송 일정 안내",
    },
    background: {
        type: ControlType.Color,
        title: "배경색",
        defaultValue: "#E0EAF3",
    },
})
