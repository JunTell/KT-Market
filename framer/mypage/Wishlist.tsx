import * as React from "react"
import { useEffect, useState } from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { motion, AnimatePresence } from "framer-motion"
import {
    checkAuth,
    userState,
} from "https://framer.com/m/AuthStore-jiikDX.js@QRzzhL7x0LkccW6oL0Cw"

const API_BASE = "https://kt-market-puce.vercel.app"

const T = {
    colors: {
        primary: "#0055FF",
        bg: "#FFFFFF",
        surface: "#F9FAFB",
        border: "#F0F0F0",
        text: "#111827",
        muted: "#9CA3AF",
        danger: "#EF4444",
        skeleton: "#E5E7EB",
    },
    font: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
    radius: { sm: "8px", md: "12px", lg: "16px", xl: "20px", full: "9999px" },
}

const SKELETON_CSS = `@keyframes skeletonPulse { 0%,100%{opacity:.45} 50%{opacity:.9} }`
const skeletonAnim: React.CSSProperties = {
    animationName: "skeletonPulse",
    animationDuration: "1.5s",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
}

function SkeletonBox({ width = "100%", height = "16px", radius = "6px", style }: {
    width?: string | number; height?: string | number; radius?: string; style?: React.CSSProperties
}) {
    return <div style={{ width, height, backgroundColor: T.colors.skeleton, borderRadius: radius, flexShrink: 0, ...skeletonAnim, ...style }} />
}

function SkeletonCard() {
    return (
        <div style={{ backgroundColor: T.colors.bg, border: `1px solid ${T.colors.border}`, borderRadius: T.radius.lg, padding: "16px", display: "flex", gap: "14px", alignItems: "center" }}>
            <SkeletonBox width="72px" height="72px" radius={T.radius.md} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                <SkeletonBox width="120px" height="16px" />
                <SkeletonBox width="80px" height="14px" />
                <SkeletonBox width="60px" height="12px" />
            </div>
            <SkeletonBox width="32px" height="32px" radius="50%" />
        </div>
    )
}

function TrashIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 4h12M5.333 4V2.667h5.334V4M6.667 7.333v4M9.333 7.333v4M3.333 4l.667 9.333h8l.667-9.333" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

function formatDate(d: string | null) {
    if (!d) return ""
    const dt = new Date(d)
    return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`
}

function EmptyState() {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: "12px" }}>
            <span style={{ fontSize: "40px" }}>🤍</span>
            <p style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: T.colors.text, fontFamily: T.font }}>찜한 상품이 없습니다</p>
            <p style={{ margin: 0, fontSize: "13px", color: T.colors.muted, fontFamily: T.font, textAlign: "center" as const }}>마음에 드는 기기를 찜해보세요</p>
        </div>
    )
}

const DUMMY: any[] = [
    { id: "w1", device_model: "SM-S928N", pet_name: "갤럭시 S25 울트라", thumbnail: null, price: 1899000, category_kr: "스마트폰", created_at: "2025-03-20T10:00:00+09:00" },
    { id: "w2", device_model: "MXVY3KH/A", pet_name: "아이폰 16 Pro Max", thumbnail: null, price: 1799000, category_kr: "스마트폰", created_at: "2025-03-15T12:00:00+09:00" },
    { id: "w3", device_model: "SM-F956N", pet_name: "갤럭시 Z 폴드6", thumbnail: null, price: 2119000, category_kr: "폴더블", created_at: "2025-03-10T09:00:00+09:00" },
]

function Wishlist({ onBack, onDeviceClick, deviceBaseUrl = "https://ktmarket.co.kr/product" }: any) {
    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState<any[]>([])
    const [authed, setAuthed] = useState(false)
    const [removingId, setRemovingId] = useState<string | null>(null)

    useEffect(() => {
        if (isCanvas) return
        checkAuth().finally(async () => {
            if (!userState.isLoggedIn) { setLoading(false); return }
            setAuthed(true)
            try {
                const res = await fetch(`${API_BASE}/api/my/wishlist`, { credentials: "include" })
                const data = await res.json()
                setItems(Array.isArray(data) ? data : [])
            } catch { setItems([]) }
            finally { setLoading(false) }
        })
    }, [])

    const handleRemove = async (id: string) => {
        if (isCanvas) return
        setRemovingId(id)
        try {
            const res = await fetch(`${API_BASE}/api/my/wishlist?id=${id}`, {
                method: "DELETE",
                credentials: "include",
            })
            if (res.ok) setItems(prev => prev.filter(i => i.id !== id))
        } catch { /* silent */ }
        finally { setRemovingId(null) }
    }

    const displayItems = isCanvas ? DUMMY : items
    const displayLoading = isCanvas ? false : loading
    const displayAuthed = isCanvas ? true : authed

    return (
        <div style={{ width: "100%", maxWidth: "480px", margin: "0 auto", backgroundColor: T.colors.bg, fontFamily: T.font, minHeight: "100vh", boxSizing: "border-box" }}>
            <style>{SKELETON_CSS}</style>

            {/* 헤더 */}
            <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${T.colors.border}`, position: "sticky", top: 0, backgroundColor: T.colors.bg, zIndex: 10 }}>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => onBack?.()} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", marginRight: "8px", display: "flex", alignItems: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke={T.colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </motion.button>
                <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: T.colors.text, fontFamily: T.font }}>찜한 상품</h1>
                {displayItems.length > 0 && (
                    <span style={{ marginLeft: "6px", fontSize: "15px", fontWeight: 700, color: T.colors.primary }}>{displayItems.length}</span>
                )}
            </div>

            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {displayLoading ? (
                    <>{[0, 1, 2].map(i => <SkeletonCard key={i} />)}</>
                ) : !displayAuthed ? (
                    <EmptyState />
                ) : displayItems.length === 0 ? (
                    <EmptyState />
                ) : (
                    <AnimatePresence>
                        {displayItems.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ delay: idx * 0.04 }}
                                style={{ backgroundColor: T.colors.bg, border: `1px solid ${T.colors.border}`, borderRadius: T.radius.lg, padding: "16px", display: "flex", alignItems: "center", gap: "14px" }}
                            >
                                {/* 썸네일 */}
                                <motion.div
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        if (!isCanvas) window.location.href = `${deviceBaseUrl}/${item.device_model}`
                                        onDeviceClick?.()
                                    }}
                                    style={{ cursor: "pointer", flexShrink: 0, width: "72px", height: "72px", borderRadius: T.radius.md, backgroundColor: T.colors.surface, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
                                >
                                    {item.thumbnail ? (
                                        <img src={item.thumbnail} alt={item.pet_name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                                    ) : (
                                        <span style={{ fontSize: "28px" }}>📱</span>
                                    )}
                                </motion.div>

                                {/* 정보 */}
                                <motion.div
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => {
                                        if (!isCanvas) window.location.href = `${deviceBaseUrl}/${item.device_model}`
                                        onDeviceClick?.()
                                    }}
                                    style={{ flex: 1, minWidth: 0, cursor: "pointer" }}
                                >
                                    {item.category_kr && (
                                        <p style={{ margin: "0 0 2px", fontSize: "11px", color: T.colors.muted, fontFamily: T.font }}>{item.category_kr}</p>
                                    )}
                                    <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: T.colors.text, fontFamily: T.font,
                                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>
                                        {item.pet_name}
                                    </p>
                                    {item.price !== null && (
                                        <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 600, color: T.colors.primary, fontFamily: T.font }}>
                                            {item.price.toLocaleString()}원~
                                        </p>
                                    )}
                                    <p style={{ margin: 0, fontSize: "11px", color: T.colors.muted, fontFamily: T.font }}>{formatDate(item.created_at)} 저장</p>
                                </motion.div>

                                {/* 삭제 버튼 */}
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleRemove(item.id)}
                                    disabled={removingId === item.id}
                                    style={{
                                        flexShrink: 0, width: "36px", height: "36px",
                                        borderRadius: "50%", border: `1px solid ${T.colors.border}`,
                                        backgroundColor: removingId === item.id ? "#FEE2E2" : T.colors.bg,
                                        cursor: removingId === item.id ? "not-allowed" : "pointer",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: T.colors.danger,
                                    }}
                                >
                                    <TrashIcon />
                                </motion.button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}

export default Wishlist
addPropertyControls(Wishlist, {
    onBack: { type: ControlType.EventHandler },
    onDeviceClick: { type: ControlType.EventHandler },
    deviceBaseUrl: {
        type: ControlType.String,
        defaultValue: "https://ktmarket.co.kr/product",
        title: "기기 상세 URL 기본경로",
    },
})
