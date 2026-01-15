'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/src/shared/lib/auth/admin';
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server';

import type { Review } from './types';

interface GetReviewsParams {
    page?: number;
    limit?: number;
    search?: string;
}

export async function getReviews({
    page = 1,
    limit = 10,
    search,
}: GetReviewsParams) {
    await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('reviews')
        .select(`
            *,
            product:devices!product_id(model, pet_name),
            user:profiles!user_id(email)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (search) {
        query = query.ilike('content', `%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching reviews:', error);
        // Fail softly or return empty
        return { data: [], count: 0, totalPages: 0 };
    }

    return {
        data: data as unknown as Review[], // Supabase join type casting
        count: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
    };
}

export async function toggleReviewVisibility(id: string, isHidden: boolean) {
    await requireAdmin();
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from('reviews')
        .update({ is_hidden: isHidden })
        .eq('id', id);

    if (error) {
        console.error('Error updating review visibility:', error);
        throw new Error('리뷰 상태 변경에 실패했습니다.');
    }

    revalidatePath('/admin/reviews');
}
