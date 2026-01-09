'use client'

import { deleteEvent } from "@/src/app/admin/event/actions"

export default function DeleteEventButton({ id }: { id: string }) {
  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까? 복구할 수 없습니다.')) return
    try {
      await deleteEvent(id)
      alert('삭제되었습니다.')
    } catch (e) {
      alert('삭제 실패')
    }
  }

  return (
    <button onClick={handleDelete} className="text-red-500 hover:text-red-700 text-xs underline ml-2">
      삭제
    </button>
  )
}