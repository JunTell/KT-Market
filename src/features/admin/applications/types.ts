export type ApplicationStatus = 'pending' | 'consulting' | 'completed' | 'cancelled';
export type ApplicationType = 'mobile' | 'internet';

export interface Application {
    id: string;
    created_at: string;
    type: ApplicationType;
    customer_name: string;
    contact: string;
    status: ApplicationStatus;
    product_info: Record<string, any> | null;
    memo: string | null;
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
    pending: '접수대기',
    consulting: '상담중',
    completed: '완료',
    cancelled: '취소',
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    consulting: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
};
