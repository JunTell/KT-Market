'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';


import TextEditor from '@/src/features/admin/components/TextEditor';
import { createSupabaseBrowserClient } from '@/src/shared/lib/supabase/client';

import type { Post, PostFormData } from '../types';

interface PostFormProps {
    initialData?: Post;
    onSubmit: (data: PostFormData) => Promise<void>;
    isEditMode?: boolean;
}

export default function PostForm({ initialData, onSubmit, isEditMode = false }: PostFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState<PostFormData>({
        title: initialData?.title || '',
        content: initialData?.content || '',
        thumbnail: initialData?.thumbnail || '',
        is_published: initialData?.is_published ?? false,
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEditorChange = (content: string) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.content) return alert('제목과 내용은 필수입니다.');

        if (!confirm(isEditMode ? '수정하시겠습니까?' : '등록하시겠습니까?')) return;

        setSubmitting(true);
        try {
            await onSubmit(formData);
            alert('저장되었습니다.');
            router.push('/admin/posts');
            router.refresh();
        } catch (error: any) {
            console.error(error);
            alert('저장 실패: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-line-200">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1 text-label-800">제목</label>
                    <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full border border-line-200 p-2 rounded-md"
                        required
                        placeholder="제목을 입력하세요"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="is_published"
                        name="is_published"
                        checked={formData.is_published}
                        onChange={handleChange}
                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                    />
                    <label htmlFor="is_published" className="text-sm font-medium text-label-800 select-none">
                        공개 여부 (체크 시 즉시 공개됨)
                    </label>
                </div>

                {/* 썸네일 업로드 (선택 사항) */}
                <div>
                    <label className="block text-sm font-medium mb-1 text-label-800">썸네일 URL (선택)</label>
                    <input
                        name="thumbnail"
                        value={formData.thumbnail || ''}
                        onChange={handleChange}
                        className="w-full border border-line-200 p-2 rounded-md"
                        placeholder="직접 이미지 URL을 입력하거나, 나중에 업로드 기능을 추가하세요."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1 text-label-800">내용</label>
                    <div className="min-h-[400px]">
                        <TextEditor value={formData.content} onChange={handleEditorChange} />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-line-200">
                <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-line-400 rounded-md hover:bg-bg-alternative text-label-700">
                    취소
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary disabled:opacity-50">
                    {submitting ? '저장 중...' : (isEditMode ? '수정 완료' : '등록하기')}
                </button>
            </div>
        </form>
    );
}
