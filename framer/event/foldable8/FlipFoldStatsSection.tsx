// Flip · Fold 사전예약 — 통계 증명 섹션
// "수많은 고객들이 증명한 KT마켓" + 3 스탯 (아이콘=이미지, 텍스트=텍스트)

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

function StatCard({ icon, label, value }) {
    return (
        <div
            style={{
                flex: 1,
                backgroundColor: "#F8FAFC",
                borderRadius: 16,
                padding: "20px 10px 18px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                border: "1px solid #EEF2F7",
            }}
        >
            <div
                style={{
                    width: 64,
                    height: 64,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                {icon ? (
                    <img
                        src={icon}
                        alt={label}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                ) : (
                    <span style={{ color: "#94A3B8", fontSize: 9 }}>아이콘</span>
                )}
            </div>
            <span
                style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: "#374151",
                    letterSpacing: -0.3,
                    fontFamily: FONT,
                }}
            >
                {label}
            </span>
            <span
                style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "#0066FF",
                    letterSpacing: -0.4,
                    fontFamily: FONT,
                }}
            >
                {value}
            </span>
        </div>
    )
}

/**
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 */
export default function FlipFoldStatsSection(props) {
    const {
        title = "수많은 고객들이",
        titleHighlight = "증명한 KT마켓",
        stat1Icon,
        stat1Label = "누적 상담",
        stat1Value = "70,000건 이상",
        stat2Icon,
        stat2Label = "누적 개통",
        stat2Value = "30,000건 이상",
        stat3Icon,
        stat3Label = "실제 후기",
        stat3Value = "1,200건 이상",
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
                    width: "100%",
                    display: "flex",
                    gap: 8,
                    marginTop: 24,
                }}
            >
                <StatCard icon={stat1Icon} label={stat1Label} value={stat1Value} />
                <StatCard icon={stat2Icon} label={stat2Label} value={stat2Value} />
                <StatCard icon={stat3Icon} label={stat3Label} value={stat3Value} />
            </div>
        </motion.section>
    )
}

addPropertyControls(FlipFoldStatsSection, {
    title: { type: ControlType.String, title: "타이틀 1", defaultValue: "수많은 고객들이" },
    titleHighlight: {
        type: ControlType.String,
        title: "타이틀 2",
        defaultValue: "증명한 KT마켓",
    },
    stat1Icon: { type: ControlType.Image, title: "① 아이콘" },
    stat1Label: { type: ControlType.String, title: "① 라벨", defaultValue: "누적 상담" },
    stat1Value: { type: ControlType.String, title: "① 수치", defaultValue: "70,000건 이상" },
    stat2Icon: { type: ControlType.Image, title: "② 아이콘" },
    stat2Label: { type: ControlType.String, title: "② 라벨", defaultValue: "누적 개통" },
    stat2Value: { type: ControlType.String, title: "② 수치", defaultValue: "30,000건 이상" },
    stat3Icon: { type: ControlType.Image, title: "③ 아이콘" },
    stat3Label: { type: ControlType.String, title: "③ 라벨", defaultValue: "실제 후기" },
    stat3Value: {
        type: ControlType.String,
        title: "③ 수치",
        defaultValue: "1,200건 이상",
    },
})
