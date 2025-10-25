const RAW_BASE = import.meta.env.VITE_API_URL || ''
export const BASE_URL = RAW_BASE.trim().replace(/\/+$/, '')

// Log at startup so you can verify the variable in browser console
if (!BASE_URL) {
  console.error('❌ VITE_API_URL is NOT set. API calls will fail.')
} else {
  console.info('✅ API Base URL:', BASE_URL)
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const cleanPath = path.replace(/^\/+/, '')
  const url = BASE_URL ? `${BASE_URL}/${cleanPath}` : `/${cleanPath}`
  
  console.log('🔵 API Request:', url, options)
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    
    console.log('🟢 API Response:', res.status, res.statusText, url)
    
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      const err = new Error(`API ${res.status} ${res.statusText}: ${body}`)
      ;(err as any).status = res.status
      console.error('🔴 API Error:', err, url)
      throw err
    }
    
    return res.json().catch(() => null)
  } catch (err) {
    console.error('🔴 Network/Fetch Error:', err, url)
    throw err
  }
}
