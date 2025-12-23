'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Device } from '@/src/types/supabase';

interface ProductFormProps {
  initialData?: Partial<Device>;
  onSubmit: (data: Partial<Device>) => Promise<void>;
  isEditMode?: boolean;
}

export default function ProductForm({ initialData, onSubmit, isEditMode = false }: ProductFormProps) {
  const router = useRouter();
  const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL;

  const [device, setDevice] = useState<Partial<Device>>({
    is_available: true,
    colors_kr: [],
    capacities: [],
    price: 0,
    ...(initialData || {}),
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setDevice(prev => ({ ...prev, ...initialData }));
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!device.model) return alert('모델명은 필수입니다.');
    
    const message = isEditMode ? '수정하시겠습니까?' : '신규 기기를 등록하시겠습니까?';
    if (!confirm(message)) return;

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
    // @ts-ignore
    const val = type === 'number' ? Number(value) : value;
    setDevice(prev => ({ ...prev, [name]: val }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const arrayValue = value.split(',').map(v => v.trim()).filter(v => v !== '');
    setDevice(prev => ({ ...prev, [name]: arrayValue }));
  };

  // 미리보기 URL 생성
  const getPreviewUrl = () => {
    if (!device.thumbnail) return null;
    const categoryPath = device.category || device.model?.split('-')[0] || '';
    if (!categoryPath) return null;
    return `${CDN_URL}/phone/${categoryPath}/${device.thumbnail}/01.png`;
  };

  const previewUrl = getPreviewUrl();

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg border border-line-200">
      {/* 기본 정보 */}
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
          <input 
            name="pet_name" 
            value={device.pet_name || ''} 
            onChange={handleChange}
            placeholder="예: 갤럭시 S24 울트라"
            className="w-full border border-line-200 p-2 rounded-md" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-label-800">카테고리 (폴더명)</label>
          <input 
            name="category" 
            value={device.category || ''} 
            onChange={handleChange}
            placeholder="예: s24ultra"
            className="w-full border border-line-200 p-2 rounded-md bg-bg-alternative" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-label-800">제조사</label>
          <input 
            name="company" 
            value={device.company || ''} 
            onChange={handleChange}
            placeholder="예: samsung"
            className="w-full border border-line-200 p-2 rounded-md" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-label-800">출고가</label>
          <input 
            type="number"
            name="price" 
            value={device.price || 0} 
            onChange={handleChange}
            className="w-full border border-line-200 p-2 rounded-md" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1 text-label-800">판매 상태</label>
          <select 
            name="is_available" 
            value={device.is_available ? 'true' : 'false'}
            onChange={(e) => setDevice(prev => ({ ...prev, is_available: e.target.value === 'true' }))}
            className="w-full border border-line-200 p-2 rounded-md"
          >
            <option value="true">판매중</option>
            <option value="false">품절/판매중지</option>
          </select>
        </div>
      </div>

      <hr className="border-line-200" />

      {/* 배열 정보 */}
      <div>
        <label className="block text-sm font-medium mb-1 text-label-800">
          색상 (한글) <span className="text-xs text-label-500">* 콤마(,)로 구분</span>
        </label>
        <input 
          type="text"
          name="colors_kr"
          value={device.colors_kr?.join(', ') || ''} 
          onChange={handleArrayChange}
          placeholder="티타늄 그레이, 티타늄 블랙"
          className="w-full border border-line-200 p-2 rounded-md" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1 text-label-800">
          저장용량 <span className="text-xs text-label-500">* 콤마(,)로 구분</span>
        </label>
        <input 
          type="text"
          name="capacities"
          value={device.capacities?.join(', ') || ''} 
          onChange={handleArrayChange}
          placeholder="256GB, 512GB"
          className="w-full border border-line-200 p-2 rounded-md" 
        />
      </div>

      {/* 썸네일 */}
      <div>
        <label className="block text-sm font-medium mb-1 text-label-800">
          대표 색상 (영문 폴더명)
          <span className="ml-2 text-xs text-primary font-normal">
            * S3 경로: phone/{device.category || '카테고리'}/{device.thumbnail || '값'}/01.png
          </span>
        </label>
        <input 
          name="thumbnail" 
          value={device.thumbnail || ''} 
          onChange={handleChange}
          placeholder="gray"
          className="w-full border border-line-200 p-2 rounded-md" 
        />
         <div className="mt-4 p-4 border border-line-200 rounded-md bg-bg-alternative flex items-center justify-center min-h-[160px]">
          {previewUrl ? (
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto mb-2 bg-white rounded border shadow-sm">
                <Image
                  src={previewUrl}
                  alt="미리보기"
                  fill
                  sizes="128px"
                  className="object-contain p-2"
                  unoptimized
                  onError={() => console.error('미리보기 로드 실패')}
                />
              </div>
              <p className="text-xs text-label-500 break-all px-4">{previewUrl}</p>
            </div>
          ) : (
            <span className="text-sm text-label-500">정보 입력 시 미리보기가 표시됩니다.</span>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-line-200">
        <button 
          type="button" 
          onClick={() => router.back()}
          className="px-4 py-2 border border-line-400 rounded-md hover:bg-bg-alternative text-label-700 transition-colors"
        >
          취소
        </button>
        <button 
          type="submit" 
          disabled={submitting}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
        >
          {submitting ? '처리 중...' : (isEditMode ? '수정 내용 저장' : '기기 등록')}
        </button>
      </div>
    </form>
  );
}