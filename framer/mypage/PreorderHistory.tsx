import { addPropertyControls, RenderTarget } from "framer"
import { motion, AnimatePresence } from "framer-motion"
import {
    checkAuth,
    userState,
} from "https://framer.com/m/AuthStore-jiikDX.js"
import * as React from "react"
import { useEffect, useState } from "react"

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
            <SkeletonBox width="130px" height="18px" style={{ marginBottom: "10px" }} />
            <div style={{ display: "flex", gap: "8px" }}>
                <SkeletonBox width="60px" height="13px" />
                <SkeletonBox width="60px" height="13px" />
                <SkeletonBox width="70px" height="13px" />
            </div>
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

function SourceBadge({ source }: { source: string }) {
    return (
        <span style={{
            padding: "3px 10px", borderRadius: T.radius.full, fontSize: "11px", fontWeight: 600,
            backgroundColor: T.colors.surface, color: T.colors.muted, border: `1px solid ${T.colors.border}`,
        }}>
            {source}
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
    { id: "1", datetime: "2025-03-10T10:00:00+09:00", device: "갤럭시 S26 울트라", model: "SM-S938N", color: "티타늄 블랙", capacity: "256GB", carrier: "KT", is_processed: false, source: "S26" },
    { id: "2", datetime: "2025-01-20T14:00:00+09:00", device: "iPhone 17e", model: "iPhone 17e", color: null, capacity: null, carrier: "SKT", is_processed: true, source: "iPhone 17e" },
]

function PreorderHistory() {
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
                const res = await fetch(`${API_BASE}/api/my/preorders`, { credentials: "include" })
                const data = await res.json()
                setItems(Array.isArray(data) ? data : [])
            } catch { setItems([]) }
            finally { setLoading(false) }
        })
    }, [isCanvas])

    const displayItems = isCanvas ? DUMMY : items
    const displayLoading = isCanvas ? false : loading
    const displayAuthed = isCanvas ? true : authed

    return (
        <div style={{ width: "100%", maxWidth: "480px", margin: "0 auto", backgroundColor: T.colors.bg, fontFamily: T.font, minHeight: "100vh", boxSizing: "border-box" }}>
            <style>{SKELETON_CSS}</style>

            <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${T.colors.border}`, position: "sticky", top: 0, backgroundColor: T.colors.bg, zIndex: 10 }}>
                <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: T.colors.text, fontFamily: T.font }}>사전예약 내역</h1>
            </div>

            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {displayLoading ? (
                    <>{[0, 1, 2].map(i => <SkeletonCard key={i} />)}</>
                ) : !displayAuthed ? (
                    <EmptyState message="로그인 후 이용해주세요" />
                ) : displayItems.length === 0 ? (
                    <EmptyState message="사전예약 내역이 없습니다" />
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
                                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                        <StatusBadge processed={item.is_processed} />
                                        <SourceBadge source={item.source} />
                                    </div>
                                    <span style={{ fontSize: "12px", color: T.colors.muted }}>{formatDate(item.datetime)}</span>
                                </div>
                                <p style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 700, color: T.colors.text }}>
                                    {item.device ?? item.model ?? "-"}
                                </p>
                                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "4px 14px" }}>
                                    {item.color && <span style={{ fontSize: "13px", color: T.colors.muted }}>색상 <strong style={{ color: T.colors.text }}>{item.color}</strong></span>}
                                    {item.capacity && <span style={{ fontSize: "13px", color: T.colors.muted }}>용량 <strong style={{ color: T.colors.text }}>{item.capacity}</strong></span>}
                                    {item.carrier && <span style={{ fontSize: "13px", color: T.colors.muted }}>통신사 <strong style={{ color: T.colors.text }}>{item.carrier}</strong></span>}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}

export default PreorderHistory
addPropertyControls(PreorderHistory, {})
