'use client';

import { useRouter } from 'next/navigation';

import type { Device } from '@/src/shared/types/supabase';

import { updateProduct } from '../actions';

import ProductForm from './ProductForm';

interface EditProductFormProps {
    initialData: Partial<Device>;
}

export default function EditProductForm({ initialData }: EditProductFormProps) {
    const router = useRouter();

    const handleSubmit = async (data: Partial<Device>) => {
        try {
            await updateProduct(data);
            alert('수정되었습니다.');
            router.push('/admin/products');
            router.refresh();
        } catch (error: any) {
            console.error(error);
            alert(error.message);
            throw error;
        }
    };

    return (
        <ProductForm
            initialData={initialData}
            onSubmit={handleSubmit}
            isEditMode={true}
        />
    );
}
