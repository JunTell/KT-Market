'use server';

import { revalidatePath } from 'next/cache';

import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server';

import type { Consultation, ConsultationStatus } from './types';

interface GetConsultationsParams {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}

export async function getConsultations({
    page = 1,
    limit = 10,
    status,
    search,
}: GetConsultationsParams) {
    const supabase = await createSupabaseServerClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('consultations')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    if (search) {
        query = query.or(`customer_name.ilike.%${search}%,contact.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching consultations:', error);
        throw new Error('상담 목록을 불러오지 못했습니다.');
    }

    return {
        data: data as Consultation[],
        count: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
    };
}

export async function updateConsultationStatus(id: string, status: ConsultationStatus) {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from('consultations')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error('Error updating consultation status:', error);
        throw new Error('상태 변경에 실패했습니다.');
    }

    revalidatePath('/admin/consultations');
}

export async function updateConsultationMemo(id: string, memo: string) {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from('consultations')
        .update({ memo })
        .eq('id', id);

    if (error) {
        console.error('Error updating consultation memo:', error);
        throw new Error('메모 저장에 실패했습니다.');
    }

    revalidatePath('/admin/consultations');
}
