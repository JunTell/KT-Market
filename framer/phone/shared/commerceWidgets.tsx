// 커머스 위젯 통합 모듈
// Framer 상세 페이지에서 재사용 가능한 커머스 컴포넌트 모음
// BB1: 옵션/CTA/가격 위젯 모듈화

import React from "react"
import { motion } from "framer-motion"

const FONT = '"Pretendard", "Inter", sans-serif'

// ─── 가격 표시 위젯 ─────────────────────────────────────────────────
export function PriceDisplay({
    label = "최저가",
    price,
    originalPrice,
    discountText,
    size = "large",
}: {
    label?: string
    price: number
    originalPrice?: number
    discountText?: string
    size?: "large" | "small"
}) {
    const isLarge = size === "large"
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 2, fontFamily: FONT }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{
                    fontSize: isLarge ? 14 : 12,
                    fontWeight: 600,
                    color: "#0066FF",
                    letterSpacing: -0.24,
                }}>
                    {label}
                </span>
                <span style={{
                    fontSize: isLarge ? 28 : 20,
                    fontWeight: 800,
                    color: "#24292E",
                    letterSpacing: isLarge ? -1 : -0.4,
                    fontVariantNumeric: "tabular-nums",
                }}>
                    {price.toLocaleString()}
                </span>
                <span style={{
                    fontSize: isLarge ? 22 : 16,
                    fontWeight: 700,
                    color: "#24292E",
                }}>
                    원
                </span>
            </div>
            {originalPrice != null && originalPrice > price && discountText && (
                <span style={{
                    fontSize: 13,
                    color: "#EF4444",
                    fontWeight: 700,
                    letterSpacing: -0.24,
                }}>
                    {discountText}
                </span>
            )}
        </div>
    )
}

// ─── CTA 버튼 ─────────────────────────────────────────────────────
export function CTAButton({
    label = "신청하기",
    onClick,
    variant = "primary",
    size = "large",
    disabled = false,
}: {
    label?: string
    onClick?: () => void
    variant?: "primary" | "secondary" | "outline"
    size?: "large" | "medium" | "small"
    disabled?: boolean
}) {
    const heights = { large: 54, medium: 44, small: 36 }
    const fontSizes = { large: 17, medium: 15, small: 14 }
    const radiuses = { large: 14, medium: 10, small: 8 }

    const bgColors = {
        primary: "#0066FF",
        secondary: "#3F4750",
        outline: "transparent",
    }
    const textColors = {
        primary: "#FFFFFF",
        secondary: "#FFFFFF",
        outline: "#0066FF",
    }

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            style={{
                width: "100%",
                height: heights[size],
                borderRadius: radiuses[size],
                border: variant === "outline" ? "1.5px solid #0066FF" : "none",
                backgroundColor: disabled ? "#D1D5DB" : bgColors[variant],
                color: disabled ? "#9CA3AF" : textColors[variant],
                fontSize: fontSizes[size],
                fontWeight: 700,
                letterSpacing: -0.3,
                lineHeight: 1,
                cursor: disabled ? "not-allowed" : "pointer",
                fontFamily: FONT,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            {label}
        </button>
    )
}

// ─── 배지 ─────────────────────────────────────────────────────────
export function Badge({
    text,
    color = "blue",
}: {
    text: string
    color?: "blue" | "red" | "purple" | "gray"
}) {
    const colorMap = {
        blue: { bg: "#EFF6FF", text: "#3B82F6" },
        red: { bg: "#FEF2F2", text: "#EF4444" },
        purple: { bg: "#F5F3FF", text: "#7C3AED" },
        gray: { bg: "#F3F4F6", text: "#6B7280" },
    }
    const c = colorMap[color]
    return (
        <span style={{
            display: "inline-flex",
            alignItems: "center",
            height: 27,
            padding: "3px 10px",
            backgroundColor: c.bg,
            borderRadius: 7,
            fontSize: 12,
            fontWeight: 700,
            color: c.text,
            letterSpacing: -0.24,
            lineHeight: 1.5,
            fontFamily: FONT,
            whiteSpace: "nowrap",
        }}>
            {text}
        </span>
    )
}

// ─── 옵션 선택 칩 ──────────────────────────────────────────────────
export function OptionChip({
    label,
    isActive = false,
    onClick,
    disabled = false,
}: {
    label: string
    isActive?: boolean
    onClick?: () => void
    disabled?: boolean
}) {
    return (
        <motion.button
            type="button"
            onClick={onClick}
            disabled={disabled}
            whileTap={disabled ? {} : { scale: 0.96 }}
            style={{
                height: 38,
                padding: "0 16px",
                borderRadius: 10,
                border: isActive ? "1.5px solid #0066FF" : "1.5px solid #E5E7EB",
                backgroundColor: isActive ? "#ECF4FF" : "#FFFFFF",
                color: isActive ? "#0066FF" : disabled ? "#D1D5DB" : "#868E96",
                fontSize: 14,
                fontWeight: isActive ? 700 : 400,
                letterSpacing: -0.24,
                cursor: disabled ? "not-allowed" : "pointer",
                fontFamily: FONT,
                whiteSpace: "nowrap",
            }}
        >
            {label}
        </motion.button>
    )
}

// ─── 섹션 래퍼 ─────────────────────────────────────────────────────
export function Section({
    title,
    children,
    gap = 12,
}: {
    title?: string
    children: React.ReactNode
    gap?: number
}) {
    return (
        <div style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap,
            fontFamily: FONT,
        }}>
            {title && (
                <span style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#24292E",
                    letterSpacing: -0.34,
                    lineHeight: 1.4,
                }}>
                    {title}
                </span>
            )}
            {children}
        </div>
    )
}
