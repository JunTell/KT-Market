# Supabase 인증 및 세션 관리 가이드

Next.js + @supabase/ssr을 사용한 쿠키 기반 세션 관리 구현

## 🏗️ 아키텍처 개요

이 프로젝트는 Supabase Auth를 사용하여 안전한 세션 관리를 구현합니다.
클라이언트와 서버에서 각각 다른 방식으로 세션을 관리합니다.

### 클라이언트 (브라우저)
- **저장 위치**: `localStorage`
- **접근 방식**: JavaScript에서 직접 접근 가능
- **포함 데이터**: Access Token, Refresh Token, Provider Token (카카오, 구글 등)
- **사용 위치**: Client Components

### 서버 (Middleware, Server Components, Route Handlers)
- **저장 위치**: HTTP-Only + Secure 쿠키 (`sb-...-auth-token`)
- **접근 방식**: 서버에서만 접근 가능
- **보안**: 클라이언트 JavaScript에서 읽을 수 없음
- **사용 위치**: Middleware, Server Components, Route Handlers, Server Actions

---

## 📁 파일 구조

```
src/
├── lib/supabase/
│   ├── client.ts          # 클라이언트용 (localStorage)
│   └── server.ts          # 서버용 (쿠키 기반)
├── app/
│   ├── middleware.ts      # 인증 미들웨어
│   ├── login/page.tsx     # 로그인 페이지 (Client Component)
│   ├── admin/
│   │   ├── layout.tsx     # Admin 레이아웃 (Server Component)
│   │   └── event/page.tsx # 이벤트 페이지 (Server Component)
│   └── api/auth/
│       ├── me/route.ts    # 사용자 정보 API
│       └── logout/route.ts # 로그아웃 API
└── actions/
    └── auth.ts            # Server Actions
```

---

## 🔧 사용법

### 1. Client Component (브라우저)

```tsx
'use client'

import { supabaseClient } from '@/src/lib/supabase/client'

export default function LoginPage() {
  // 이메일/비밀번호 로그인
  const handleLogin = async () => {
    const { error } = await supabaseClient.auth.signInWithPassword({
      email: 'user@example.com',
      password: 'password',
    })
  }

  // OAuth 로그인 (카카오, 구글 등)
  const handleOAuthLogin = async () => {
    await supabaseClient.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: '/admin',
      },
    })
  }

  return (
    <button onClick={handleLogin}>로그인</button>
  )
}
```

**특징**:
- `localStorage`에 세션 저장
- 클라이언트에서 직접 인증 처리
- OAuth provider_token 포함

---

### 2. Middleware (쿠키 기반 인증)

```tsx
// src/app/middleware.ts
import { createMiddlewareClient } from '@/src/lib/supabase/server'

export async function middleware(req: NextRequest) {
  // Middleware 전용 클라이언트 생성
  const { supabase, response } = createMiddlewareClient(req)

  // 쿠키에서 사용자 정보 가져오기
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // 갱신된 쿠키가 포함된 response 반환
  return response
}
```

**특징**:
- `req.cookies`에서 세션 쿠키 읽기
- `res.cookies`에 갱신된 세션 쿠키 쓰기
- HTTP-Only + Secure 플래그로 보안 유지
- 세션 자동 갱신

---

### 3. Server Component

```tsx
// src/app/admin/layout.tsx
import { createSupabaseServerClient } from '@/src/lib/supabase/server'

export default async function AdminLayout() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()

  // 데이터베이스 쿼리
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div>
      <p>환영합니다, {user?.email}</p>
      {/* ... */}
    </div>
  )
}
```

**특징**:
- `cookies()`를 통해 HTTP-Only 쿠키 접근
- Server Component에서는 쿠키 읽기만 가능
- 쿠키 쓰기는 Route Handler/Server Action에서만 가능

---

### 4. Route Handler (API Routes)

```tsx
// src/app/api/auth/me/route.ts
import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json(
      { error: '인증되지 않은 사용자입니다.' },
      { status: 401 }
    )
  }

  return NextResponse.json({ user })
}
```

**특징**:
- `cookies().set()`이 정상 작동
- 세션 쿠키를 읽고 쓸 수 있음
- RESTful API 엔드포인트 구현

---

### 5. Server Actions

```tsx
// src/actions/auth.ts
'use server'

import { createSupabaseServerClient } from '@/src/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createSupabaseServerClient()

  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/login')
}
```

**클라이언트에서 사용**:
```tsx
'use client'

import { signOut } from '@/src/actions/auth'

export function LogoutButton() {
  return (
    <button onClick={() => signOut()}>
      로그아웃
    </button>
  )
}
```

**특징**:
- `'use server'` 지시문 필요
- Form 또는 클라이언트에서 직접 호출 가능
- 쿠키 읽기/쓰기 모두 가능
- `revalidatePath`, `redirect` 등 서버 기능 사용 가능

---

## 🔐 보안 고려사항

### HTTP-Only 쿠키
```
Set-Cookie: sb-xxx-auth-token=...; HttpOnly; Secure; SameSite=Lax
```

- **HttpOnly**: JavaScript로 접근 불가 → XSS 공격 방어
- **Secure**: HTTPS에서만 전송 → 중간자 공격 방어
- **SameSite**: CSRF 공격 방어

### 세션 자동 갱신

Middleware에서 자동으로 세션을 갱신합니다:
```tsx
const { supabase, response } = createMiddlewareClient(req)
await supabase.auth.getUser() // 세션 만료 시 자동 갱신
return response // 갱신된 쿠키 포함
```

### localStorage vs 쿠키

| 구분 | localStorage | HTTP-Only 쿠키 |
|------|--------------|----------------|
| 접근 | JavaScript O | JavaScript X |
| XSS 취약 | 예 | 아니오 |
| CSRF 취약 | 아니오 | SameSite로 방어 |
| 서버 전송 | 수동 | 자동 |
| 용도 | Client Component | Server Component |

---

## 🔄 세션 흐름

### 로그인 흐름
```
1. Client: supabaseClient.auth.signInWithPassword()
   → localStorage에 세션 저장

2. Browser: 페이지 새로고침 또는 네비게이션

3. Middleware: createMiddlewareClient(req)
   → localStorage에서 쿠키로 세션 마이그레이션
   → HTTP-Only 쿠키 설정

4. Server: createSupabaseServerClient()
   → 쿠키에서 세션 읽기
```

### OAuth 로그인 흐름 (카카오, 구글)
```
1. Client: supabaseClient.auth.signInWithOAuth({ provider: 'kakao' })
   → 카카오 로그인 페이지로 리다이렉트

2. Kakao: 사용자 인증 후 콜백 URL로 리다이렉트
   → code 파라미터와 함께 반환

3. Supabase: code를 세션으로 교환
   → localStorage에 세션 저장 (provider_token 포함)

4. Middleware: 다음 요청 시 쿠키로 마이그레이션
```

---

## 🧪 테스트 방법

### 1. 쿠키 확인 (Chrome DevTools)
```
Application → Cookies → http://localhost:3000
→ sb-xxx-auth-token 확인
→ HttpOnly, Secure 플래그 확인
```

### 2. localStorage 확인
```javascript
// Console에서 실행
localStorage.getItem('sb-xxx-auth-token')
```

### 3. API 테스트
```bash
# 로그인 후
curl http://localhost:3000/api/auth/me \
  -H "Cookie: sb-xxx-auth-token=..."

# 로그아웃
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Cookie: sb-xxx-auth-token=..."
```

---

## 📚 참고 자료

- [Supabase SSR 문서](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [HTTP-Only Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies)
- [@supabase/ssr](https://github.com/supabase/auth-helpers)

---

## ⚠️ 주의사항

1. **Server Component에서 쿠키 쓰기 불가**
   - Server Component에서는 `cookies().set()`이 작동하지 않음
   - Route Handler 또는 Server Action 사용

2. **Middleware에서 createSupabaseServerClient 사용 금지**
   - 반드시 `createMiddlewareClient` 사용
   - NextRequest/NextResponse의 쿠키 API 필요

3. **환경 변수 필수**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   ```

4. **Redirect URL 설정**
   - Supabase Dashboard → Authentication → URL Configuration
   - Redirect URLs에 `http://localhost:3000/**` 추가
   - Production URL도 추가 필요
