import { BASE_URL } from '../api/client'

export function DebugPanel() {
  const isSet = !!BASE_URL
  
  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: isSet ? '#d4edda' : '#f8d7da',
      border: `2px solid ${isSet ? '#28a745' : '#dc3545'}`,
      color: '#000',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '11px',
      fontFamily: 'monospace',
      zIndex: 9999,
      maxWidth: '320px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
        {isSet ? '✅ API Config' : '❌ API NOT CONFIGURED'}
      </div>
      <div><strong>VITE_API_URL:</strong> {import.meta.env.VITE_API_URL || '(not set)'}</div>
      <div><strong>BASE_URL:</strong> {BASE_URL || '(empty)'}</div>
      <div><strong>Mode:</strong> {import.meta.env.MODE}</div>
      {!isSet && (
        <div style={{ marginTop: '8px', color: '#721c24', fontSize: '10px' }}>
          Set VITE_API_URL in Netlify/Vercel environment variables
        </div>
      )}
    </div>
  )
}
