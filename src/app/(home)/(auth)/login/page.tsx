import LoginForm from "@/src/components/ui/LoginForm";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';


export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400">잠시만 기다려주세요...</div>}>
      <LoginForm />
    </Suspense>
  )
}