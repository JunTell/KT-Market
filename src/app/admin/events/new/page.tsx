'use client'

import { createEventAction } from '../actions'

export default function NewEventPage() {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">새 이벤트 등록</h1>
      
      <form action={createEventAction} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">슬러그 (URL 주소) *</label>
          <input
            type="text"
            name="slug"
            placeholder="예: new-year-event (영어, 숫자, 하이픈만)"
            required
            className="w-full p-2 border rounded"
          />
          <p className="text-xs text-gray-500">실제 주소: /events/new-year-event</p>
        </div>

        <div>
          <label className="block mb-1 font-medium">카테고리</label>
          <select
            name="category"
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
            required
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">내용</label>
          <textarea
            name="content"
            rows={5}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">썸네일 이미지 URL</label>
          <input
            type="url"
            name="thumbnail_url"
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
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">종료일</label>
            <input
              type="datetime-local"
              name="end_date"
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-medium">외부 링크 (선택)</label>
          <input
            type="url"
            name="link"
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 font-bold"
        >
          이벤트 생성하기
        </button>
      </form>
    </div>
  )
}