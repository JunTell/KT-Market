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
            <SkeletonBox width="140px" height="18px" style={{ marginBottom: "10px" }} />
            <div style={{ display: "flex", gap: "8px" }}>
                <SkeletonBox width="80px" height="13px" />
                <SkeletonBox width="80px" height="13px" />
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
            flexShrink: 0,
        }}>
            {processed ? "처리완료" : "처리중"}
        </span>
    )
}

function formatDate(d: string | null) {
    if (!d) return "-"
    const dt = new Date(d)
    return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, "0")}.${String(dt.getDate()).padStart(2, "0")}`
}

function InfoRow({ items }: { items: { label: string; value: string | null }[] }) {
    return (
        <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "4px 16px", marginTop: "8px" }}>
            {items.filter(i => i.value).map(({ label, value }) => (
                <span key={label} style={{ fontSize: "13px", color: T.colors.muted, fontFamily: T.font }}>
                    {label} <strong style={{ color: T.colors.text }}>{value}</strong>
                </span>
            ))}
        </div>
    )
}

function EmptyState({ message }: { message: string }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: "12px" }}>
            <span style={{ fontSize: "40px" }}>📭</span>
            <p style={{ margin: 0, fontSize: "15px", color: T.colors.muted, fontFamily: T.font, textAlign: "center" as const }}>{message}</p>
        </div>
    )
}

// ─── 더미 데이터 (캔버스 미리보기) ───────────────────
const DUMMY: any[] = [
    { no: 1, datetime: "2025-03-20T10:00:00+09:00", petName: "갤럭시 S25 울트라", model: "SM-S928N", plan: "5G 프리미어 에센셜", register: "번호이동", discount: "공시지원금", installment: "24", is_processed: false, carrier: "KT", source: "online" },
    { no: 2, datetime: "2025-02-14T14:30:00+09:00", petName: "아이폰 16 Pro", model: "MQUA3KH/A", plan: "5G 슬림 플러스", register: "기기변경", discount: "선택약정", installment: "36", is_processed: true, carrier: "KT", source: "iphone17" },
]

function OrderHistory({ onBack }: any) {
    const isCanvas = RenderTarget.current() === RenderTarget.canvas
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState<any[]>([])
    const [authed, setAuthed] = useState(false)

    useEffect(() => {
        if (isCanvas) return
        checkAuth().finally(async () => {
            if (!userState.isLoggedIn) { setLoading(false); return }
            setAuthed(true)
            try {
                const res = await fetch(`${API_BASE}/api/my/orders`, { credentials: "include" })
                const data = await res.json()
                setOrders(Array.isArray(data) ? data : [])
            } catch { setOrders([]) }
            finally { setLoading(false) }
        })
    }, [])

    const displayOrders = isCanvas ? DUMMY : orders
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
                <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: T.colors.text, fontFamily: T.font }}>주문 내역</h1>
            </div>

            <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {displayLoading ? (
                    <>{[0, 1, 2].map(i => <SkeletonCard key={i} />)}</>
                ) : !displayAuthed ? (
                    <EmptyState message={"로그인 후 이용해주세요"} />
                ) : displayOrders.length === 0 ? (
                    <EmptyState message={"주문 내역이 없습니다"} />
                ) : (
                    <AnimatePresence>
                        {displayOrders.map((order, idx) => (
                            <motion.div
                                key={`${order.source}-${order.no}`}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.04 }}
                                style={{ backgroundColor: T.colors.bg, border: `1px solid ${T.colors.border}`, borderRadius: T.radius.lg, padding: "16px" }}
                            >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                                    <StatusBadge processed={order.is_processed} />
                                    <span style={{ fontSize: "12px", color: T.colors.muted, fontFamily: T.font }}>{formatDate(order.datetime)}</span>
                                </div>
                                <p style={{ margin: "0 0 4px", fontSize: "16px", fontWeight: 700, color: T.colors.text, fontFamily: T.font }}>
                                    {order.petName ?? order.device ?? order.model ?? "-"}
                                </p>
                                <InfoRow items={[
                                    { label: "등록", value: order.register },
                                    { label: "요금제", value: order.plan },
                                    { label: "할인", value: order.discount },
                                    { label: "할부", value: order.installment ? `${order.installment}개월` : null },
                                    { label: "통신사", value: order.carrier },
                                ]} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    )
}

export default OrderHistory
addPropertyControls(OrderHistory, {
    onBack: { type: ControlType.EventHandler },
})
