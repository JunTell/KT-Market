'use client';

import { createPost } from '@/src/features/admin/posts/actions';
import PostForm from '@/src/features/admin/posts/components/PostForm';

export default function NewPostPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <h1 className="text-2xl font-bold text-gray-900">새 글 작성</h1>
            <PostForm onSubmit={createPost} />
        </div>
    );
}
