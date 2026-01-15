import { CONSULTATION_STATUS_COLORS, CONSULTATION_STATUS_LABELS } from '../types';

import type { ConsultationStatus} from '../types';

interface StatusBadgeProps {
    status: ConsultationStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${CONSULTATION_STATUS_COLORS[status]}`}
        >
            {CONSULTATION_STATUS_LABELS[status]}
        </span>
    );
}
