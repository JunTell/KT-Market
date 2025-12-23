'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabaseClient } from '@/src/lib/supabase/client';
import { Device } from '@/src/types/supabase';

export default function ProductEditPage({ params }: { params: Promise<{ model: string }> }) {
  const router = useRouter();
  const { model } = use(params);

  const [device, setDevice] = useState<Partial<Device>>({});
  const [loading, setLoading] = useState(true);

  const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL;

  useEffect(() => {
    const modelId = decodeURIComponent(model);
    fetchDevice(modelId);
  }, [model]);

  const fetchDevice = async (modelId: string) => {
    const { data, error } = await supabaseClient
      .from('devices')
      .select('*')
      .eq('model', modelId)
      .single();

    if (error) {
      alert('기기 정보를 불러오지 못했습니다.');
      router.push('/admin/products');
    } else {
      setDevice(data);
    }
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('수정하시겠습니까?')) return;

    const { error } = await supabaseClient
      .from('devices')
      .update({
        ...device,
      })
      .eq('model', device.model);

    if (error) {
      alert('저장 실패: ' + error.message);
    } else {
      alert('저장되었습니다.');
      router.refresh();
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
    if (!device.model || !device.thumbnail) return null;

    if (device.category) {
      return `${CDN_URL}/phone/${device.category}/${device.thumbnail}/01.png`;
    }

    let folderName = device.model;
    if (device.company === 'apple') {
      folderName = device.model.split('-')[0]; 
    }
    
    return `${CDN_URL}/phone/${folderName}/${device.thumbnail}/01.png`;
  };

  const previewUrl = getPreviewUrl();

  if (loading) return <div className="p-8">로딩 중...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <h1 className="text-2xl font-bold">기기 정보 수정 ({device.model})</h1>

      <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-lg border">
        
        {/* 기본 정보 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">펫네임 (화면 표시 이름)</label>
            <input 
              name="pet_name" 
              value={device.pet_name || ''} 
              onChange={handleChange}
              className="w-full border p-2 rounded" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">카테고리 (폴더명)</label>
            <input 
              name="category" 
              value={device.category || ''} 
              onChange={handleChange}
              placeholder="예: aip17pm, sm-s931nk"
              className="w-full border p-2 rounded bg-gray-50" 
              title="S3 폴더명과 일치해야 이미지가 보입니다"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">제조사</label>
            <input 
              name="company" 
              value={device.company || ''} 
              onChange={handleChange}
              className="w-full border p-2 rounded" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">출고가 (원)</label>
            <input 
              type="number"
              name="price" 
              value={device.price || 0} 
              onChange={handleChange}
              className="w-full border p-2 rounded" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">판매 상태</label>
            <select 
              name="is_available" 
              value={device.is_available ? 'true' : 'false'}
              onChange={(e) => setDevice(prev => ({ ...prev, is_available: e.target.value === 'true' }))}
              className="w-full border p-2 rounded"
            >
              <option value="true">판매중</option>
              <option value="false">품절/판매중지</option>
            </select>
          </div>
        </div>

        <hr />

        {/* 배열 정보 */}
        <div>
          <label className="block text-sm font-medium mb-1">
            색상 (한글) <span className="text-xs text-gray-500">* 콤마(,)로 구분하세요</span>
          </label>
          <input 
            type="text"
            name="colors_kr"
            value={device.colors_kr?.join(', ') || ''} 
            onChange={handleArrayChange}
            placeholder="예: 팬텀 블랙, 크림, 라벤더"
            className="w-full border p-2 rounded" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            저장용량 <span className="text-xs text-gray-500">* 콤마(,)로 구분하세요</span>
          </label>
          <input 
            type="text"
            name="capacities"
            value={device.capacities?.join(', ') || ''} 
            onChange={handleArrayChange}
            placeholder="예: 256GB, 512GB"
            className="w-full border p-2 rounded" 
          />
        </div>

        {/* 썸네일 이미지 설정 */}
        <div>
          <label className="block text-sm font-medium mb-1">
            대표 색상 (영문 폴더명)
            <span className="ml-2 text-xs text-blue-600 font-normal">
              * S3의 {`phone/${device.category || '모델명'}/[여기값]/01.png`} 이미지를 사용합니다.
            </span>
          </label>
          <input 
            name="thumbnail" 
            value={device.thumbnail || ''} 
            onChange={handleChange}
            placeholder="예: black, white, natural_titanium"
            className="w-full border p-2 rounded" 
          />
          
          {/* 이미지 미리보기 영역 */}
          <div className="mt-4 p-4 border rounded bg-gray-50 flex items-center justify-center min-h-[160px]">
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
                <p className="text-xs text-gray-500 break-all px-4">{previewUrl}</p>
              </div>
            ) : (
              <span className="text-sm text-gray-400">이미지 정보를 입력하면 미리보기가 표시됩니다.</span>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <button 
            type="button" 
            onClick={() => router.back()}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            취소
          </button>
          <button 
            type="submit" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            저장하기
          </button>
        </div>
      </form>
    </div>
  );
}