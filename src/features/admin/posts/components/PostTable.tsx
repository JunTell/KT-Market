'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { deletePost, updatePost } from '../actions';

import type { Post } from '../types';

interface PostTableProps {
    initialData: Post[];
    initialTotalPages: number;
}

export function PostTable({ initialData, initialTotalPages }: PostTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [data, setData] = useState<Post[]>(initialData);

    const page = Number(searchParams.get('page')) || 1;
    const search = searchParams.get('search') || '';

    const handleDelete = async (id: string) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        try {
            await deletePost(id);
            setData(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            alert('삭제 실패');
        }
    };

    const handleTogglePublish = async (id: string, current: boolean) => {
        try {
            await updatePost(id, { is_published: !current });
            setData(prev => prev.map(p => p.id === id ? { ...p, is_published: !current } : p));
        } catch (error) {
            alert('상태 변경 실패');
        }
    };

    const updateFilters = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) params.set(key, value);
        else params.delete(key);
        if (key !== 'page') params.set('page', '1');
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm">
                <Link
                    href="/admin/posts/new"
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-secondary transition-colors"
                >
                    + 새 글 작성
                </Link>
                <input
                    type="text"
                    placeholder="제목 검색"
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제목</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">조회수</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">상태</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">관리</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.map((post) => (
                            <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(post.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                    <Link href={`/admin/posts/${post.id}`} className="hover:underline">
                                        {post.title}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                                    {post.view_count}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <button
                                        onClick={() => handleTogglePublish(post.id, post.is_published)}
                                        className={`px-2 py-1 text-xs rounded-full border ${post.is_published
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-gray-100 text-gray-500 border-gray-200'
                                            }`}
                                    >
                                        {post.is_published ? '공개됨' : '비공개'}
                                    </button>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium space-x-2">
                                    <Link href={`/admin/posts/${post.id}`} className="text-blue-600 hover:text-blue-900">
                                        수정
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(post.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        삭제
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {initialTotalPages > 1 && (
                <div className="flex justify-center gap-2 mt-4">
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
