// Centralized environment variable access.
// Uses import.meta.env (Vite), process.env (Node SSR), or fallback defaults.
// Avoids $env modules which are unreliable in Yarn PnP + SSR.

function get(key: string, fallback = ''): string {
  // Vite client/SSR — import.meta.env is always available with Vite
  try {
    const val = (import.meta as unknown as Record<string, Record<string, string>>).env?.[key]
    if (val) return val
  } catch {
    // import.meta not available
  }
  // Node.js / raw SSR context
  if (typeof process !== 'undefined' && process.env?.[key]) {
    return process.env[key]!
  }
  return fallback
}

export const PUBLIC_API_URL = get('PUBLIC_API_URL', 'http://localhost:4000')
export const PUBLIC_MOCK_DATA = get('PUBLIC_MOCK_DATA', 'false')
export const PUBLIC_GOOGLE_CLIENT_ID = get('PUBLIC_GOOGLE_CLIENT_ID', '')
