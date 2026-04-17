import * as React from "react"
import { addPropertyControls, ControlType } from "framer"
import { motion } from "framer-motion"

type RoadmapItem = {
    step: string
    title: string
    description: string
}

type BenefitItem = {
    label: string
    value: string
}

type Props = {
    eyebrow: string
    title: string
    description: string
    ctaText: string
    subText: string
    backgroundTop: string
    backgroundBottom: string
}

const MAX_WIDTH = 440

const benefitItems: BenefitItem[] = [
    { label: "사전예약 혜택", value: "최대 52만원" },
    { label: "추가 사은품", value: "한정 수량 제공" },
    { label: "상담 연결", value: "신청 후 빠른 안내" },
]

const roadmapItems: RoadmapItem[] = [
    {
        step: "STEP 01",
        title: "모델 선택",
        description: "사전예약 대상 모델과 컬러, 용량을 먼저 선택합니다.",
    },
    {
        step: "STEP 02",
        title: "혜택 확인",
        description: "즉시 할인과 추가 혜택, 요금제 조건을 비교합니다.",
    },
    {
        step: "STEP 03",
        title: "정보 입력",
        description: "주문자 정보를 입력하고 원하는 신청 방식을 선택합니다.",
    },
    {
        step: "STEP 04",
        title: "상담 및 접수",
        description: "접수 후 순차적으로 상담 연결과 개통 절차가 진행됩니다.",
    },
]

const fadeUp = {
    hidden: { opacity: 0, y: 18 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
    },
}

const staggerWrap = {
    hidden: {},
    visible: {
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.12,
        },
    },
}

const cardMotion = {
    hidden: { opacity: 0, y: 20, scale: 0.985 },
    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
    },
}

export default function PreorderLoadmapEventPage(props: Props) {
    return (
        <div
            style={{
                width: "100%",
                maxWidth: MAX_WIDTH,
                margin: "0 auto",
                backgroundColor: "#F4F7FB",
                overflow: "hidden",
            }}
        >
            <section
                style={{
                    position: "relative",
                    overflow: "hidden",
                    background: `linear-gradient(180deg, ${props.backgroundTop} 0%, ${props.backgroundBottom} 100%)`,
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        overflow: "hidden",
                        pointerEvents: "none",
                    }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.88 }}
                        animate={{ opacity: 0.95, scale: 1 }}
                        transition={{ duration: 1.1, ease: "easeOut" }}
                        style={{
                            position: "absolute",
                            top: -120,
                            right: -110,
                            width: 280,
                            height: 280,
                            borderRadius: "50%",
                            background:
                                "radial-gradient(circle, rgba(0,114,255,0.52) 0%, rgba(0,114,255,0) 72%)",
                        }}
                    />
                    <motion.div
                        animate={{ y: [0, -12, 0], rotate: [0, 4, 0] }}
                        transition={{ duration: 6.2, repeat: Infinity, ease: "easeInOut" }}
                        style={{
                            position: "absolute",
                            top: 320,
                            left: -44,
                            width: 132,
                            height: 132,
                            borderRadius: 32,
                            background:
                                "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04))",
                            border: "1px solid rgba(255,255,255,0.16)",
                            backdropFilter: "blur(10px)",
                        }}
                    />
                </div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerWrap}
                    style={{
                        position: "relative",
                        zIndex: 1,
                        padding: "24px 20px 28px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 24,
                    }}
                >
                    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                        <motion.div
                            variants={fadeUp}
                            style={{
                                display: "inline-flex",
                                alignSelf: "flex-start",
                                padding: "10px 14px",
                                borderRadius: 999,
                                background: "rgba(255,255,255,0.1)",
                                border: "1px solid rgba(255,255,255,0.18)",
                                color: "#D9E7FF",
                                fontSize: 11,
                                fontWeight: 800,
                                letterSpacing: "0.08em",
                            }}
                        >
                            {props.eyebrow}
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            style={{
                                margin: 0,
                                color: "#FFFFFF",
                                fontSize: 42,
                                lineHeight: 1.04,
                                fontWeight: 800,
                                letterSpacing: "-0.045em",
                                whiteSpace: "pre-line",
                            }}
                        >
                            {props.title}
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            style={{
                                margin: 0,
                                color: "rgba(255,255,255,0.82)",
                                fontSize: 15,
                                lineHeight: 1.6,
                            }}
                        >
                            {props.description}
                        </motion.p>

                        <motion.div
                            variants={fadeUp}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 10,
                                alignItems: "flex-start",
                            }}
                        >
                            <button
                                style={{
                                    height: 52,
                                    padding: "0 20px",
                                    border: "none",
                                    borderRadius: 999,
                                    backgroundColor: "#FFFFFF",
                                    color: "#0A43DB",
                                    fontSize: 15,
                                    fontWeight: 800,
                                    cursor: "pointer",
                                }}
                            >
                                {props.ctaText}
                            </button>
                            <span
                                style={{
                                    color: "rgba(255,255,255,0.66)",
                                    fontSize: 13,
                                    fontWeight: 500,
                                }}
                            >
                                {props.subText}
                            </span>
                        </motion.div>
                    </div>

                    <motion.div
                        variants={staggerWrap}
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr",
                            gap: 10,
                        }}
                    >
                        {benefitItems.map((item) => (
                            <motion.div
                                key={item.label}
                                variants={cardMotion}
                                style={{
                                    padding: "18px 16px",
                                    borderRadius: 20,
                                    background:
                                        "linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.08))",
                                    border: "1px solid rgba(255,255,255,0.14)",
                                    backdropFilter: "blur(14px)",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "rgba(255,255,255,0.65)",
                                        fontWeight: 700,
                                        marginBottom: 8,
                                    }}
                                >
                                    {item.label}
                                </div>
                                <div
                                    style={{
                                        fontSize: 24,
                                        lineHeight: 1.1,
                                        color: "#FFFFFF",
                                        fontWeight: 800,
                                        letterSpacing: "-0.04em",
                                    }}
                                >
                                    {item.value}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </motion.div>
            </section>

            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.25 }}
                variants={staggerWrap}
                style={{
                    padding: "20px 16px 28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                }}
            >
                <motion.div
                    variants={fadeUp}
                    style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 24,
                        padding: "22px 18px",
                        boxShadow: "0 20px 48px rgba(15, 23, 42, 0.08)",
                    }}
                >
                    <div
                        style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: "#0057FF",
                            letterSpacing: "0.08em",
                            marginBottom: 8,
                        }}
                    >
                        PREORDER ROADMAP
                    </div>
                    <div
                        style={{
                            fontSize: 26,
                            lineHeight: 1.15,
                            fontWeight: 800,
                            color: "#111827",
                            letterSpacing: "-0.04em",
                            marginBottom: 10,
                        }}
                    >
                        사전예약 진행 흐름
                    </div>
                    <div
                        style={{
                            fontSize: 14,
                            lineHeight: 1.6,
                            color: "#4B5563",
                        }}
                    >
                        메인 배너 아래에서 신청 단계와 혜택 흐름을 자연스럽게
                        연결할 수 있도록 카드형 로드맵으로 구성합니다.
                    </div>
                </motion.div>

                {roadmapItems.map((item, index) => (
                    <motion.div
                        key={item.step}
                        variants={cardMotion}
                        style={{
                            position: "relative",
                            padding: "20px 18px 18px",
                            borderRadius: 22,
                            backgroundColor: index === 0 ? "#EAF2FF" : "#FFFFFF",
                            border: `1px solid ${index === 0 ? "#CFE0FF" : "#E5E7EB"}`,
                            boxShadow:
                                index === 0
                                    ? "0 14px 32px rgba(0, 87, 255, 0.08)"
                                    : "0 10px 24px rgba(15, 23, 42, 0.05)",
                        }}
                    >
                        <div
                            style={{
                                display: "inline-flex",
                                marginBottom: 12,
                                padding: "7px 10px",
                                borderRadius: 999,
                                backgroundColor: "#FFFFFF",
                                color: "#0057FF",
                                fontSize: 11,
                                fontWeight: 800,
                            }}
                        >
                            {item.step}
                        </div>
                        <div
                            style={{
                                fontSize: 22,
                                lineHeight: 1.2,
                                fontWeight: 800,
                                color: "#111827",
                                letterSpacing: "-0.03em",
                                marginBottom: 10,
                            }}
                        >
                            {item.title}
                        </div>
                        <div
                            style={{
                                fontSize: 14,
                                lineHeight: 1.6,
                                color: "#4B5563",
                            }}
                        >
                            {item.description}
                        </div>
                    </motion.div>
                ))}
            </motion.section>
        </div>
    )
}

addPropertyControls(PreorderLoadmapEventPage, {
    eyebrow: {
        type: ControlType.String,
        title: "Eyebrow",
        defaultValue: "KT MARKET PREORDER",
    },
    title: {
        type: ControlType.String,
        title: "Title",
        defaultValue: "사전예약 혜택과\n신청 흐름을 한 번에",
    },
    description: {
        type: ControlType.String,
        title: "Description",
        defaultValue:
            "메인 배너에서 혜택, 신청 단계, 상담 연결 흐름까지 끊기지 않게 전달할 수 있도록 모바일 중심으로 구성한 이벤트 페이지 예제입니다.",
    },
    ctaText: {
        type: ControlType.String,
        title: "CTA",
        defaultValue: "혜택 확인하기",
    },
    subText: {
        type: ControlType.String,
        title: "Sub Text",
        defaultValue: "행사 기간 한정 운영",
    },
    backgroundTop: {
        type: ControlType.Color,
        title: "BG Top",
        defaultValue: "#08101F",
    },
    backgroundBottom: {
        type: ControlType.Color,
        title: "BG Bottom",
        defaultValue: "#0C2047",
    },
})
