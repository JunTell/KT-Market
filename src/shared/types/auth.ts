export type Role = 'admin' | 'online' | 'office' | 'sangnam1' | 'sangnam2' | 'hapseong1' | 'hapseong2' | 'palyong' | 'dealer'

export interface AdminUser {
    id: string
    email: string
    name: string
    role: Role
    is_active: boolean
    created_at: string
    updated_at: string
}

// 각 역할이 접근 가능한 경로 정의
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
    admin: ['*'], // 모든 경로
    online: ['/admin', '/admin/event', '/admin/applications', '/admin/consultations', '/admin/reviews', '/admin/posts', '/admin/products'],
    office: ['/admin', '/admin/event', '/admin/applications', '/admin/consultations', '/admin/reviews', '/admin/posts', '/admin/products'],
    sangnam1: ['/admin', '/admin/applications'],
    sangnam2: ['/admin', '/admin/applications'],
    hapseong1: ['/admin', '/admin/applications'],
    hapseong2: ['/admin', '/admin/applications'],
    palyong: ['/admin', '/admin/applications'],
    dealer: ['/admin', '/admin/applications'],
}

// 역할 표시 정보
export const ROLE_DISPLAY: Record<Role, { label: string; color: string }> = {
    admin: { label: '관리자', color: 'bg-red-500' },
    online: { label: '온라인', color: 'bg-blue-500' },
    office: { label: '사무실', color: 'bg-purple-500' },
    sangnam1: { label: '상남1점', color: 'bg-teal-500' },
    sangnam2: { label: '상남2점', color: 'bg-teal-600' },
    hapseong1: { label: '합성1점', color: 'bg-orange-500' },
    hapseong2: { label: '합성2점', color: 'bg-orange-600' },
    palyong: { label: '팔용점', color: 'bg-indigo-500' },
    dealer: { label: '대리점', color: 'bg-green-500' },
}
