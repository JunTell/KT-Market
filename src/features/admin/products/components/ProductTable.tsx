'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

import type { Device } from '@/src/shared/types/supabase';

interface ProductTableProps {
    initialData: Device[];
    initialTotalPages: number;
}

export function ProductTable({ initialData, initialTotalPages }: ProductTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [data, setData] = useState<Device[]>(initialData);
    const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL;

    // Filter Logic
    const page = Number(searchParams.get('page')) || 1;
    const categoryFilter = searchParams.get('category') || 'all';
    const search = searchParams.get('search') || '';

    useEffect(() => {
        setData(initialData);
    }, [initialData]);

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        if (key !== 'page') {
            params.set('page', '1');
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                <div className="flex gap-2">
                    <select
                        className="border border-gray-300 rounded-md text-sm px-3 py-2 bg-white"
                        value={categoryFilter}
                        onChange={(e) => updateFilters('category', e.target.value)}
                    >
                        <option value="all">전체 카테고리</option>
                        <option value="s24ultra">S24 Ultra</option>
                        <option value="s24plus">S24 Plus</option>
                        <option value="s24">S24</option>
                        <option value="zflip5">Z Flip 5</option>
                        <option value="zfold5">Z Fold 5</option>
                    </select>
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="모델명/펫네임 검색"
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
            <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">기기명</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">모델명</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제조사</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">출고가</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">상태</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">관리</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((device) => (
                            <tr key={device.model} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
                                    <div className="relative w-10 h-10 rounded bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                                        <Image
                                            src={`${CDN_URL}/phone/${device.category}/${device.thumbnail}/01.png`}
                                            alt={device.pet_name || 'thumbnail'}
                                            fill
                                            sizes="40px"
                                            className="object-cover"
                                            onError={(e) => console.error(`이미지 로드 실패: ${device.thumbnail}`)}
                                        />
                                    </div>
                                    <span className="font-medium text-gray-900">{device.pet_name || device.model}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.model}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{device.company}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {device.price?.toLocaleString()}원
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <span className={`px-2 py-1 text-xs rounded-full ${device.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {device.is_available ? '판매중' : '품절'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                    <Link href={`/admin/products/${device.model}`} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded transition-colors">
                                        수정
                                    </Link>
                                </td>
                            </tr>
                        ))}
                        {data.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                                    등록된 기기가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination settings */}
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
        </div>
    );
}
