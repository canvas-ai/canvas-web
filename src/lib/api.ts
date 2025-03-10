import { API_URL } from '@/config/api'

function getAppName(): string {
  let appName = localStorage.getItem('appName')
  if (!appName) {
    appName = window.location.hostname
    localStorage.setItem('appName', appName)
  }
  return appName
}

interface RequestOptions extends RequestInit {
  skipAuth?: boolean
  includeSession?: boolean
}

async function fetchWithDefaults(endpoint: string, options: RequestOptions = {}): Promise<Response> {
  const { skipAuth = false, includeSession = false, headers = {}, ...rest } = options

  // Get the auth token unless skipAuth is true
  const token = !skipAuth ? localStorage.getItem('token') : null;
  
  // Only include session header if explicitly requested
  const selectedSession = includeSession ? localStorage.getItem('selectedSession') : null;

  // Merge default headers with provided headers
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'X-App-Name': getAppName(),
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(selectedSession && { 'X-Selected-Session': selectedSession }),
    ...headers,
  }

  // Construct the full URL if a relative path is provided
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`

  const response = await fetch(url, {
    credentials: 'include',
    headers: defaultHeaders,
    ...rest,
  })

  if (!response.ok) {
    // Handle 401 Unauthorized specifically
    if (response.status === 401 && !skipAuth) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      throw new Error('Unauthorized')
    }
    // For other errors, try to get error message from response
    const errorData = await response.json().catch(() => ({
      error: response.statusText || 'An error occurred'
    }))
    
    throw new Error(errorData.error || 'Request failed')
  }

  return response
}

// Helper methods for common HTTP methods
export const api = {
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetchWithDefaults(endpoint, {
      method: 'GET',
      includeSession: !endpoint.includes('/sessions'),
      ...options,
    })
    return response.json()
  },

  async post<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    const response = await fetchWithDefaults(endpoint, {
      method: 'POST',
      includeSession: !endpoint.includes('/sessions'),
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    return response.json()
  },

  async put<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    const response = await fetchWithDefaults(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
    return response.json()
  },

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetchWithDefaults(endpoint, {
      method: 'DELETE',
      ...options,
    })
    return response.json()
  },
}