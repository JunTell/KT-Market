'use server';

import { revalidatePath } from 'next/cache';

import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server';

import type { Post, PostFormData } from './types';

export async function getPosts({ page = 1, limit = 10, search = '' }) {
    const supabase = await createSupabaseServerClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('posts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (search) {
        query = query.ilike('title', `%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching posts:', error);
        return { data: [], count: 0, totalPages: 0 };
    }

    return {
        data: data as Post[],
        count: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
    };
}

export async function getPost(id: string) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', id)
        .single();

    if (error) return null;
    return data as Post;
}

export async function createPost(data: PostFormData) {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from('posts').insert([
        {
            ...data,
            created_at: new Date().toISOString(),
        }
    ]);

    if (error) throw error;
    revalidatePath('/admin/posts');
}

export async function updatePost(id: string, data: Partial<PostFormData>) {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from('posts')
        .update({
            ...data,
            updated_at: new Date().toISOString(),
        })
        .eq('id', id);

    if (error) throw error;
    revalidatePath('/admin/posts');
    revalidatePath(`/admin/posts/${id}`);
}

export async function deletePost(id: string) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    revalidatePath('/admin/posts');
}
