'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { signup } from '@/src/shared/actions/auth';
import type { Device } from '@/src/shared/types/supabase';

interface ProductFormProps {
  initialData?: Partial<Device>;
  onSubmit: (data: Partial<Device>) => Promise<void>;
  isEditMode?: boolean;
}

const DEFAULT_DATA = {};

export default function ProductForm({ initialData = DEFAULT_DATA, onSubmit, isEditMode = false }: ProductFormProps) {
  const router = useRouter();
  const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL;

  const defaultValues: Partial<Device> = {
    is_available: true,
    colors_kr: [],
    capacities: [],
    price: 0,
    ...initialData,
  };

  const [device, setDevice] = useState<Partial<Device>>(defaultValues);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setDevice(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!device.model) return alert('모델명은 필수입니다.');

    if (!confirm(isEditMode ? '수정하시겠습니까?' : '신규 기기를 등록하시겠습니까?')) return;

    setSubmitting(true);
    try {
      await onSubmit(device);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'number' ? Number(value) : value;
    setDevice(prev => ({ ...prev, [name]: val }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const arrayValue = value.split(',').map(v => v.trim()).filter(v => v !== '');
    setDevice(prev => ({ ...prev, [name]: arrayValue }));
  };

  const getPreviewUrl = () => {
    if (!device.thumbnail) return null;
    const categoryPath = device.category || device.model;
    if (!categoryPath) return null;
    return `${CDN_URL}/phone/${encodeURIComponent(categoryPath)}/${encodeURIComponent(device.thumbnail)}/01.png`;
  };

  const previewUrl = getPreviewUrl();

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-line-200">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-label-800">
            모델명 (PK) {isEditMode && <span className="text-xs text-status-error">(수정불가)</span>}
          </label>
          <input
            name="model"
            value={device.model || ''}
            onChange={handleChange}
            disabled={isEditMode}
            placeholder="예: SM-S928N"
            className={`w-full border p-2 rounded-md ${isEditMode ? 'bg-bg-alternative text-label-500 cursor-not-allowed' : 'bg-white'}`}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-label-800">펫네임</label>
          <input name="pet_name" value={device.pet_name || ''} onChange={handleChange} className="w-full border border-line-200 p-2 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-label-800">카테고리</label>
          <input name="category" value={device.category || ''} onChange={handleChange} className="w-full border border-line-200 p-2 rounded-md bg-bg-alternative" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-label-800">제조사</label>
          <input name="company" value={device.company || ''} onChange={handleChange} className="w-full border border-line-200 p-2 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-label-800">출고가</label>
          <input type="number" name="price" value={device.price || 0} onChange={handleChange} className="w-full border border-line-200 p-2 rounded-md" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-label-800">판매 상태</label>
          <select name="is_available" value={device.is_available ? 'true' : 'false'} onChange={(e) => setDevice(prev => ({ ...prev, is_available: e.target.value === 'true' }))} className="w-full border border-line-200 p-2 rounded-md">
            <option value="true">판매중</option>
            <option value="false">품절/판매중지</option>
          </select>
        </div>
      </div>
      <hr className="border-line-200" />
      <div>
        <label className="block text-sm font-medium mb-1 text-label-800">색상 (한글)</label>
        <input type="text" name="colors_kr" value={device.colors_kr?.join(', ') || ''} onChange={handleArrayChange} className="w-full border border-line-200 p-2 rounded-md" placeholder="예: 팬텀 블랙, 크림, 라벤더" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-label-800">저장용량</label>
        <input type="text" name="capacities" value={device.capacities?.join(', ') || ''} onChange={handleArrayChange} className="w-full border border-line-200 p-2 rounded-md" placeholder="예: 256GB, 512GB" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 text-label-800">썸네일 (폴더명)</label>
        <input name="thumbnail" value={device.thumbnail || ''} onChange={handleChange} className="w-full border border-line-200 p-2 rounded-md" placeholder="예: black, white, natural_titanium" />
        <div className="mt-4 p-4 border border-line-200 rounded-md bg-bg-alternative flex items-center justify-center min-h-[160px]">
          {previewUrl ? (
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-2 bg-white rounded border shadow-sm">
                <Image src={previewUrl} alt="미리보기" fill sizes="128px" className="object-contain p-2" onError={() => console.error('미리보기 로드 실패')} />
              </div>
              <p className="text-xs text-gray-500 break-all px-4">{previewUrl}</p>
            </div>
          ) : (
            <span className="text-sm text-gray-400">이미지 정보를 입력하면 미리보기가 표시됩니다.</span>
          )}
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-line-200">
        <button type="button" onClick={() => router.back()} className="px-4 py-2 border border-line-400 rounded-md hover:bg-bg-alternative text-label-700">취소</button>
        <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary disabled:opacity-50">
          {submitting ? '처리 중...' : (isEditMode ? '수정 내용 저장' : '기기 등록')}
        </button>
      </div>
    </form>
  );
}
