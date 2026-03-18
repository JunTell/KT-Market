'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../../../shared/stores/auth-store'
import { useAdminUIStore } from '../stores/ui-store'
import { Role } from '../../../shared/types/auth'
import { RoleBadge } from './RoleBadge'
import {
    Home, Users, Settings,
    ChevronDown, ChevronRight, LucideIcon, X,
    Handshake, Edit, Newspaper, FileText, ShoppingBag, FolderHeart
} from 'lucide-react'
import { cn } from '../../../shared/lib/utils/cn'

type MenuItem = {
    title: string
    href: string
    icon: LucideIcon
    roles: readonly Role[]
    children?: {
        title: string
        href: string
    }[]
}

const MENU_ITEMS: MenuItem[] = [
    {
        title: '대시보드',
        href: '/admin',
        icon: Home,
        roles: ['admin', 'online', 'office', 'sangnam1', 'sangnam2', 'hapseong1', 'hapseong2', 'palyong', 'dealer'],
    },
    {
        title: '이벤트 페이지 관리',
        href: '/admin/event',
        icon: FolderHeart,
        roles: ['admin', 'online', 'office'],
    },
    {
        title: '신청서 관리',
        href: '/admin/applications',
        icon: Edit,
        roles: ['admin', 'online', 'office', 'sangnam1', 'sangnam2', 'hapseong1', 'hapseong2', 'palyong', 'dealer'],
    },
    {
        title: '상담 신청 관리',
        href: '/admin/consultations',
        icon: Handshake,
        roles: ['admin', 'online', 'office'],
    },
    {
        title: '리뷰 관리',
        href: '/admin/reviews',
        icon: FileText,
        roles: ['admin', 'online', 'office'],
    },
    {
        title: '블로그/뉴스',
        href: '/admin/posts',
        icon: Newspaper,
        roles: ['admin', 'online', 'office'],
    },
    {
        title: '상품 재고 관리',
        href: '/admin/products',
        icon: ShoppingBag,
        roles: ['admin', 'online', 'office'],
    },
    {
        title: '사용자 관리',
        href: '/admin/users',
        icon: Users,
        roles: ['admin'],
    },
] as const

export function Sidebar() {
    const admin = useAuthStore((state) => state.admin)
    const { isSidebarOpen, closeSidebar } = useAdminUIStore()
    const pathname = usePathname()

    // Route change -> close sidebar (mobile)
    useEffect(() => {
        closeSidebar()
    }, [pathname, closeSidebar])

    if (!admin) return null

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 bg-background-default border-r border-line-200 h-screen flex-col sticky top-0 shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile Drawer */}
            <div className={cn(
                "fixed inset-0 z-50 flex md:hidden transition-opacity duration-300",
                isSidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
            )}>
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={closeSidebar}
                />

                {/* Drawer Panel */}
                <aside className={cn(
                    "relative w-64 h-full bg-background-default border-r border-line-200 flex flex-col shadow-xl transition-transform duration-300 transform",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    {/* Close Button Mobile Only */}
                    <div className="absolute right-4 top-4 md:hidden">
                        <button onClick={closeSidebar} className="p-1 text-label-500 hover:text-label-900">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <SidebarContent />
                </aside>
            </div>
        </>
    )
}

function SidebarContent() {
    const pathname = usePathname()
    const admin = useAuthStore((state) => state.admin)
    const [expandedMenus, setExpandedMenus] = useState<string[]>([])

    const toggleMenu = (title: string) => {
        setExpandedMenus(prev =>
            prev.includes(title)
                ? prev.filter(t => t !== title)
                : [...prev, title]
        )
    }

    // Ensure admin exists (safe-guard since parent checks it too)
    if (!admin) return null

    const filteredMenu = MENU_ITEMS.filter(item =>
        (item.roles as readonly Role[]).includes(admin.role)
    )

    return (
        <>
            {/* 사용자 정보 */}
            <div className="p-4 border-b border-line-200 flex-shrink-0">
                <p className="font-semibold pr-6 truncate">{admin.name}</p>
                <p className="text-sm text-label-500 truncate">{admin.email}</p>
                <RoleBadge role={admin.role} className="mt-2" />
            </div>

            {/* 메뉴 */}
            <nav className="p-4 flex-1 overflow-y-auto scrollbar-hide">
                <ul className="space-y-1">
                    {filteredMenu.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        const hasChildren = item.children && item.children.length > 0
                        const isExpanded = expandedMenus.includes(item.title)
                        const isChildActive = item.children?.some(child => pathname === child.href)

                        return (
                            <li key={item.title}>
                                {hasChildren ? (
                                    <div>
                                        <button
                                            onClick={() => toggleMenu(item.title)}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2 rounded-lg transition min-h-[44px]", // Minimum touch target
                                                isActive || isChildActive || isExpanded
                                                    ? 'text-primary'
                                                    : 'text-label-900 hover:bg-background-alternative'
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-5 h-5" />
                                                <span>{item.title}</span>
                                            </div>
                                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                        </button>

                                        {isExpanded && (
                                            <ul className="mt-1 ml-4 space-y-1 border-l border-line-200 pl-2">
                                                {item.children!.map((child) => {
                                                    const isSubActive = pathname === child.href
                                                    return (
                                                        <li key={child.href}>
                                                            <Link
                                                                href={child.href}
                                                                className={cn(
                                                                    "block px-3 py-2 rounded-lg text-sm transition min-h-[44px] flex items-center", // Minimum touch target
                                                                    isSubActive
                                                                        ? 'text-primary font-medium'
                                                                        : 'text-label-700 hover:text-label-900 hover:bg-background-alternative'
                                                                )}
                                                            >
                                                                {child.title}
                                                            </Link>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg transition min-h-[44px]", // Minimum touch target
                                            isActive
                                                ? 'bg-tertiary text-primary'  /* Highlighted */
                                                : 'text-label-900 hover:bg-background-alternative'
                                        )}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {item.title}
                                    </Link>
                                )}
                            </li>
                        )
                    })}
                </ul>
            </nav>

            {/* 하단 설정 (Admin Only) */}
            {admin.role === 'admin' && (
                <div className="p-4 border-t border-line-200 flex-shrink-0">
                    <Link
                        href="/admin/settings"
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition min-h-[44px]",
                            pathname === '/admin/settings'
                                ? 'bg-tertiary text-primary'
                                : 'text-label-900 hover:bg-background-alternative'
                        )}
                    >
                        <Settings className="w-5 h-5" />
                        설정
                    </Link>
                </div>
            )}
        </>
    )
}
