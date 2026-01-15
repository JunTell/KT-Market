'use server'


import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import { createSupabaseServerClient } from '@/src/shared/lib/supabase/server'

// Schema Definitions
const loginSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
  password: z.string().min(1, '비밀번호를 입력해주세요.'),
  redirectTo: z.string().optional(),
})

const signupSchema = z.object({
  email: z.string().email('유효한 이메일 주소를 입력해주세요.'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다.'),
  passwordConfirm: z.string().min(6, '비밀번호는 6자 이상이어야 합니다.'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다.',
  path: ['passwordConfirm'],
})

type AuthState = {
  error: string | null
  success?: boolean
  message?: string | null
  email?: string | null
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    redirectTo: formData.get('redirectTo'),
  }

  const validatedFields = loginSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.email?.[0] ||
        validatedFields.error.flatten().fieldErrors.password?.[0] ||
        '입력 정보를 확인해주세요.'
    }
  }

  const { email, password, redirectTo } = validatedFields.data
  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message === 'Invalid login credentials') {
      return { error: '아이디 또는 비밀번호가 일치하지 않습니다.' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: '이메일 인증이 완료되지 않았습니다. 메일함을 확인해주세요.' }
    }
    return { error: error.message }
  }

  // NOTE: revalidatePath might not be needed depending on where we redirect, but good for clearing cache
  revalidatePath('/', 'layout')
  redirect(redirectTo || '/')
}

export async function signup(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    passwordConfirm: formData.get('passwordConfirm'),
  }

  const validatedFields = signupSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.email?.[0] ||
        validatedFields.error.flatten().fieldErrors.password?.[0] ||
        validatedFields.error.flatten().fieldErrors.passwordConfirm?.[0] ||
        '입력 정보를 확인해주세요.'
    }
  }

  const { email, password } = validatedFields.data
  const supabase = await createSupabaseServerClient()

  const origin = (await headers()).get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  if (data.user) {
    // Profile creation is now handled in /auth/callback after verification
  }

  return {
    error: null,
    success: true,
    message: '회원가입이 완료되었습니다. 이메일 인증을 확인하시거나 로그인해주세요.',
    email: email
  }
}

export async function logout() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
