'use client'

import { useState, useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { upsertEventAction as upsertEvent } from '../../events/api/actions'
import TextEditor from './TextEditor'
import { EventRow as EventData } from '../../../shared/types/event'
import { Button } from '../../../shared/ui/Button'

export default function EventForm({ initialData }: { initialData?: EventData }) {
  const router = useRouter()
  const [content, setContent] = useState(initialData?.content || '');
  const [state, formAction, isPending] = useActionState(upsertEvent, { success: true })

  // 날짜 포맷팅 (YYYY-MM-DDTHH:mm) - datetime-local input용
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toISOString().slice(0, 16)
  }

  return (
    <form action={formAction} className="space-y-6 max-w-4xl bg-white p-6 rounded-xl shadow-sm border border-line-200">
      {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

      {!state.success && state.error && (
        <div className="p-3 bg-red-500/10 border border-status-error text-status-error rounded-md text-sm font-medium">
          {state.error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 제목 & Slug */}
        <div className="col-span-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-label-700 mb-1">이벤트 제목</label>
            <input
              name="title"
              defaultValue={initialData?.title}
              required
              className="w-full p-2 border border-line-200 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-shadow text-label-900 placeholder:text-label-400"
              placeholder="예: 2025년 신년 맞이 할인 이벤트"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-label-700 mb-1">
              URL 슬러그 (고유주소)
              <span className="text-xs text-label-500 ml-2">ktmarket.co.kr/event/<b className="text-label-900">{initialData?.slug || 'exam'}</b></span>
            </label>
            <input
              name="slug"
              defaultValue={initialData?.slug}
              className="w-full p-2 border border-line-200 rounded-md bg-background-alternative font-mono text-sm outline-none focus:ring-2 focus:ring-primary text-label-900 placeholder:text-label-400"
              placeholder="영문, 숫자, 하이픈(-)만 입력 추천 (선택)"
            />
          </div>
        </div>

        {/* 날짜 설정 */}
        <div>
          <label className="block text-sm font-medium text-label-700 mb-1">시작일</label>
          <input
            type="datetime-local"
            name="start_date"
            defaultValue={formatDate(initialData?.start_date)}
            className="w-full p-2 border border-line-200 rounded-md outline-none focus:ring-2 focus:ring-primary text-label-900"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-label-700 mb-1">종료일</label>
          <input
            type="datetime-local"
            name="end_date"
            defaultValue={formatDate(initialData?.end_date)}
            className="w-full p-2 border border-line-200 rounded-md outline-none focus:ring-2 focus:ring-primary text-label-900"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-label-700 mb-2">상세 내용</label>
        <input type="hidden" name="content" value={content} />
        <div className="bg-white border text-label-900 border-line-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-shadow">
          <TextEditor value={content} onChange={setContent} />
        </div>
      </div>

      {/* 썸네일 URL (임시) */}
      <div>
        <label className="block text-sm font-medium text-label-700 mb-1">썸네일 이미지 URL</label>
        <input
          name="thumbnail_url"
          defaultValue={initialData?.thumbnail_url || ''}
          className="w-full p-2 border border-line-200 rounded-md outline-none focus:ring-2 focus:ring-primary text-label-900 placeholder:text-label-400"
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
          className="w-5 h-5 text-primary border-line-200 rounded focus:ring-primary"
        />
        <label htmlFor="is_finish" className="text-sm font-medium text-label-700 cursor-pointer select-none">이벤트 종료 처리하기</label>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end gap-3 pt-6 border-t border-line-200">
        <Button
          type="submit"
          variant="primary"
          size="medium"
          loading={isPending}
        >
          {initialData ? '수정 내용 저장' : '이벤트 생성하기'}
        </Button>
      </div>
    </form>
  )
}