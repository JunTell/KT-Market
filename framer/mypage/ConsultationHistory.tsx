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
        skeleton: "#E5E7EB",
        success: "#D1FAE5",
        successText: "#065F46",
        warning: "#FEF3C7",
        warningText: "#92400E",
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
        <div style={{ backgroundColor: T.colors.bg, border: `1px solid ${T.colors.border}`, borderRadius: T.radius.lg, padding: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                <SkeletonBox width="60px" height="20px" radius={T.radius.full} />
                <SkeletonBox width="80px" height="14px" />
            </div>
            <SkeletonBox width="100%" height="14px" style={{ marginBottom: "6px" }} />
            <SkeletonBox width="70%" height="14px" style={{ marginBottom: "10px" }} />
            <SkeletonBox width="80px" height="13px" />
        </div>
    )
}

function StatusBadge({ processed }: { processed: boolean }) {
    return (
        <span style={{
            padding: "3px 10px", borderRadius: T.radius.full, fontSize: "11px", fontWeight: 700,
            backgroundColor: processed ? T.colors.success : T.colors.warning,
            color: processed ? T.colors.successText : T.colors.warningText,
        }}>
            {processed ? "처리완료" : "접수중"}
        </span>
    )
}

function formatDate(d: string | null) {
    if (!d) return "-"
    const dt = new Date(d)
    return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`
}

function EmptyState({ message }: { message: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: "12px" }}>
            <span style={{ fontSize: "40px" }}>📭</span>
            <p style={{ margin: 0, fontSize: "15px", color: T.colors.muted, fontFamily: T.font, textAlign: "center" as const }}>{message}</p>
        </div>
    )
}

const DUMMY: any[] = [
    { id: 1, created_at: "2025-03-15T11:00:00+09:00", description: "번호이동 관련 문의드립니다. 현재 LG U+ 사용 중인데 KT로 이동하고 싶어요.", mobile_carrier: "LG U+", is_processed: false },
    { id: 2, created_at: "2025-02-20T09:30:00+09:00", description: "아이폰 16 Pro 재고 문의입니다.", mobile_carrier: "SKT", is_processed: true },
]

function ConsultationHistory({ onBack }: any) {
    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState<any[]>([])
    const [authed, setAuthed] = useState(false)

    useEffect(() => {
        if (isCanvas) return
        checkAuth().finally(async () => {
            if (!userState.isLoggedIn) { setLoading(false); return }
            setAuthed(true)
            try {
                const res = await fetch(`${API_BASE}/api/my/consultations`, { credentials: "include" })
                const data = await res.json()
                setItems(Array.isArray(data) ? data : [])
            } catch { setItems([]) }
            finally { setLoading(false) }
        })
    }, [])

    const displayItems = isCanvas ? DUMMY : items
    const displayLoading = isCanvas ? false : loading
    const displayAuthed = isCanvas ? true : authed

    return (
        <div style={{ width: "100%", maxWidth: "480px", margin: "0 auto", backgroundColor: T.colors.bg, fontFamily: T.font, minHeight: "100vh", boxSizing: "border-box" }}>
            <style>{SKELETON_CSS}</style>

            <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${T.colors.border}`, position: "sticky", top: 0, backgroundColor: T.colors.bg, zIndex: 10 }}>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => onBack?.()} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", marginRight: "8px", display: "flex", alignItems: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18l-6-6 6-6" stroke={T.colors.text} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </motion.button>
                <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: T.colors.text, fontFamily: T.font }}>상담 접수 내역</h1>
            </div>

            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {displayLoading ? (
                    <>{[0, 1, 2].map(i => <SkeletonCard key={i} />)}</>
                ) : !displayAuthed ? (
                    <EmptyState message="로그인 후 이용해주세요" />
                ) : displayItems.length === 0 ? (
                    <EmptyState message="상담 접수 내역이 없습니다" />
                ) : (
                    <AnimatePresence>
                        {displayItems.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                style={{ backgroundColor: T.colors.bg, border: `1px solid ${T.colors.border}`, borderRadius: T.radius.lg, padding: "16px" }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                    <StatusBadge processed={item.is_processed} />
                                    <span style={{ fontSize: "12px", color: T.colors.muted }}>{formatDate(item.created_at)}</span>
                                </div>
                                {item.description && (
                                    <p style={{ margin: "0 0 8px", fontSize: "14px", color: T.colors.text, lineHeight: 1.6, fontFamily: T.font,
                                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>
                                        {item.description}
                                    </p>
                                )}
                                {item.mobile_carrier && (
                                    <span style={{ fontSize: "13px", color: T.colors.muted }}>
                                        현재 통신사 <strong style={{ color: T.colors.text }}>{item.mobile_carrier}</strong>
                                    </span>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}

export default ConsultationHistory
addPropertyControls(ConsultationHistory, {
    onBack: { type: ControlType.EventHandler },
})
