// 휴대폰, 왜 KT마켓일까요? 카드
// Figma: node 1804:1194
// 6개 혜택 항목 — 3×2 그리드 + 타이틀

import { addPropertyControls, ControlType } from "framer"
import React from "react"
import { motion } from "framer-motion"

const FONT = '"Pretendard", "Inter", sans-serif'

// ─── 모션 프리셋 ──────────────────────────────────────────────
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
    visible: {
        transition: { staggerChildren: 0.1, delayChildren: 0.15 },
    },
}

const cellMotion = {
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 */
export default function WhyKTMarketCard(props) {
    const {
        title = "휴대폰,",
        titleHighlight = "왜 KT마켓일까요?",
        item1Title = "단독지원금으로",
        item1Highlight = "기기값 즉시 할인",
        item1Icon,
        item2Title = "할인을 중복으로",
        item2Highlight = "공통지원금or요금할인",
        item2Icon,
        item3Title = "비싼 요금제",
        item3Highlight = "필수조건 없음",
        item3Icon,
        item4Title = "부가서비스",
        item4Highlight = "조건 없음",
        item4Icon,
        item5Title = "카드 발급",
        item5Highlight = "조건 없음",
        item5Icon,
        item6Title = "중고기기",
        item6Highlight = "반납조건 없음",
        item6Icon,
        style,
    } = props

    const items = [
        { title: item1Title, highlight: item1Highlight, icon: item1Icon },
        { title: item2Title, highlight: item2Highlight, icon: item2Icon },
        { title: item3Title, highlight: item3Highlight, icon: item3Icon },
        { title: item4Title, highlight: item4Highlight, icon: item4Icon },
        { title: item5Title, highlight: item5Highlight, icon: item5Icon },
        { title: item6Title, highlight: item6Highlight, icon: item6Icon },
    ]

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
                padding: "32px 16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
                fontFamily: FONT,
                backgroundColor: "#FFFFFF",
                ...style,
            }}
        >
            {/* 타이틀 */}
            <motion.div variants={fadeUp} style={titleContainerStyle}>
                <div style={titleTextStyle}>{title}</div>
                <span style={titleHighlightStyle}>{titleHighlight}</span>
            </motion.div>

            {/* 3×2 그리드 */}
            <motion.div variants={staggerWrap} style={gridStyle}>
                {items.map((item, i) => (
                    <motion.div key={i} variants={cellMotion} style={cellStyle}>
                        {item.icon && (
                            <img
                                src={item.icon}
                                width={48}
                                height={48}
                                style={{ objectFit: "contain", flexShrink: 0 }}
                            />
                        )}
                        <div style={cellTextContainerStyle}>
                            <span style={cellTitleStyle}>{item.title}</span>
                            <span style={cellHighlightStyle}>
                                {item.highlight}
                            </span>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    )
}

// ─── 스타일 ────────────────────────────────────────────────
const titleContainerStyle: React.CSSProperties = {
    textAlign: "center",
    letterSpacing: "0.716px",
}

const titleTextStyle: React.CSSProperties = {
    fontSize: 28,
    fontWeight: 700,
    color: "#000",
    lineHeight: 1.25,
    fontFamily: FONT,
}

const titleHighlightStyle: React.CSSProperties = {
    fontSize: 32,
    fontWeight: 800,
    color: "#2A86FF",
    lineHeight: 1.25,
    fontFamily: FONT,
    backgroundImage: "linear-gradient(transparent 60%, #D5F85D 60%)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "100% 100%",
}

const gridStyle: React.CSSProperties = {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
}

const cellStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: "13px 0",
    backgroundColor: "#EEF4FA",
    borderRadius: 11.5,
    boxSizing: "border-box",
    flexShrink: 0,
}

const cellTextContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 2,
}

const cellTitleStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 500,
    color: "#3F4750",
    letterSpacing: -0.24,
    lineHeight: 1.4,
    textAlign: "center",
    fontFamily: FONT,
}

const cellHighlightStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 700,
    color: "#0066FF",
    letterSpacing: -0.3,
    lineHeight: 1.4,
    textAlign: "center",
    fontFamily: FONT,
}

// ─── Property Controls ────────────────────────────────────
addPropertyControls(WhyKTMarketCard, {
    title: {
        type: ControlType.String,
        title: "타이틀",
        defaultValue: "휴대폰,",
    },
    titleHighlight: {
        type: ControlType.String,
        title: "타이틀 강조",
        defaultValue: "왜 KT마켓일까요?",
    },
    item1Title: { type: ControlType.String, title: "1 타이틀", defaultValue: "단독지원금으로" },
    item1Highlight: { type: ControlType.String, title: "1 강조", defaultValue: "기기값 즉시 할인" },
    item1Icon: { type: ControlType.Image, title: "1 아이콘" },
    item2Title: { type: ControlType.String, title: "2 타이틀", defaultValue: "할인을 중복으로" },
    item2Highlight: { type: ControlType.String, title: "2 강조", defaultValue: "공통지원금or요금할인" },
    item2Icon: { type: ControlType.Image, title: "2 아이콘" },
    item3Title: { type: ControlType.String, title: "3 타이틀", defaultValue: "비싼 요금제" },
    item3Highlight: { type: ControlType.String, title: "3 강조", defaultValue: "필수조건 없음" },
    item3Icon: { type: ControlType.Image, title: "3 아이콘" },
    item4Title: { type: ControlType.String, title: "4 타이틀", defaultValue: "부가서비스" },
    item4Highlight: { type: ControlType.String, title: "4 강조", defaultValue: "조건 없음" },
    item4Icon: { type: ControlType.Image, title: "4 아이콘" },
    item5Title: { type: ControlType.String, title: "5 타이틀", defaultValue: "카드 발급" },
    item5Highlight: { type: ControlType.String, title: "5 강조", defaultValue: "조건 없음" },
    item5Icon: { type: ControlType.Image, title: "5 아이콘" },
    item6Title: { type: ControlType.String, title: "6 타이틀", defaultValue: "중고기기" },
    item6Highlight: { type: ControlType.String, title: "6 강조", defaultValue: "반납조건 없음" },
    item6Icon: { type: ControlType.Image, title: "6 아이콘" },
})
