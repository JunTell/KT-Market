'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabaseClient } from '@/src/lib/supabase/client';
import { Device } from '@/src/types/supabase';

export default function ProductListPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  // 기기 목록 불러오기
  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      // [중요] 데이터 요청 전 세션 로드 대기 (RLS 통과 보장)
      await supabaseClient.auth.getSession();

      const { data, error } = await supabaseClient
        .from('devices')
        .select('model, pet_name, category, company, price, is_available, thumbnail')
        .order('release_date', { ascending: false }); // 최신순

      if (error) {
        console.error(error);
        setDevices([]);
      } else if (data) {
        setDevices(
          data.map(d => ({
            colors_kr: [],
            capacities: [],
            images: [],
            release_date: null,
            ...d,
          })) as Device[]
        );
      } else {
        setDevices([]);
      }
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">로딩 중...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">상품(휴대폰) 재고 관리</h1>
        <Link
          href="/admin/products/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + 신규 기기 등록
        </Link>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">기기명 (펫네임)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">모델명</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">제조사</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">출고가</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">판매 상태</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {devices.map((device) => (
              <tr key={device.model} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">

                  <div className="relative w-10 h-10 rounded bg-gray-100 overflow-hidden border border-gray-200 shrink-0">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_CDN_URL}/phone/${device.category}/${device.thumbnail}/01.png`}
                      alt={`${device.pet_name} 썸네일`}
                      fill
                      sizes="40px"
                      className="object-cover"
                      unoptimized
                      onError={() => console.error(`이미지 로드 실패: ${device.category}/${device.thumbnail}`)}
                    />
                  </div>

                  <span className="font-medium text-gray-900">{device.pet_name || device.model}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {device.model}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {device.company}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {device.price?.toLocaleString()}원
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    device.is_available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {device.is_available ? '판매중' : '품절'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <Link href={`/admin/products/${device.model}`} className="text-blue-600 hover:text-blue-900">
                    수정
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
