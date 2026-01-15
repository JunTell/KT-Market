'use server';

import { revalidatePath } from 'next/cache';

import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server';

import type { Application, ApplicationStatus } from './types';

interface GetApplicationsParams {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    type?: string;
}

export async function getApplications({
    page = 1,
    limit = 10,
    status,
    search,
    type,
}: GetApplicationsParams) {
    const supabase = await createSupabaseServerClient();
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
        .from('applications')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (status && status !== 'all') {
        query = query.eq('status', status);
    }

    if (type && type !== 'all') {
        query = query.eq('type', type);
    }

    if (search) {
        query = query.or(`customer_name.ilike.%${search}%,contact.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching applications:', error);
        throw new Error('신청서 목록을 불러오지 못했습니다.');
    }

    return {
        data: data as Application[],
        count: count || 0,
        totalPages: count ? Math.ceil(count / limit) : 0,
    };
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error('Error updating application status:', error);
        throw new Error('상태 변경에 실패했습니다.');
    }

    revalidatePath('/admin/applications');
}

export async function updateApplicationMemo(id: string, memo: string) {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase
        .from('applications')
        .update({ memo })
        .eq('id', id);

    if (error) {
        console.error('Error updating application memo:', error);
        throw new Error('메모 저장에 실패했습니다.');
    }

    revalidatePath('/admin/applications');
}
