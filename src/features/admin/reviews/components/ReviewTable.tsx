'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { toggleReviewVisibility } from '../actions';

import type { Review } from '../types';

interface ReviewTableProps {
    initialData: Review[];
    initialTotalPages: number;
}

export function ReviewTable({ initialData, initialTotalPages }: ReviewTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [data, setData] = useState<Review[]>(initialData);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const page = Number(searchParams.get('page')) || 1;
    const search = searchParams.get('search') || '';

    const handleVisibilityToggle = async (id: string, currentHidden: boolean) => {
        if (!confirm(currentHidden ? '이 리뷰를 다시 공개하시겠습니까?' : '이 리뷰를 숨기시겠습니까?')) return;

        setUpdatingId(id);
        try {
            const newHidden = !currentHidden;
            await toggleReviewVisibility(id, newHidden);
            setData(prev => prev.map(item => item.id === id ? { ...item, is_hidden: newHidden } : item));
        } catch (error) {
            alert('상태 변경 실패');
        } finally {
            setUpdatingId(null);
        }
    };

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        if (key !== 'page') params.set('page', '1');
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <input
                    type="text"
                    placeholder="리뷰 내용 검색"
                    className="border border-gray-300 rounded-md text-sm px-3 py-2 w-64"
                    defaultValue={search}
                    onKeyDown={(e) => e.key === 'Enter' && updateFilters('search', e.currentTarget.value)}
                    onBlur={(e) => updateFilters('search', e.target.value)}
                />
            </div>

            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">작성일</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">상품</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">평점</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">내용</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">상태</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">관리</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((review) => (
                            <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {review.product?.pet_name || review.product?.model || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-500 font-bold">
                                    {'⭐'.repeat(review.rating)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                    {review.content}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`px-2 py-1 text-xs rounded-full ${review.is_hidden ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-800'}`}>
                                        {review.is_hidden ? '숨김' : '공개'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <button
                                        disabled={updatingId === review.id}
                                        onClick={() => handleVisibilityToggle(review.id, review.is_hidden)}
                                        className={`px-3 py-1 rounded transition-colors ${review.is_hidden
                                                ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                                            }`}
                                    >
                                        {review.is_hidden ? '공개 전환' : '숨기기'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination (Simplified Loop) */}
            {initialTotalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                    {/* ... (Reuse pagination logic) ... */}
                    <button
                        disabled={page <= 1}
                        onClick={() => updateFilters('page', String(page - 1))}
                        className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                        이전
                    </button>
                    <span className="px-3 py-1 text-sm text-gray-600">
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
        </div>
    );
}
