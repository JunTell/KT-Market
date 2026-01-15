'use client'

import { useState } from 'react'

import { upsertEvent } from '@/src/app/admin/event/actions'

import TextEditor from './TextEditor'

interface EventData {
  id?: string
  title: string
  slug: string
  content?: string
  start_date?: string
  end_date?: string
  thumbnail_url?: string
  is_finish?: boolean
}

export default function EventForm({ initialData }: { initialData?: EventData }) {
  const [content, setContent] = useState(initialData?.content || '');

  // 날짜 포맷팅 (YYYY-MM-DDTHH:mm) - datetime-local input용
  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toISOString().slice(0, 16)
  }

  return (
    <form action={upsertEvent} className="space-y-6 max-w-4xl bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 제목 & Slug */}
        <div className="col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이벤트 제목</label>
            <input
              name="title"
              defaultValue={initialData?.title}
              required
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              placeholder="예: 2025년 신년 맞이 할인 이벤트"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL 슬러그 (고유주소)
              <span className="text-xs text-gray-500 ml-2">ktmarket.co.kr/event/<b>{initialData?.slug || 'exam'}</b></span>
            </label>
            <input
              name="slug"
              defaultValue={initialData?.slug}
              required
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
              placeholder="영문, 숫자, 하이픈(-)만 입력 추천"
            />
          </div>
        </div>

        {/* 날짜 설정 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
          <input
            type="datetime-local"
            name="start_date"
            defaultValue={formatDate(initialData?.start_date)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
          <input
            type="datetime-local"
            name="end_date"
            defaultValue={formatDate(initialData?.end_date)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">상세 내용</label>
        <input type="hidden" name="content" value={content} />
        <div className="bg-white">
          <TextEditor value={content} onChange={setContent} />
        </div>
      </div>

      {/* 썸네일 URL (임시) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">썸네일 이미지 URL</label>
        <input
          name="thumbnail_url"
          defaultValue={initialData?.thumbnail_url || ''}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="https://..."
        />
      </div>

      {/* 상태 설정 */}
      <div className="flex items-center gap-2 pt-2">
        <input
          type="checkbox"
          id="is_finish"
          name="is_finish"
          defaultChecked={initialData?.is_finish}
          className="w-5 h-5 text-blue-600 rounded"
        />
        <label htmlFor="is_finish" className="text-sm font-medium text-gray-700">이벤트 종료 처리하기</label>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors">
          {initialData ? '수정 내용 저장' : '이벤트 생성하기'}
        </button>
      </div>
    </form>
  )
}