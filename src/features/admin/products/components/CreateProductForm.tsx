'use client';

import { useRouter } from 'next/navigation';

import type { Device } from '@/src/shared/types/supabase';

import { createProduct } from '../actions';

import ProductForm from './ProductForm';

export default function CreateProductForm() {
    const router = useRouter();

    const handleSubmit = async (data: Partial<Device>) => {
        try {
            await createProduct(data);
            alert('등록되었습니다.');
            router.push('/admin/products');
            router.refresh();
        } catch (error: any) {
            console.error(error);
            alert(error.message);
            // Re-throw if ProductForm needs to know failed? 
            // ProductForm catches error and stops 'submitting' state.
            throw error;
        }
    };

    return (
        <ProductForm onSubmit={handleSubmit} isEditMode={false} />
    );
}
