'use client'

import { updateEventAction, deleteEventAction } from '../actions'
import { useState } from 'react'

type Event = {
  id: string
  slug: string
  category: string | null
  title: string
  content: string | null
  thumbnail_url: string | null
  start_date: string | null
  end_date: string | null
  link: string | null
  is_finish: boolean
}

export default function EditEventForm({ event }: { event: Event }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('정말로 이 이벤트를 삭제하시겠습니까?')) {
      return
    }

    setIsDeleting(true)
    try {
      await deleteEventAction(event.id)
    } catch (error) {
      alert('삭제 중 오류가 발생했습니다.')
      setIsDeleting(false)
    }
  }

  // datetime-local input을 위한 날짜 포맷 변환
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  return (
    <div className="space-y-4">
      <form action={updateEventAction.bind(null, event.id)} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">슬러그 (URL 주소) *</label>
          <input
            type="text"
            name="slug"
            defaultValue={event.slug}
            placeholder="예: new-year-event (영어, 숫자, 하이픈만)"
            required
            className="w-full p-2 border rounded"
          />
          <p className="text-xs text-gray-500">실제 주소: /events/{event.slug}</p>
        </div>

        <div>
          <label className="block mb-1 font-medium">카테고리</label>
          <select
            name="category"
            defaultValue={event.category || ''}
            className="w-full p-2 border rounded"
          >
            <option value="">선택 안함</option>
            <option value="프로모션">프로모션</option>
            <option value="신제품">신제품</option>
            <option value="할인">할인</option>
            <option value="이벤트">이벤트</option>
            <option value="공지">공지</option>
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">이벤트 제목 *</label>
          <input
            type="text"
            name="title"
            defaultValue={event.title}
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">내용</label>
          <textarea
            name="content"
            defaultValue={event.content || ''}
            rows={5}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">썸네일 이미지 URL</label>
          <input
            type="url"
            name="thumbnail_url"
            defaultValue={event.thumbnail_url || ''}
            placeholder="https://example.com/image.jpg"
            className="w-full p-2 border rounded"
          />
          <p className="text-xs text-gray-500">이미지 URL을 입력하세요</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">시작일</label>
            <input
              type="datetime-local"
              name="start_date"
              defaultValue={formatDateForInput(event.start_date)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">종료일</label>
            <input
              type="datetime-local"
              name="end_date"
              defaultValue={formatDateForInput(event.end_date)}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">외부 링크 (선택)</label>
          <input
            type="url"
            name="link"
            defaultValue={event.link || ''}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_finish"
              value="true"
              defaultChecked={event.is_finish}
              className="w-4 h-4"
            />
            <span className="font-medium">이벤트 종료</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            체크하면 이벤트가 종료된 것으로 표시됩니다
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-bold"
          >
            수정하기
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-6 bg-red-600 text-white py-3 rounded hover:bg-red-700 font-bold disabled:opacity-50"
          >
            {isDeleting ? '삭제 중...' : '삭제'}
          </button>
        </div>
      </form>
    </div>
  )
}
