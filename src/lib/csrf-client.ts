/**
 * Client-side CSRF utilities
 * Fetches and manages CSRF tokens for form submissions
 */

let cachedToken: string | null = null
let tokenFetchPromise: Promise<string | null> | null = null

/**
 * Fetch a fresh CSRF token from the server
 * The token is also set as a cookie by the server
 */
export async function fetchCsrfToken(): Promise<string | null> {
  // If already fetching, return the same promise
  if (tokenFetchPromise) {
    return tokenFetchPromise
  }

  // If we have a cached token, return it
  if (cachedToken) {
    return cachedToken
  }

  tokenFetchPromise = (async () => {
    try {
      const response = await fetch('/api/csrf', {
        method: 'GET',
        credentials: 'include', // Important for cookies
      })

      if (!response.ok) {
        console.error('Failed to fetch CSRF token:', response.status)
        return null
      }

      const data = await response.json()
      cachedToken = data.csrfToken || null
      return cachedToken
    } catch (error) {
      console.error('Error fetching CSRF token:', error)
      return null
    } finally {
      tokenFetchPromise = null
    }
  })()

  return tokenFetchPromise
}

/**
 * Get the cached CSRF token, or fetch a new one if not available
 */
export async function getCsrfToken(): Promise<string | null> {
  if (cachedToken) {
    return cachedToken
  }
  return fetchCsrfToken()
}

/**
 * Clear the cached token (call when token is rejected)
 */
export function clearCsrfToken(): void {
  cachedToken = null
}

/**
 * Make a fetch request with CSRF token included
 */
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getCsrfToken()

  const headers = new Headers(options.headers || {})
  if (token) {
    headers.set('x-csrf-token', token)
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Include cookies
  })

  // If we get a 403, token might be invalid - clear it
  if (response.status === 403) {
    clearCsrfToken()
  }

  return response
}
