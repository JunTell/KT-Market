import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import { addPropertyControls, ControlType } from "framer"

// 재고 현황 (재고.md 기준 2026-04-06)
// key: "${modelPrefix}-${capacity}" | value: { [colorValue]: 잔여수량 }
const STOCK_MAP: Record<string, Record<string, number>> = {
    "aip17-256":   { black: 16, lavender: 4, white: 55, mist_blue: 5 },
    "aip17e-256":  { black: 13, pink: 23, white: 14 },
    "aip17p-256":  { deep_blue: 12 },
    "aip17p-512":  { silver: 4 },
    "aip17pm-256": { deep_blue: 5 },
    "aip17pm-512": { silver: 18 },
    "aipa-1t":     { sky_blue: 1, space_black: 1 },
    "aipa-256":    { sky_blue: 6, space_black: 5, light_gold: 8, cloud_white: 6 },
    "aipa-512":    { sky_blue: 5, space_black: 14, light_gold: 4, cloud_white: 11 },
}

// 데이터 구조 정의
interface ColorOption {
    label: string
    value: string
    image: string
    isSoldOut: boolean
}

interface CapacityOption {
    label: string
    value: string
}

interface Props {
    title?: string
    selectedCapacity: string
    selectedColorValue: string
    capacityOptions: CapacityOption[]
    colorOptions: ColorOption[]
    onSelectCapacity: (capacityValue: string) => void
    onSelectColor: (colorCode: string) => void
}

export default function OptionSelector(props: Props) {
    const {
        selectedCapacity,
        selectedColorValue,
        capacityOptions = [],
        colorOptions = [],
        onSelectCapacity,
        onSelectColor,
    } = props

    const [isMounted, setIsMounted] = useState(false)
    const [currentModelPrefix, setCurrentModelPrefix] = useState("")

    useEffect(() => {
        setIsMounted(true)
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search)
            const modelFull = params.get("model") || ""
            const prefix = modelFull.split("-")[0]
            setCurrentModelPrefix(prefix)
        }
    }, [])

    // ✅ [핵심 1] 품절 여부 계산 및 정렬 로직 (재고 수량 포함)
    const processedOptions = useMemo(() => {
        const stockKey = `${currentModelPrefix}-${selectedCapacity}`
        const stockForModel = STOCK_MAP[stockKey] // undefined = 재고.md에 없음 → 전체 품절
        const modelHasStockData = stockForModel !== undefined

        return [...colorOptions]
            .map((color) => {
                // 모델-용량 자체가 STOCK_MAP에 없으면 → 전체 품절
                if (!modelHasStockData) {
                    return { ...color, isDisabled: true, stock: null }
                }

                let isSoldOutByRule = false

                // 아이폰 17 (aip17) 256GB
                // 색상: black, lavender, mist_blue, sage, white
                // 재고: black(16), lavender(4), mist_blue(5), white(55) → sage 품절
                if (currentModelPrefix === "aip17" && selectedCapacity === "256") {
                    if (color.value === "sage") {
                        isSoldOutByRule = true
                    }
                }

                // 아이폰 17 프로 (aip17p) 256GB
                // 색상: deep_blue, cosmic_orange, silver → deep_blue(12)만 재고
                if (currentModelPrefix === "aip17p" && selectedCapacity === "256") {
                    if (color.value !== "deep_blue") {
                        isSoldOutByRule = true
                    }
                }

                // 아이폰 17 프로 (aip17p) 512GB
                // 색상: deep_blue, cosmic_orange, silver → silver(4)만 재고
                if (currentModelPrefix === "aip17p" && selectedCapacity === "512") {
                    if (color.value !== "silver") {
                        isSoldOutByRule = true
                    }
                }

                // 아이폰 17 프로 맥스 (aip17pm) 256GB
                // 색상: deep_blue, cosmic_orange, silver → deep_blue(5)만 재고
                if (currentModelPrefix === "aip17pm" && selectedCapacity === "256") {
                    if (color.value !== "deep_blue") {
                        isSoldOutByRule = true
                    }
                }

                // 아이폰 17 프로 맥스 (aip17pm) 512GB
                // 색상: deep_blue, cosmic_orange, silver → silver(18)만 재고
                if (currentModelPrefix === "aip17pm" && selectedCapacity === "512") {
                    if (color.value !== "silver") {
                        isSoldOutByRule = true
                    }
                }

                // 아이폰 에어 (aipa) 1TB
                // 색상: sky_blue, light_gold, cloud_white, space_black → sky_blue(1), space_black(1)만 재고
                if (currentModelPrefix === "aipa" && selectedCapacity === "1t") {
                    if (!["sky_blue", "space_black"].includes(color.value)) {
                        isSoldOutByRule = true
                    }
                }

                const isDisabled = color.isSoldOut || isSoldOutByRule
                const stock = isDisabled
                    ? null
                    : (stockForModel![color.value] ?? null)

                return { ...color, isDisabled, stock }
            })
            .sort((a, b) => {
                // 판매중 먼저, 품절 나중에
                if (a.isDisabled === b.isDisabled) return 0
                return a.isDisabled ? 1 : -1
            })
    }, [colorOptions, currentModelPrefix, selectedCapacity])

    // ✅ [핵심 2] 현재 선택된 색상이 '품절' 상태라면 -> '판매 중'인 첫 번째 색상으로 자동 변경
    useEffect(() => {
        if (!isMounted) return

        const currentOption = processedOptions.find(
            (opt) => opt.value === selectedColorValue
        )

        // 현재 선택된 색상이 품절(Disabled) 상태라면?
        if (!currentOption || currentOption.isDisabled) {
            // 판매 가능한 첫 번째 옵션을 찾는다.
            const firstAvailable = processedOptions.find(
                (opt) => !opt.isDisabled
            )

            // 판매 가능한게 있으면 변경 (전체 품절이면 변경 안함)
            if (firstAvailable) {
                onSelectColor(firstAvailable.value)
            }
        }
    }, [processedOptions, selectedColorValue, onSelectColor, isMounted])

    if (!isMounted) {
        return null
    }

    // --- Styles ---
    const capacityTabStyle: React.CSSProperties = {
        flex: 1,
        padding: "12px",
        borderRadius: "12px",
        fontSize: "15px",
        fontWeight: 600,
        textAlign: "center",
        cursor: "pointer",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap",
        boxSizing: "border-box",
        userSelect: "none",
    }

    const colorCardStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 0",
        cursor: "pointer",
        transition: "opacity 0.2s",
        borderBottom: "1px solid #F5F5F7",
        userSelect: "none",
    }

    return (
        <div style={containerStyle}>
            <h3 style={headerStyle}>옵션 선택</h3>

            {/* 1. 용량 선택 탭 */}
            {capacityOptions.length > 0 && (
                <div style={capacityContainerStyle}>
                    {capacityOptions.map((opt) => {
                        const isSelected = opt.value === selectedCapacity
                        return (
                            <div
                                key={opt.value}
                                style={{
                                    ...capacityTabStyle,
                                    backgroundColor: isSelected
                                        ? "#FFFFFF"
                                        : "transparent",
                                    boxShadow: isSelected
                                        ? "0px 1px 4px rgba(0, 0, 0, 0.08)"
                                        : "none",
                                    color: isSelected ? "#1D1D1F" : "#6B7280",
                                }}
                                onClick={() => onSelectCapacity(opt.value)}
                            >
                                {opt.label}
                            </div>
                        )
                    })}
                </div>
            )}

            {/* 2. 색상 목록 (processedOptions 사용) */}
            <div style={colorListContainerStyle}>
                {processedOptions.map((color, index) => {
                    const isSelected = color.value === selectedColorValue
                    const isDisabled = color.isDisabled
                    const stock = color.stock as number | null
                    const isLowStock =
                        !isDisabled && stock !== null && stock <= 15

                    return (
                        <div
                            key={`${color.value}-${index}`}
                            style={{
                                ...colorCardStyle,
                                cursor: isDisabled ? "not-allowed" : "pointer",
                                opacity: isDisabled ? 0.5 : 1,
                            }}
                            onClick={() => {
                                if (!isDisabled) onSelectColor(color.value)
                            }}
                        >
                            <div style={colorLeftStyle}>
                                <div style={imageWrapperStyle}>
                                    <img
                                        src={color.image}
                                        alt={color.label}
                                        style={imgStyle}
                                        draggable={false}
                                    />
                                </div>
                                <div>
                                    <span style={colorLabelStyle}>
                                        {color.label}
                                    </span>
                                    {isLowStock && stock !== null && stock <= 5 && (
                                        <div style={urgentTextStyle}>
                                            지금 아니면 품절될 수 있어요
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={colorRightStyle}>
                                {isDisabled && (
                                    <span style={soldOutBadgeStyle}>품절</span>
                                )}
                                {isLowStock && stock !== null && (
                                    <span
                                        style={{
                                            ...stockBadgeStyle,
                                            color:
                                                stock <= 5
                                                    ? "#FF3B30"
                                                    : "#FF9500",
                                            backgroundColor:
                                                stock <= 5
                                                    ? "#FFF1F0"
                                                    : "#FFF8F0",
                                        }}
                                    >
                                        잔여 {stock}개
                                    </span>
                                )}
                                {!isDisabled && isSelected && (
                                    <div style={checkIconWrapperStyle}>
                                        <svg
                                            width="14"
                                            height="10"
                                            viewBox="0 0 14 10"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M1 5L5 9L13 1"
                                                stroke="white"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

// --- CSS Styles (기존과 동일) ---
const containerStyle: React.CSSProperties = {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "24px 0",
    boxSizing: "border-box",
}

const headerStyle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: 700,
    color: "#1d1d1f",
    marginBottom: "8px",
    marginTop: 0,
}

const capacityContainerStyle: React.CSSProperties = {
    display: "flex",
    backgroundColor: "#F3F4F6",
    padding: "4px",
    borderRadius: "14px",
    marginBottom: "16px",
    width: "100%",
    boxSizing: "border-box",
}

const colorListContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
}

const colorLeftStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
}

const imageWrapperStyle: React.CSSProperties = {
    width: "64px",
    height: "64px",
    borderRadius: "12px",
    overflow: "hidden",
    backgroundColor: "#F5F5F7",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    padding: "6px",
    boxSizing: "border-box",
}

const imgStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "contain",
}

const colorLabelStyle: React.CSSProperties = {
    fontSize: "17px",
    color: "#1d1d1f",
    fontWeight: 600,
}

const colorRightStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: "8px",
    flexShrink: 0,
    minWidth: "80px",
}

const stockBadgeStyle: React.CSSProperties = {
    fontSize: "12px",
    fontWeight: 700,
    padding: "4px 8px",
    borderRadius: "6px",
    whiteSpace: "nowrap",
}

const urgentTextStyle: React.CSSProperties = {
    fontSize: "11px",
    color: "#FF3B30",
    fontWeight: 500,
    marginTop: "2px",
}

const soldOutBadgeStyle: React.CSSProperties = {
    backgroundColor: "#F3F4F6",
    color: "#86868b",
    fontSize: "13px",
    padding: "6px 10px",
    borderRadius: "8px",
    fontWeight: 600,
}

const checkIconWrapperStyle: React.CSSProperties = {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    backgroundColor: "#0071e3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}

addPropertyControls(OptionSelector, {
    selectedCapacity: { type: ControlType.String, defaultValue: "256" },
    selectedColorValue: {
        type: ControlType.String,
        defaultValue: "lavender",
    },
    capacityOptions: {
        type: ControlType.Array,
        control: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, defaultValue: "256GB" },
                value: { type: ControlType.String, defaultValue: "256" },
            },
        },
        defaultValue: [
            { label: "256GB", value: "256" },
            { label: "512GB", value: "512" },
        ],
    },
    colorOptions: {
        type: ControlType.Array,
        control: {
            type: ControlType.Object,
            controls: {
                label: { type: ControlType.String, defaultValue: "라벤더" },
                value: {
                    type: ControlType.String,
                    defaultValue: "lavender",
                },
                image: { type: ControlType.Image },
                isSoldOut: { type: ControlType.Boolean, defaultValue: false },
            },
        },
        defaultValue: [
            {
                label: "라벤더",
                value: "lavender",
                image: "https://via.placeholder.com/64/f5f5f7/86868b?text=L",
                isSoldOut: false,
            },
            {
                label: "세이지",
                value: "sage",
                image: "https://via.placeholder.com/64/f5f5f7/86868b?text=S",
                isSoldOut: false,
            },
            {
                label: "미스트 블루",
                value: "blue",
                image: "https://via.placeholder.com/64/f5f5f7/86868b?text=B",
                isSoldOut: true,
            },
            {
                label: "화이트",
                value: "white",
                image: "https://via.placeholder.com/64/f5f5f7/86868b?text=W",
                isSoldOut: false,
            },
            {
                label: "블랙",
                value: "black",
                image: "https://via.placeholder.com/64/f5f5f7/86868b?text=BK",
                isSoldOut: true,
            },
        ],
    },
})
