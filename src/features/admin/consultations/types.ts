export type ConsultationStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export const CONSULTATION_STATUS_LABELS: Record<ConsultationStatus, string> = {
    pending: '상담대기',
    in_progress: '상담중',
    completed: '상담완료',
    cancelled: '취소',
};

export const CONSULTATION_STATUS_COLORS: Record<ConsultationStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
};

export interface Consultation {
    id: string;
    created_at: string;
    customer_name: string;
    contact: string;
    requested_at: string | null;
    status: ConsultationStatus;
    memo: string | null;
}
