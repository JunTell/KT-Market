'use client'

import { useState } from 'react'

import { Button } from '../../../shared/ui/Button'
import { deleteEventAction as deleteEvent } from "../../events/api/actions"

export default function DeleteEventButton({ id }: { id: string }) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('정말 삭제하시겠습니까? 복구할 수 없습니다.')) return

    setIsDeleting(true)
    try {
      await deleteEvent(id)
      alert('삭제되었습니다.')
    } catch {
      alert('삭제 실패')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      type="button"
      variant="danger"
      size="xsmall"
      onClick={handleDelete}
      loading={isDeleting}
    >
      삭제
    </Button>
  )
}