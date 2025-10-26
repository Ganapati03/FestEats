const RAW_BASE = import.meta.env.VITE_API_URL || ''
export const BASE_URL = RAW_BASE.trim().replace(/\/+$/, '')

// Immediate log at module load
console.log('=== API Client Initialized ===')
console.log('import.meta.env.VITE_API_URL:', import.meta.env.VITE_API_URL)
console.log('Resolved BASE_URL:', BASE_URL)
console.log('================================')

if (!BASE_URL) {
  console.error('❌ CRITICAL: VITE_API_URL is NOT set!')
  console.error('Set it in Vercel: Settings → Environment Variables → Add VITE_API_URL')
} else {
  console.info('✅ API Base URL configured:', BASE_URL)
  
  // Test connectivity on load (non-blocking)
  fetch(`${BASE_URL}/health`).then(r => {
    console.log('🟢 Backend health check:', r.status, r.statusText)
  }).catch(err => {
    console.warn('⚠️ Backend unreachable:', err.message)
  })
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const cleanPath = path.replace(/^\/+/, '')
  const url = BASE_URL ? `${BASE_URL}/${cleanPath}` : `/${cleanPath}`
  
  console.log('🔵 API Request:', {
    url,
    method: options.method || 'GET',
    headers: options.headers
  })
  
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
    
    console.log('🟢 API Response:', {
      url,
      status: res.status,
      statusText: res.statusText
    })
    
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      const err = new Error(`API ${res.status} ${res.statusText}: ${body}`)
      ;(err as any).status = res.status
      ;(err as any).url = url
      console.error('🔴 API Error Response:', {
        url,
        status: res.status,
        body
      })
      throw err
    }
    
    return res.json().catch(() => null)
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    
    // Check for CORS error
    if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
      console.error('🚨 POSSIBLE CORS ERROR 🚨')
      console.error('This usually means:')
      console.error('1. Backend CORS is not configured for:', window.location.origin)
      console.error('2. Backend is down/unreachable')
      console.error('3. Wrong backend URL')
      console.error('Backend URL:', BASE_URL)
    }
    
    console.error('🔴 Network/Fetch Error:', {
      url,
      error: error.message,
      type: error.name
    })
    throw error
  }
}
