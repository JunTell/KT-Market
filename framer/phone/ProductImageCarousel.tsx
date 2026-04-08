// withCarousel code override 사용 (colors + urls + isLoading 통합)

import { addPropertyControls, ControlType } from "framer"
import React, { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"

const ArrowLeftSVG = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="16px"
        height="16px"
    >
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
    </svg>
)

const ArrowRightSVG = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        width="16px"
        height="16px"
    >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
)

// 품절 색상에 표시할 사선 오버레이
const SoldOutOverlay = () => (
    <svg
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", borderRadius: "50%" }}
        viewBox="0 0 28 28"
    >
        <line x1="4" y1="4" x2="24" y2="24" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
    </svg>
)

const COLOR_BAR = 56 // 색상 서클 영역 고정 높이 (px)

// 스켈레톤: 이미지 영역 + 컬러 서클 영역 (단일 컨테이너)
const SkeletonView = ({ imageHeight }: { imageHeight: number }) => (
    <div style={{ width: "100%", position: "relative", height: `${imageHeight + COLOR_BAR}px` }}>
        {/* 이미지 영역 스켈레톤 */}
        <motion.div
            style={{
                position: "absolute",
                top: 0, left: 0, right: 0,
                height: `${imageHeight}px`,
                backgroundColor: "#E5E7EB",
                borderRadius: "12px",
            }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* 컬러 서클 스켈레톤 (3개) */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${COLOR_BAR}px`, display: "flex", gap: "12px", justifyContent: "center", alignItems: "center" }}>
            {[0, 1, 2].map((i) => (
                <motion.div
                    key={i}
                    style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "#E5E7EB", flexShrink: 0 }}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: i * 0.15 }}
                />
            ))}
        </div>
    </div>
)

export default function ProductImageCarousel(props) {
    const {
        urls = [],
        colors = [],
        onColorChange,
        isLoading = false,
        imageHeight = 240,
        activeColor,
    } = props

    const [isMounted, setIsMounted] = useState(false)
    const [items, setItems] = useState(urls)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [touchStartX, setTouchStartX] = useState(null)
    const [touchStartY, setTouchStartY] = useState(null)
    const [dragOffset, setDragOffset] = useState(0)
    const [isDragging, setIsDragging] = useState(false)
    const [isHorizontalScroll, setIsHorizontalScroll] = useState(false)
    // 즉각적인 시각 피드백을 위한 내부 active color 상태
    const [activeColorLocal, setActiveColorLocal] = useState(activeColor ?? null)

    useEffect(() => { setIsMounted(true) }, [])

    // 외부 activeColor prop 변경 시 내부 상태 동기화 (override에서 초기값 주입)
    useEffect(() => {
        if (activeColor) setActiveColorLocal(activeColor)
    }, [activeColor])

    // urls prop 변경 시(override에서 색상 변경 후 업데이트) 슬라이드 초기화
    useEffect(() => {
        setItems(urls)
        setCurrentIndex(0)
    }, [urls])

    useEffect(() => {
        if (!isDragging) setDragOffset(0)
    }, [isDragging])

    const goToNext = useCallback(() => {
        if (currentIndex < items.length - 1) setCurrentIndex((i) => i + 1)
    }, [currentIndex, items.length])

    const goToPrev = useCallback(() => {
        if (currentIndex > 0) setCurrentIndex((i) => i - 1)
    }, [currentIndex])

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        setTouchStartX(e.touches[0].clientX)
        setTouchStartY(e.touches[0].clientY)
        setIsDragging(true)
        setIsHorizontalScroll(false)
    }

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (!touchStartX || !touchStartY) return
        const deltaX = e.touches[0].clientX - touchStartX
        const deltaY = e.touches[0].clientY - touchStartY
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            setIsHorizontalScroll(true)
            setDragOffset(deltaX)
        }
    }

    const handleTouchEnd = () => {
        if (isHorizontalScroll) {
            if (dragOffset > 50 && currentIndex > 0) goToPrev()
            else if (dragOffset < -50 && currentIndex < items.length - 1) goToNext()
        }
        setTouchStartX(null)
        setTouchStartY(null)
        setDragOffset(0)
        setIsDragging(false)
    }

    const handleColorClick = (color) => {
        if (color.isSoldOut) return
        // override 응답을 기다리지 않고 즉시 내부 상태 업데이트
        setActiveColorLocal(color)
        if (Array.isArray(color.urls) && color.urls.length > 0) {
            setItems(color.urls)
            setCurrentIndex(0)
        }
        if (onColorChange) onColorChange(color)
    }

    if (!isMounted) return <div style={{ width: "100%", height: `${imageHeight + (colors.length > 0 ? COLOR_BAR : 0)}px` }} />

    // 로딩 중: 스켈레톤
    if (isLoading) return <SkeletonView imageHeight={imageHeight} />

    // 이미지 없음
    if (items.length === 0) {
        return (
            <div style={{ width: "100%", height: `${imageHeight}px`, backgroundColor: "#F3F4F6", borderRadius: "12px", display: "flex", justifyContent: "center", alignItems: "center", color: "#9CA3AF", fontSize: "14px" }}>
                이미지가 없습니다
            </div>
        )
    }

    const totalHeight = imageHeight + (colors.length > 0 ? COLOR_BAR : 0)

    return (
        <div style={{ width: "100%", height: `${totalHeight}px`, display: "flex", flexDirection: "column", alignItems: "center", overflow: "visible" }}>
            {/* ── 이미지 슬라이드 영역 ── */}
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    height: `${imageHeight}px`,
                    overflow: "hidden",
                    touchAction: "pan-y",
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div
                    style={{
                        display: "flex",
                        height: "100%",
                        width: "100%",
                        transition: !isDragging ? "transform 0.3s ease-in-out" : "none",
                        transform: `translateX(calc(-${currentIndex * 100}% + ${dragOffset}px))`,
                    }}
                >
                    {items.map((url, index) => (
                        <div
                            key={index}
                            style={{
                                flex: "0 0 100%",
                                height: "100%",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <img
                                src={url}
                                alt={`Slide ${index}`}
                                style={{ maxWidth: "90%", maxHeight: "90%", objectFit: "contain", userSelect: "none" }}
                                draggable={false}
                            />
                        </div>
                    ))}
                </div>

                {/* 왼쪽 화살표 */}
                <button
                    onClick={goToPrev}
                    disabled={currentIndex === 0}
                    style={{
                        position: "absolute",
                        left: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 2,
                        width: "32px",
                        height: "32px",
                        backgroundColor: "rgba(255,255,255,0.85)",
                        border: "none",
                        borderRadius: "50%",
                        cursor: currentIndex === 0 ? "default" : "pointer",
                        opacity: currentIndex === 0 ? 0 : 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                        color: "#374151",
                        transition: "opacity 0.2s",
                    }}
                >
                    <ArrowLeftSVG />
                </button>

                {/* 오른쪽 화살표 */}
                <button
                    onClick={goToNext}
                    disabled={currentIndex === items.length - 1}
                    style={{
                        position: "absolute",
                        right: "8px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 2,
                        width: "32px",
                        height: "32px",
                        backgroundColor: "rgba(255,255,255,0.85)",
                        border: "none",
                        borderRadius: "50%",
                        cursor: currentIndex === items.length - 1 ? "default" : "pointer",
                        opacity: currentIndex === items.length - 1 ? 0 : 1,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                        color: "#374151",
                        transition: "opacity 0.2s",
                    }}
                >
                    <ArrowRightSVG />
                </button>

                {/* 하단 도트 인디케이터 */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "10px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        gap: "6px",
                        zIndex: 2,
                    }}
                >
                    {items.map((_, index) => (
                        <div
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            style={{
                                width: currentIndex === index ? "16px" : "6px",
                                height: "6px",
                                backgroundColor: currentIndex === index ? "#0055FF" : "rgba(0,0,0,0.2)",
                                borderRadius: "9999px",
                                cursor: "pointer",
                                transition: "all 0.25s ease",
                            }}
                        />
                    ))}
                </div>
            </div>{/* ← 이미지 슬라이드 영역 닫기 */}

            {/* ── 색상 선택 서클 — 이미지 아래 일반 flow로 배치 (fit height 대응) ── */}
            {colors.length > 0 && (
                <div
                    style={{
                        width: "100%",
                        height: `${COLOR_BAR}px`,
                        display: "flex",
                        gap: "12px",
                        justifyContent: "center",
                        alignItems: "center",
                        flexWrap: "wrap",
                        flexShrink: 0,
                    }}
                >
                    {colors.map((color, index) => {
                        const isActive = activeColorLocal ? activeColorLocal.code === color.code : index === 0
                        return (
                            <motion.div
                                key={index}
                                onClick={() => handleColorClick(color)}
                                title={color.kr}
                                whileTap={color.isSoldOut ? {} : { scale: 0.88 }}
                                style={{
                                    position: "relative",
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "50%",
                                    backgroundColor: color.code || "#E5E7EB",
                                    cursor: color.isSoldOut ? "not-allowed" : "pointer",
                                    boxShadow: isActive
                                        ? "0 0 0 2.5px #ffffff, 0 0 0 5px #0055FF"
                                        : "0 0 0 1.5px rgba(0,0,0,0.12)",
                                    opacity: color.isSoldOut ? 0.4 : 1,
                                    transition: "box-shadow 0.18s ease",
                                    flexShrink: 0,
                                }}
                            >
                                {color.isSoldOut && <SoldOutOverlay />}
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

addPropertyControls(ProductImageCarousel, {
    isLoading: {
        type: ControlType.Boolean,
        title: "Loading",
        defaultValue: false,
    },
    imageHeight: {
        type: ControlType.Number,
        title: "Image Height",
        defaultValue: 240,
        min: 120,
        max: 600,
        step: 8,
    },
    urls: {
        type: ControlType.Array,
        title: "Image URLs",
        control: { type: ControlType.String },
        defaultValue: [
            "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
        ],
    },
    colors: {
        type: ControlType.Array,
        title: "Colors",
        defaultValue: [
            { kr: "블랙", code: "#1C1C1E", isSoldOut: false },
            { kr: "화이트", code: "#F5F5F7", isSoldOut: false },
            { kr: "블루", code: "#0055FF", isSoldOut: false },
        ],
        propertyControl: {
            type: ControlType.Object,
            controls: {
                kr: { type: ControlType.String, title: "한국어" },
                code: { type: ControlType.Color, title: "Color" },
                isSoldOut: { type: ControlType.Boolean, title: "품절", defaultValue: false },
            },
        },
    },
})
