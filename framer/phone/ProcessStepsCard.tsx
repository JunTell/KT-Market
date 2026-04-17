// 신청하면 어떻게 되나요? 카드
// Figma: node 2093:820 (node 1941:6285 동일 파일 내)
// 3단계 프로세스 — 파란 번호 원 + 점선 연결 + 단계명

import { addPropertyControls, ControlType } from "framer"
import React from "react"
import { motion } from "framer-motion"

const FONT = '"Pretendard Variable", "Pretendard", sans-serif'

// ── 단계 원형 배지 ────────────────────────────────────────────
function StepCircle({
    number,
    active,
    done,
}: {
    number: string
    active: boolean
    done: boolean
}) {
    const bg = done || active ? "#0066FF" : "#FFFFFF"
    const border = done || active ? "#0066FF" : "#D1D5DB"
    const color = done || active ? "#FFFFFF" : "#868E96"

    return (
        <div style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            backgroundColor: bg,
            border: `2px solid ${border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxSizing: "border-box",
        }}>
            <span style={{
                fontSize: 12,
                fontWeight: 700,
                color,
                letterSpacing: -0.16,
                lineHeight: 1,
                fontFamily: FONT,
                fontVariantNumeric: "tabular-nums",
            }}>
                {number}
            </span>
        </div>
    )
}

// ── 점선 연결선 (개별 도트 순차 애니메이션) ──────────────────
const DOT_COUNT = 6
const DOT_W = 6
const DOT_GAP = 6
const DOTS_WIDTH = DOT_COUNT * DOT_W + (DOT_COUNT - 1) * DOT_GAP // 66

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 390
 * @framerIntrinsicHeight 110
 */
export default function ProcessStepsCard(props) {
    const {
        title = "신청하면 어떻게 되나요?",
        step1Label = "신청서 작성",
        step2Label = "담당자 연락",
        step3Label = "개통 마무리",
        currentStep = 1,
    } = props

    const steps = [
        { number: "01", label: step1Label },
        { number: "02", label: step2Label },
        { number: "03", label: step3Label },
    ]

    return (
        <div style={{
            width: "100%",
            backgroundColor: "#F8F9FB",
            borderRadius: 14,
            padding: "16px 16px 18px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            fontFamily: FONT,
        }}>
            {/* 타이틀 */}
            <span style={{
                fontSize: 16,
                fontWeight: 700,
                color: "#24292E",
                letterSpacing: -0.3,
                lineHeight: 1.4,
                fontFamily: FONT,
            }}>
                {title}
            </span>

            {/* 스텝 영역 */}
            <div style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                width: "100%",
                position: "relative",
            }}>
                {steps.map((step, i) => {
                    const isActive = i + 1 === currentStep
                    const isDone = i + 1 < currentStep
                    const isLast = i === steps.length - 1

                    return (
                        <React.Fragment key={i}>
                            {/* 스텝 아이템 */}
                            <div style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 6,
                                flexShrink: 0,
                            }}>
                                <StepCircle
                                    number={step.number}
                                    active={isActive}
                                    done={isDone}
                                />
                                <span style={{
                                    fontSize: 12,
                                    fontWeight: isActive || isDone ? 600 : 400,
                                    color: isActive || isDone ? "#24292E" : "#868E96",
                                    letterSpacing: -0.24,
                                    lineHeight: 1.4,
                                    textAlign: "center",
                                    whiteSpace: "nowrap",
                                    fontFamily: FONT,
                                }}>
                                    {step.label}
                                </span>
                            </div>

                            {/* 점선 연결 (6개 도트, 한칸씩 순차 이동) */}
                            {!isLast && (
                                <div style={{
                                    flex: 1,
                                    alignSelf: "flex-start",
                                    marginTop: 17,
                                    marginLeft: 4,
                                    marginRight: 4,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                }}>
                                    {Array.from({ length: DOT_COUNT }).map((_, d) => {
                                        const lineDelay = i * (DOT_COUNT * 0.3 + 1.5)
                                        const dotDelay = lineDelay + d * 0.3
                                        const totalCycle = steps.length * (DOT_COUNT * 0.3 + 1.5)
                                        return (
                                            <motion.div
                                                key={d}
                                                animate={{
                                                    backgroundColor: [
                                                        "#D1D5DB",
                                                        "#0066FF",
                                                        "#D1D5DB",
                                                    ],
                                                }}
                                                transition={{
                                                    duration: 0.6,
                                                    delay: dotDelay,
                                                    repeat: Infinity,
                                                    repeatDelay: totalCycle - 0.6,
                                                    ease: "easeInOut",
                                                }}
                                                style={{
                                                    width: DOT_W,
                                                    height: 2,
                                                    borderRadius: 1,
                                                    backgroundColor: "#D1D5DB",
                                                    flexShrink: 0,
                                                }}
                                            />
                                        )
                                    })}
                                </div>
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
        </div>
    )
}

addPropertyControls(ProcessStepsCard, {
    title: {
        type: ControlType.String,
        title: "타이틀",
        defaultValue: "신청하면 어떻게 되나요?",
    },
    step1Label: {
        type: ControlType.String,
        title: "단계 1",
        defaultValue: "신청서 작성",
    },
    step2Label: {
        type: ControlType.String,
        title: "단계 2",
        defaultValue: "담당자 연락",
    },
    step3Label: {
        type: ControlType.String,
        title: "단계 3",
        defaultValue: "개통 마무리",
    },
    currentStep: {
        type: ControlType.Number,
        title: "현재 단계",
        defaultValue: 1,
        min: 1,
        max: 3,
        step: 1,
        displayStepper: true,
    },
})
