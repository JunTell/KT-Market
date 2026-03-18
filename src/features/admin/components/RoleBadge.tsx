import { cn } from '../../../shared/lib/utils/cn'
import { ROLE_DISPLAY } from '../../../shared/types/auth'

import type { Role} from '../../../shared/types/auth';

interface RoleBadgeProps {
    role: Role
    className?: string
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
    const display = ROLE_DISPLAY[role]

    return (
        <span
            className={cn(
                'inline-flex items-center px-2 py-1 rounded text-xs font-medium text-white',
                display.color,
                className
            )}
        >
            {display.label}
        </span>
    )
}
