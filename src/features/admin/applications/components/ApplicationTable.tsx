'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import { updateApplicationStatus } from '../actions';

import { ApplicationDetailModal } from './ApplicationDetailModal';
import { StatusBadge } from './StatusBadge';

import type { Application, ApplicationStatus } from '../types';

// ...

interface ApplicationTableProps {
    initialData: Application[];
    initialTotalPages: number;
}

export function ApplicationTable({ initialData, initialTotalPages }: ApplicationTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [data, setData] = useState<Application[]>(initialData);
    const [loading, setLoading] = useState(false);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    // Filters state sourced from URL or defaults
    const page = Number(searchParams.get('page')) || 1;
    const statusFilter = searchParams.get('status') || 'all';
    const typeFilter = searchParams.get('type') || 'all';
    const search = searchParams.get('search') || '';

    // Sync data when initialData changes (e.g. after revalidate)
    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    const handleStatusChange = async (id: string, newStatus: ApplicationStatus) => {
        if (!confirm('상태를 변경하시겠습니까?')) return;

        setUpdatingId(id);
        try {
            await updateApplicationStatus(id, newStatus);
            // Optimistic update
            setData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
        } catch (error) {
            alert('상태 변경 실패');
        } finally {
            setUpdatingId(null);
        }
    };

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        // Reset page on filter change
        if (key !== 'page') {
            params.set('page', '1');
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="space-y-4">
            {/* Filters Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex gap-2">
                    <select
                        className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white"
                        value={typeFilter}
                        onChange={(e) => updateFilters('type', e.target.value)}
                    >
                        <option value="all">전체 구분</option>
                        <option value="mobile">모바일</option>
                        <option value="internet">인터넷/TV</option>
                    </select>
                    <select
                        className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white"
                        value={statusFilter}
                        onChange={(e) => updateFilters('status', e.target.value)}
                    >
                        <option value="all">전체 상태</option>
                        <option value="pending">접수대기</option>
                        <option value="consulting">상담중</option>
                        <option value="completed">완료</option>
                        <option value="cancelled">취소</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="이름 또는 연락처 검색"
                        className="border border-gray-300 rounded-md text-sm px-3 py-2 w-full sm:w-64"
                        defaultValue={search}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') updateFilters('search', e.currentTarget.value)
                        }}
                        onBlur={(e) => updateFilters('search', e.target.value)}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">접수일</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">구분</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">고객명/연락처</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((app) => (
                                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(app.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {app.type === 'mobile' ? '📱 모바일' : '🌐 인터넷/TV'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{app.customer_name}</div>
                                        <div className="text-sm text-gray-500">{app.contact}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <StatusBadge status={app.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedApp(app);
                                                    setIsModalOpen(true);
                                                }}
                                                className="text-blue-600 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded transition-colors"
                                            >
                                                상세보기
                                            </button>
                                            <select
                                                disabled={updatingId === app.id}
                                                value={app.status}
                                                onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                                                className="text-xs border-gray-300 rounded shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            >
                                                <option value="pending">대기</option>
                                                <option value="consulting">상담중</option>
                                                <option value="completed">완료</option>
                                                <option value="cancelled">취소</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                                        접수된 신청서가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination (Simple) */}
            {initialTotalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    <button
                        disabled={page <= 1}
                        onClick={() => updateFilters('page', String(page - 1))}
                        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                        이전
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-600 flex items-center">
                        {page} / {initialTotalPages}
                    </span>
                    <button
                        disabled={page >= initialTotalPages}
                        onClick={() => updateFilters('page', String(page + 1))}
                        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                        다음
                    </button>
                </div>
            )}
            {selectedApp && (
                <ApplicationDetailModal
                    isOpen={isModalOpen}
                    application={selectedApp}
                    onClose={() => setIsModalOpen(false)}
                    onMemoUpdate={(id, memo) => {
                        setData(prev => prev.map(item => item.id === id ? { ...item, memo } : item));
                    }}
                />
            )}
        </div>
    );
}
