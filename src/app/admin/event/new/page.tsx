import EventForm from "@/src/features/admin/components/EventForm";

export default function NewEventPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">새 이벤트 생성</h1>
      <EventForm />
    </div>
  )
}