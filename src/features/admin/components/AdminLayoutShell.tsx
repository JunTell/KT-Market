'use client'

import { useEffect, useState } from 'react'

import { cn } from '../../../shared/lib/utils/cn'

interface AdminLayoutShellProps {
    children: React.ReactNode
    className?: string
}

export function AdminLayoutShell({ children, className }: AdminLayoutShellProps) {
    const [mounted, setMounted] = useState(false)

    // Hydration mismatch 방지
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <div className={cn("flex min-h-screen admin-theme", className)}>
                {children}
            </div>
        )
    }

    return (
        <div className={cn(
            "flex min-h-screen admin-theme transition-colors duration-200",
            className
        )}>
            {children}
        </div>
    )
}
