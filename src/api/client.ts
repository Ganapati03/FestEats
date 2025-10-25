const RAW_BASE = import.meta.env.VITE_API_URL || ''
export const BASE_URL = RAW_BASE.trim().replace(/\/+$/, '')

if (!BASE_URL) {
  console.error('❌ VITE_API_URL is NOT set at build time. API calls will fail or use relative paths.')
} else {
  console.info('✅ Using API base URL:', BASE_URL)
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const cleanPath = path.replace(/^\/+/, '')
  const url = BASE_URL ? `${BASE_URL}/${cleanPath}` : `/${cleanPath}`
  
  console.debug('API request:', url)
  
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })
  
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    const err = new Error(`API ${res.status} ${res.statusText}: ${body}`)
    ;(err as any).status = res.status
    throw err
  }
  
  return res.json().catch(() => null)
}
