import { notFound } from 'next/navigation';

import { getPost, updatePost } from '@/src/features/admin/posts/actions';
import PostForm from '@/src/features/admin/posts/components/PostForm';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
    const { id } = await params;
    const post = await getPost(id);

    if (!post) {
        notFound();
    }

    // Server Action wrapper to pass ID
    const handleUpdate = async (data: any) => {
        'use server';
        await updatePost(id, data);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            <h1 className="text-2xl font-bold text-gray-900">게시글 수정</h1>
            <PostForm
                initialData={post}
                onSubmit={handleUpdate}
                isEditMode
            />
        </div>
    );
}
