'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/src/shared/lib/auth/admin';
import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server';
import type { Device } from '@/src/shared/types/supabase';

interface GetProductsParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
}

export async function getProducts({
    page = 1,
    limit = 10,
    search,
    category,
}: GetProductsParams) {
    await requireAdmin();
    const supabase = await createSupabaseServerClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('devices')
        .select('*', { count: 'exact' })
        .order('release_date', { ascending: false })
        .range(from, to);

    if (category && category !== 'all') {
        query = query.eq('category', category);
    }

    if (search) {
        // Search by model or pet_name
        query = query.or(`model.ilike.%${search}%,pet_name.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching products:', error);
        throw new Error('상품 목록을 불러오지 못했습니다.');
    }

    // Normalize data structure if needed (filling in optional arrays)
    const normalizedData = data?.map(d => ({
        colors_kr: [],
        capacities: [],
        images: [],
        release_date: null,
        ...d,
    })) as Device[];

    return {
        data: normalizedData,
        count: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
    };
}

export async function createProduct(data: Partial<Device>) {
    await requireAdmin();
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from('devices').insert([
        {
            ...data,
            created_at: new Date().toISOString(),
        },
    ]);

    if (error) {
        console.error('Error creating product:', error);
        throw new Error('기기 등록 실패: ' + error.message);
    }

    revalidatePath('/admin/products');
}

export async function updateProduct(data: Partial<Device>) {
    await requireAdmin();
    const supabase = await createSupabaseServerClient();

    if (!data.model) throw new Error('Model ID is missing');

    const { error } = await supabase
        .from('devices')
        .update(data)
        .eq('model', data.model);

    if (error) {
        console.error('Error updating product:', error);
        throw new Error('기기 수정 실패: ' + error.message);
    }

    revalidatePath('/admin/products');
}

