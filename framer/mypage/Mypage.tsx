import { addPropertyControls, ControlType, RenderTarget } from "framer"
import { motion, AnimatePresence } from "framer-motion"
import {
    checkAuth,
    loginWithKakao,
    logout,
    userState,
    withdraw,
} from "https://framer.com/m/AuthStore-jiikDX.js@QRzzhL7x0LkccW6oL0Cw"
import * as React from "react"
import { useEffect, useState } from "react"

const API_BASE = "https://kt-market-puce.vercel.app"

function maskPhone(phone: string | null | undefined): string | null {
    if (!phone) return null
    return phone.replace(/^(\d{3})\d{4}(\d{4})$/, "$1-****-$2")
}

// ─── 디자인 토큰 ──────────────────────────────────────
const T = {
    colors: {
        primary: "#0055FF",
        bg: "#FFFFFF",
        surface: "#F9FAFB",
        border: "#F0F0F0",
        text: "#111827",
        muted: "#9CA3AF",
        danger: "#EF4444",
        kakao: "#FEE500",
        kakaoText: "#191919",
        skeleton: "#E5E7EB",
    },
    font: "'Pretendard', 'Apple SD Gothic Neo', sans-serif",
    radius: { sm: "8px", md: "12px", lg: "16px", xl: "20px", full: "9999px" },
}

// ─── Skeleton keyframes (한 번만 주입) ────────────────
const SKELETON_CSS = `
      @keyframes skeletonPulse {
          0%, 100% { opacity: 0.45; }
          50%       { opacity: 0.9;  }
      }
  `
const skeletonAnim: React.CSSProperties = {
    animationName: "skeletonPulse",
    animationDuration: "1.5s",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
}

// ─── SkeletonBox ──────────────────────────────────────
function SkeletonBox({
    width = "100%",
    height = "16px",
    radius = "6px",
    style,
}: {
    width?: string | number
    height?: string | number
    radius?: string
    style?: React.CSSProperties
}) {
    return (
        <div
            style={{
                width,
                height,
                backgroundColor: T.colors.skeleton,
                borderRadius: radius,
                flexShrink: 0,
                ...skeletonAnim,
                ...style,
            }}
        />
    )
}

// ─── Skeleton: 프로필 카드 ─────────────────────────────
function SkeletonProfileCard() {
    return (
        <div
            style={{
                backgroundColor: T.colors.surface,
                borderRadius: T.radius.xl,
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                gap: "14px",
            }}
        >
            <SkeletonBox width="48px" height="48px" radius="50%" />
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                }}
            >
                <SkeletonBox width="90px" height="16px" />
                <SkeletonBox width="130px" height="13px" />
                <div style={{ display: "flex", gap: "12px", marginTop: "2px" }}>
                    <SkeletonBox width="48px" height="12px" />
                    <SkeletonBox width="72px" height="12px" />
                </div>
            </div>
            <SkeletonBox width="46px" height="24px" radius={T.radius.full} />
        </div>
    )
}

// ─── Skeleton: 메뉴 아이템 ─────────────────────────────
function SkeletonMenuItem() {
    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                padding: "15px 4px",
                borderBottom: `1px solid ${T.colors.border}`,
                gap: "14px",
            }}
        >
            <SkeletonBox width="26px" height="26px" radius="6px" />
            <SkeletonBox height="15px" style={{ flex: 1, maxWidth: "140px" }} />
        </div>
    )
}

// ─── Skeleton: 전체 메뉴 섹션 (초기 로딩용) ────────────
function SkeletonMenuSection() {
    return (
        <div style={{ marginTop: "8px" }}>
            {/* 섹션 라벨 */}
            <SkeletonBox
                width="56px"
                height="12px"
                style={{ margin: "22px 0 10px" }}
            />
            {[0, 1, 2, 3, 4, 5].map((i) => (
                <SkeletonMenuItem key={i} />
            ))}
            <SkeletonBox
                width="56px"
                height="12px"
                style={{ margin: "22px 0 10px" }}
            />
            {[0, 1].map((i) => (
                <SkeletonMenuItem key={i} />
            ))}
        </div>
    )
}

// ─── 아이콘 ───────────────────────────────────────────
function ChevronRight() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
                d="M6 3l5 5-5 5"
                stroke="#D1D5DB"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function KakaoIcon() {
    return (
        <svg width="20" height="20" viewBox="0 0 18 18" fill="none">
            <path
                d="M9 2C4.029 2 0 5.143 0 9.018C0 11.523 1.636 13.725 4.092 14.996C3.905 15.659 3.23 18.067 3.205 18.158C3.197 18.23
   3.244 18.26 3.29 18.291C3.36 18.281 3.36 18.281 3.36 18.281C3.473 18.266 6.354 16.327 7.202 15.748C7.778 15.845 8.38 15.901 9
  15.901C13.971 15.901 18 12.758 18 8.883C18 5.008 13.971 2 9 2Z"
                fill="#191919"
            />
        </svg>
    )
}

// ─── 퀵메뉴 아이콘 ────────────────────────────────────
const QUICK_ICONS: Record<string, React.ReactNode> = {
    event: (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <rect
                x="3"
                y="7"
                width="20"
                height="16"
                rx="2"
                stroke="#111827"
                strokeWidth="1.5"
            />
            <path
                d="M8 7V4M18 7V4"
                stroke="#111827"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path d="M3 12h20" stroke="#111827" strokeWidth="1.5" />
            <path
                d="M8 17h4M8 21h6"
                stroke="#111827"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    ),
    internet: (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <circle cx="13" cy="13" r="10" stroke="#111827" strokeWidth="1.5" />
            <path
                d="M13 3c0 0-4 4-4 10s4 10 4 10"
                stroke="#111827"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M13 3c0 0 4 4 4 10s-4 10-4 10"
                stroke="#111827"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M3 13h20"
                stroke="#111827"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    ),
    cs: (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path
                d="M4 14v-3a9 9 0 0118 0v3"
                stroke="#111827"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <rect
                x="3"
                y="13"
                width="4"
                height="6"
                rx="2"
                stroke="#111827"
                strokeWidth="1.5"
            />
            <rect
                x="19"
                y="13"
                width="4"
                height="6"
                rx="2"
                stroke="#111827"
                strokeWidth="1.5"
            />
            <path
                d="M22 19c0 2-1.5 4-5 4"
                stroke="#111827"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    ),
    notice: (
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path
                d="M13 3L16 9l7 1-5 5 1.5 7L13 19l-6.5 3L8 15 3 10l7-1z"
                stroke="#111827"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
        </svg>
    ),
}

const QUICK_MENU = [
    { key: "event", label: "이벤트", href: "https://ktmarket.co.kr/event" },
    {
        key: "internet",
        label: "인터넷",
        href: "https://ktmarket.co.kr/internet/product",
    },
    { key: "cs", label: "고객센터", href: "http://pf.kakao.com/_HfItxj/chat" },
    { key: "notice", label: "공지", href: "https://ktmarket.co.kr/notice" },
]

// ─── CountBadge ───────────────────────────────────────
function CountBadge({ count, loading }: { count: number; loading?: boolean }) {
    if (loading) {
        return (
            <SkeletonBox
                width="28px"
                height="20px"
                radius={T.radius.full}
                style={{ marginRight: "4px" }}
            />
        )
    }
    if (count === 0) return null
    return (
        <span
            style={{
                backgroundColor: T.colors.primary,
                color: "#fff",
                borderRadius: T.radius.full,
                fontSize: "11px",
                fontWeight: 700,
                padding: "2px 8px",
                minWidth: "20px",
                textAlign: "center" as const,
                marginRight: "4px",
                flexShrink: 0,
            }}
        >
            {count > 99 ? "99+" : count}
        </span>
    )
}

// ─── MenuItem ─────────────────────────────────────────
function MenuItem({
    emoji,
    label,
    onClick,
    danger = false,
    count,
    countLoading,
}: {
    emoji: string
    label: string
    onClick?: () => void
    danger?: boolean
    count?: number
    countLoading?: boolean
}) {
    return (
        <motion.div
            whileTap={{ backgroundColor: "#F9FAFB" }}
            onClick={onClick}
            style={{
                display: "flex",
                alignItems: "center",
                padding: "15px 4px",
                cursor: "pointer",
                borderBottom: `1px solid ${T.colors.border}`,
                gap: "14px",
                borderRadius: "4px",
            }}
        >
            <span
                style={{
                    fontSize: "20px",
                    width: "26px",
                    textAlign: "center" as const,
                    flexShrink: 0,
                }}
            >
                {emoji}
            </span>
            <span
                style={{
                    flex: 1,
                    fontSize: "15px",
                    fontWeight: 500,
                    color: danger ? T.colors.danger : T.colors.text,
                    fontFamily: T.font,
                    lineHeight: 1.4,
                }}
            >
                {label}
            </span>
            {count !== undefined && (
                <CountBadge count={count} loading={countLoading} />
            )}
            <ChevronRight />
        </motion.div>
    )
}

function SectionLabel({ text }: { text: string }) {
    return (
        <p
            style={{
                margin: "22px 0 2px",
                fontSize: "12px",
                fontWeight: 600,
                color: T.colors.muted,
                fontFamily: T.font,
                letterSpacing: "0.04em",
                textTransform: "uppercase" as const,
            }}
        >
            {text}
        </p>
    )
}

// ─── 최근 본 기기 카드 ─────────────────────────────────
function ViewedDeviceCard({
    item,
    onClick,
}: {
    item: {
        device_model: string
        pet_name: string
        thumbnail: string | null
        price: number | null
    }
    onClick: () => void
}) {
    return (
        <motion.div
            whileTap={{ scale: 0.96 }}
            onClick={onClick}
            style={{
                flexShrink: 0,
                width: "100px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                padding: "10px 8px",
                borderRadius: T.radius.md,
                border: `1px solid ${T.colors.border}`,
                backgroundColor: T.colors.bg,
            }}
        >
            {item.thumbnail ? (
                <img
                    src={item.thumbnail}
                    alt={item.pet_name}
                    style={{
                        width: "56px",
                        height: "56px",
                        objectFit: "contain",
                    }}
                />
            ) : (
                <div
                    style={{
                        width: "56px",
                        height: "56px",
                        backgroundColor: T.colors.surface,
                        borderRadius: T.radius.sm,
                    }}
                />
            )}
            <p
                style={{
                    margin: 0,
                    fontSize: "11px",
                    fontWeight: 600,
                    color: T.colors.text,
                    fontFamily: T.font,
                    textAlign: "center" as const,
                    lineHeight: 1.3,
                    wordBreak: "keep-all" as const,
                }}
            >
                {item.pet_name}
            </p>
            {item.price !== null && (
                <p
                    style={{
                        margin: 0,
                        fontSize: "11px",
                        color: T.colors.muted,
                        fontFamily: T.font,
                    }}
                >
                    {item.price.toLocaleString()}원~
                </p>
            )}
        </motion.div>
    )
}

// ─── 기본 summary ─────────────────────────────────────
const DEFAULT_SUMMARY = {
    wishlistCount: 0,
    viewedCount: 0,
    orderCount: 0,
    consultCount: 0,
    preorderCount: 0,
    restockCount: 0,
    referralCount: 0,
}

const go = (url: string) => () => {
    window.location.href = url
}

// ─── 메인 컴포넌트 ────────────────────────────────────
function MyPage({
    onOrderClick,
    onConsultClick,
    onPreorderClick,
    onRestockClick,
    onReferralClick,
    onWishlistClick,
    onLogoutClick,
    onWithdrawClick,
    loginPageUrl = "/login",
    deviceBaseUrl = "https://ktmarket.co.kr/product",
}: any) {
    const isCanvas = RenderTarget.current() === RenderTarget.canvas

    const [withdrawOpen, setWithdrawOpen] = useState(false)
    const [withdrawing, setWithdrawing] = useState(false)
    const [summaryLoading, setSummaryLoading] = useState(false)

    const [authState, setAuthState] = useState({
        isLoggedIn: false,
        isLoading: true, // 초기 auth 확인 중
        fullName: null as string | null,
        phoneNumber: null as string | null,
        avatarUrl: null as string | null,
    })

    const [summary, setSummary] = useState(DEFAULT_SUMMARY)
    const [viewedDevices, setViewedDevices] = useState<any[]>([])

    useEffect(() => {
        if (isCanvas) return

        const urlParams = new URLSearchParams(window.location.search)
        if (urlParams.has("login_error")) {
            window.history.replaceState(
                null,
                document.title,
                window.location.pathname
            )
            setAuthState((s) => ({ ...s, isLoading: false }))
            return
        }

        checkAuth().finally(() => {
            const loggedIn = userState.isLoggedIn ?? false
            setAuthState({
                isLoggedIn: loggedIn,
                isLoading: false,
                fullName: userState.fullName ?? null,
                phoneNumber: userState.phoneNumber ?? null,
                avatarUrl: userState.avatarUrl ?? null,
            })

            if (loggedIn) {
                setSummaryLoading(true)
                Promise.all([
                    fetch(`${API_BASE}/api/my/summary`, {
                        credentials: "include",
                    })
                        .then((r) => (r.ok ? r.json() : null))
                        .catch(() => null),
                    fetch(`${API_BASE}/api/my/viewed?limit=6`, {
                        credentials: "include",
                    })
                        .then((r) => (r.ok ? r.json() : null))
                        .catch(() => null),
                ])
                    .then(([summaryData, viewedData]) => {
                        if (summaryData) setSummary(summaryData)
                        if (Array.isArray(viewedData))
                            setViewedDevices(viewedData)
                    })
                    .finally(() => setSummaryLoading(false))
            }
        })
    }, [isCanvas])

    const handleLogout = async () => {
        if (isCanvas) {
            onLogoutClick?.()
            return
        }
        await logout()
        setAuthState({
            isLoggedIn: false,
            isLoading: false,
            fullName: null,
            phoneNumber: null,
            avatarUrl: null,
        })
        setSummary(DEFAULT_SUMMARY)
        setViewedDevices([])
        onLogoutClick?.()
    }

    const handleWithdraw = async () => {
        if (isCanvas) {
            setWithdrawOpen(false)
            return
        }
        setWithdrawing(true)
        try {
            await withdraw()
            setAuthState({
                isLoggedIn: false,
                isLoading: false,
                fullName: null,
                phoneNumber: null,
                avatarUrl: null,
            })
            setSummary(DEFAULT_SUMMARY)
            setViewedDevices([])
            onWithdrawClick?.()
        } catch {
            alert("회원탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.")
        } finally {
            setWithdrawing(false)
            setWithdrawOpen(false)
        }
    }

    // 캔버스 미리보기용 더미 데이터
    const isLoggedIn = isCanvas ? true : authState.isLoggedIn
    const isLoading = isCanvas ? false : authState.isLoading
    const displayName = isCanvas ? "홍길동" : authState.fullName
    const displayPhone = isCanvas ? "010-****-5678" : maskPhone(authState.phoneNumber)
    const displayAvatar = isCanvas ? null : authState.avatarUrl

    const displaySummary = isCanvas
        ? {
            wishlistCount: 3,
            viewedCount: 4,
            orderCount: 2,
            consultCount: 1,
            preorderCount: 1,
            restockCount: 0,
            referralCount: 1,
        }
        : summary

    const displayViewed = isCanvas
        ? [
            {
                device_model: "SM-S928N",
                pet_name: "갤럭시 S25 울트라",
                thumbnail: null,
                price: 1899000,
            },
            {
                device_model: "SM-F956N",
                pet_name: "갤럭시 Z 폴드6",
                thumbnail: null,
                price: 2119000,
            },
            {
                device_model: "A3XFAPD3LH",
                pet_name: "아이폰 16 Pro",
                thumbnail: null,
                price: 1550000,
            },
        ]
        : viewedDevices

    const withAuth = (callback?: () => void) => () => {
        if (isCanvas) {
            callback?.()
            return
        }
        if (!authState.isLoggedIn) {
            window.location.href = loginPageUrl
            return
        }
        callback?.()
    }

    return (
        <div
            style={{
                width: "100%",
                maxWidth: "480px",
                margin: "0 auto",
                backgroundColor: T.colors.bg,
                fontFamily: T.font,
                minHeight: "100vh",
                position: "relative",
                boxSizing: "border-box",
            }}
        >
            {/* ── keyframes 주입 ── */}
            <style>{SKELETON_CSS}</style>

            {/* ── 인사 헤더 ── */}
            <div style={{ padding: "36px 20px 20px" }}>
                {isLoading ? (
                    // 헤더 스켈레톤
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "10px",
                        }}
                    >
                        <SkeletonBox width="160px" height="28px" radius="8px" />
                        <SkeletonBox width="110px" height="28px" radius="8px" />
                    </div>
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLoggedIn ? "in" : "out"}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <h1
                                style={{
                                    fontSize: "26px",
                                    fontWeight: 800,
                                    color: T.colors.text,
                                    margin: 0,
                                    lineHeight: 1.35,
                                    letterSpacing: "-0.03em",
                                }}
                            >
                                {isLoggedIn ? (
                                    <>
                                        {displayName ?? "회원"}님<br />
                                        안녕하세요 👋
                                    </>
                                ) : (
                                    <>고객님 안녕하세요</>
                                )}
                            </h1>
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            {/* ── 퀵메뉴 (항상 표시) ── */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    padding: "4px 8px 20px",
                }}
            >
                {QUICK_MENU.map(({ key, label, href }) => (
                    <motion.button
                        key={key}
                        whileTap={{
                            scale: 0.92,
                            backgroundColor: T.colors.surface,
                        }}
                        onClick={() => {
                            if (!isCanvas) window.location.href = href
                        }}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "14px 4px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "8px",
                            borderRadius: T.radius.md,
                        }}
                    >
                        {QUICK_ICONS[key]}
                        <span
                            style={{
                                fontSize: "12px",
                                fontWeight: 500,
                                color: T.colors.text,
                                fontFamily: T.font,
                            }}
                        >
                            {label}
                        </span>
                    </motion.button>
                ))}
            </div>

            {/* ── 컨텐츠 영역 ── */}
            <div
                style={{
                    padding: "0 20px 80px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                }}
            >
                {/* ── 초기 로딩: 프로필 카드 + 메뉴 스켈레톤 ── */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "12px",
                        }}
                    >
                        <SkeletonProfileCard />
                        <SkeletonMenuSection />
                    </motion.div>
                )}

                {/* ── 로딩 완료 후 실제 컨텐츠 ── */}
                {!isLoading && (
                    <>
                        {/* 비로그인 카드 */}
                        <AnimatePresence>
                            {!isLoggedIn && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    style={{
                                        border: `1.5px solid ${T.colors.border}`,
                                        borderRadius: T.radius.xl,
                                        padding: "22px 20px",
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: "16px",
                                        backgroundColor: T.colors.bg,
                                    }}
                                >
                                    <div>
                                        <p
                                            style={{
                                                margin: "0 0 5px",
                                                fontSize: "16px",
                                                fontWeight: 700,
                                                color: T.colors.text,
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            주문 내역 확인을 위해{" "}
                                            <span
                                                style={{
                                                    color: T.colors.primary,
                                                }}
                                            >
                                                로그인
                                            </span>{" "}
                                            해주세요
                                        </p>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: "13px",
                                                color: T.colors.muted,
                                            }}
                                        >
                                            카카오 로그인으로 간편하게
                                            시작하세요
                                        </p>
                                    </div>
                                    <motion.button
                                        whileHover={{
                                            backgroundColor: "#F4DC00",
                                        }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() =>
                                            !isCanvas && loginWithKakao()
                                        }
                                        style={{
                                            width: "100%",
                                            height: "52px",
                                            backgroundColor: T.colors.kakao,
                                            border: "none",
                                            borderRadius: T.radius.full,
                                            cursor: "pointer",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: "8px",
                                            fontSize: "15px",
                                            fontWeight: 700,
                                            color: T.colors.kakaoText,
                                            fontFamily: T.font,
                                        }}
                                    >
                                        <KakaoIcon />
                                        카카오로 시작하기
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 로그인 유저 카드 */}
                        <AnimatePresence>
                            {isLoggedIn && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    style={{
                                        backgroundColor: T.colors.surface,
                                        borderRadius: T.radius.xl,
                                        padding: "18px 20px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "14px",
                                    }}
                                >
                                    {displayAvatar ? (
                                        <img
                                            src={displayAvatar}
                                            alt=""
                                            style={{
                                                width: "48px",
                                                height: "48px",
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                                flexShrink: 0,
                                            }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                width: "48px",
                                                height: "48px",
                                                borderRadius: "50%",
                                                backgroundColor: T.colors.kakao,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "20px",
                                                fontWeight: 700,
                                                color: T.colors.kakaoText,
                                                flexShrink: 0,
                                            }}
                                        >
                                            {displayName?.charAt(0) ?? "K"}
                                        </div>
                                    )}
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: "15px",
                                                fontWeight: 700,
                                                color: T.colors.text,
                                            }}
                                        >
                                            {displayName ?? "회원"}
                                        </p>
                                        {displayPhone && (
                                            <p
                                                style={{
                                                    margin: "3px 0 0",
                                                    fontSize: "13px",
                                                    color: T.colors.muted,
                                                }}
                                            >
                                                {displayPhone}
                                            </p>
                                        )}
                                        {/* 찜 / 최근 본 요약 */}
                                        <div
                                            style={{
                                                display: "flex",
                                                gap: "12px",
                                                marginTop: "8px",
                                            }}
                                        >
                                            {summaryLoading ? (
                                                <>
                                                    <SkeletonBox
                                                        width="52px"
                                                        height="12px"
                                                    />
                                                    <SkeletonBox
                                                        width="72px"
                                                        height="12px"
                                                    />
                                                </>
                                            ) : (
                                                <>
                                                    <span
                                                        style={{
                                                            fontSize: "12px",
                                                            color: T.colors
                                                                .muted,
                                                            fontFamily: T.font,
                                                        }}
                                                    >
                                                        찜{" "}
                                                        <strong
                                                            style={{
                                                                color: T.colors
                                                                    .text,
                                                            }}
                                                        >
                                                            {
                                                                displaySummary.wishlistCount
                                                            }
                                                        </strong>
                                                    </span>
                                                    <span
                                                        style={{
                                                            fontSize: "12px",
                                                            color: T.colors
                                                                .muted,
                                                            fontFamily: T.font,
                                                        }}
                                                    >
                                                        최근 본 기기{" "}
                                                        <strong
                                                            style={{
                                                                color: T.colors
                                                                    .text,
                                                            }}
                                                        >
                                                            {
                                                                displaySummary.viewedCount
                                                            }
                                                        </strong>
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <span
                                        style={{
                                            padding: "4px 10px",
                                            backgroundColor: T.colors.kakao,
                                            borderRadius: T.radius.full,
                                            fontSize: "11px",
                                            fontWeight: 700,
                                            color: T.colors.kakaoText,
                                            flexShrink: 0,
                                        }}
                                    >
                                        카카오
                                    </span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* 최근 본 기기 섹션 */}
                        {isLoggedIn && !summaryLoading && displayViewed.length > 0 && (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key="viewed"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{
                                        opacity: 0,
                                    }}
                                >
                                    <SectionLabel text="최근 본 기기" />
                                    <div
                                        style={{
                                            display: "flex",
                                            gap: "8px",
                                            overflowX: "auto",
                                            paddingBottom: "4px",
                                            scrollbarWidth: "none",
                                        }}
                                    >
                                        {displayViewed.map((item) => (
                                            <ViewedDeviceCard
                                                key={item.device_model}
                                                item={item}
                                                onClick={() => {
                                                    if (!isCanvas)
                                                        window.location.href = `${deviceBaseUrl}/${item.device_model}`
                                                }}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        )}

                        {/* ── 메뉴 리스트 ── */}
                        <div style={{ marginTop: "8px" }}>
                            <SectionLabel text="내 활동" />
                            <MenuItem
                                emoji="📦"
                                label="주문 내역"
                                count={displaySummary.orderCount}
                                countLoading={summaryLoading}
                                onClick={go("https://ktmarket.co.kr/mypage/order-history")}
                            />
                            <MenuItem
                                emoji="🗂️ "
                                label="상담 접수 내역"
                                count={displaySummary.consultCount}
                                countLoading={summaryLoading}
                                onClick={go("https://ktmarket.co.kr/mypage/consultation-history")}
                            />
                            <MenuItem
                                emoji="🔔"
                                label="사전예약 내역"
                                count={displaySummary.preorderCount}
                                countLoading={summaryLoading}
                                onClick={go("https://ktmarket.co.kr/mypage/preorder-history")}
                            />
                            <MenuItem
                                emoji="📢"
                                label="재입고 알림 내역"
                                count={displaySummary.restockCount}
                                countLoading={summaryLoading}
                                onClick={go("https://ktmarket.co.kr/mypage/restock-history")}
                            />
                            <MenuItem
                                emoji="🎁"
                                label="지인 추천 내역"
                                count={displaySummary.referralCount}
                                countLoading={summaryLoading}
                                onClick={go("https://ktmarket.co.kr/mypage/referral-history")}
                            />
                            <MenuItem
                                emoji="❤️ "
                                label="찜한 상품"
                                count={displaySummary.wishlistCount}
                                countLoading={summaryLoading}
                                onClick={go("https://ktmarket.co.kr/mypage/wishlist")}
                            />

                            <SectionLabel text="서비스" />
                            <MenuItem
                                emoji="🌐"
                                label="인터넷 / TV 가입"
                                onClick={go(
                                    "https://ktmarket.co.kr/internet/product"
                                )}
                            />
                            <MenuItem
                                emoji="📋"
                                label="공지사항"
                                onClick={go("https://ktmarket.co.kr/notice")}
                            />

                            {(isLoggedIn || isCanvas) && (
                                <>
                                    <SectionLabel text="계정" />
                                    <MenuItem
                                        emoji="🚪"
                                        label="로그아웃"
                                        onClick={handleLogout}
                                    />
                                    <MenuItem
                                        emoji="🗑️ "
                                        label="회원탈퇴"
                                        danger
                                        onClick={() => setWithdrawOpen(true)}
                                    />
                                </>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* ── 회원탈퇴 바텀시트 ── */}
            <AnimatePresence>
                {withdrawOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setWithdrawOpen(false)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            backgroundColor: "rgba(0,0,0,0.45)",
                            zIndex: 9999,
                            display: "flex",
                            alignItems: "flex-end",
                            justifyContent: "center",
                        }}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{
                                type: "spring",
                                damping: 30,
                                stiffness: 340,
                            }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                width: "100%",
                                maxWidth: "480px",
                                backgroundColor: T.colors.bg,
                                borderRadius: "24px 24px 0 0",
                                padding: "32px 24px 48px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "24px",
                            }}
                        >
                            <div style={{ textAlign: "center" }}>
                                <div
                                    style={{
                                        fontSize: "40px",
                                        marginBottom: "14px",
                                    }}
                                >
                                    ⚠️{" "}
                                </div>
                                <h3
                                    style={{
                                        margin: "0 0 8px",
                                        fontSize: "18px",
                                        fontWeight: 800,
                                        color: T.colors.text,
                                        fontFamily: T.font,
                                    }}
                                >
                                    정말 탈퇴하시겠어요?
                                </h3>
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "14px",
                                        color: T.colors.muted,
                                        lineHeight: 1.6,
                                        fontFamily: T.font,
                                    }}
                                >
                                    탈퇴 시 모든 데이터가 삭제되며
                                    <br />
                                    복구할 수 없습니다.
                                </p>
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setWithdrawOpen(false)}
                                    style={{
                                        flex: 1,
                                        height: "52px",
                                        backgroundColor: "#F3F4F6",
                                        border: "none",
                                        borderRadius: T.radius.lg,
                                        fontSize: "15px",
                                        fontWeight: 700,
                                        color: T.colors.text,
                                        cursor: "pointer",
                                        fontFamily: T.font,
                                    }}
                                >
                                    취소
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.97 }}
                                    onClick={handleWithdraw}
                                    disabled={withdrawing}
                                    style={{
                                        flex: 1,
                                        height: "52px",
                                        backgroundColor: withdrawing
                                            ? "#FCA5A5"
                                            : T.colors.danger,
                                        border: "none",
                                        borderRadius: T.radius.lg,
                                        fontSize: "15px",
                                        fontWeight: 700,
                                        color: "#fff",
                                        cursor: withdrawing
                                            ? "not-allowed"
                                            : "pointer",
                                        fontFamily: T.font,
                                    }}
                                >
                                    {withdrawing ? "처리 중..." : "탈퇴하기"}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default MyPage

addPropertyControls(MyPage, {
    loginPageUrl: {
        type: ControlType.String,
        defaultValue: "/login",
        title: "로그인 페이지 URL",
    },
    deviceBaseUrl: {
        type: ControlType.String,
        defaultValue: "https://ktmarket.co.kr/product",
        title: "기기 상세 URL 기본경로",
        description: "최근 본 기기 클릭 시: {deviceBaseUrl}/{device_model}",
    },
    onOrderClick: { type: ControlType.EventHandler },
    onConsultClick: { type: ControlType.EventHandler },
    onPreorderClick: { type: ControlType.EventHandler },
    onRestockClick: { type: ControlType.EventHandler },
    onReferralClick: { type: ControlType.EventHandler },
    onWishlistClick: { type: ControlType.EventHandler },
    onLogoutClick: { type: ControlType.EventHandler },
    onWithdrawClick: { type: ControlType.EventHandler },
})
