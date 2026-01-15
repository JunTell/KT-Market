import { STATUS_COLORS, STATUS_LABELS } from '../types';

import type { ApplicationStatus} from '../types';

interface StatusBadgeProps {
    status: ApplicationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}
        >
            {STATUS_LABELS[status]}
        </span>
    );
}
