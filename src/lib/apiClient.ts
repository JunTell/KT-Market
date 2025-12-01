export async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error('API 요청 실패')
  }

  return res.json()
}