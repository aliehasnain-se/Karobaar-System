const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

let accessToken: string | null = null
let refreshRequest: Promise<AuthResponse> | null = null

export type AuthUser = {
  id: number
  username: string
  first_name: string
  last_name: string
  role: 'OWNER'
}

export type AuthResponse = {
  access: string
  user: AuthUser
}

export class ApiError extends Error {
  status: number
  details: unknown

  constructor(message: string, status: number, details?: unknown) {
    super(message)
    this.status = status
    this.details = details
  }
}

function firstErrorText(value: unknown): string | null {
  if (typeof value === 'string') return value
  if (Array.isArray(value)) {
    for (const item of value) {
      const message = firstErrorText(item)
      if (message) return message
    }
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) {
      const message = firstErrorText(item)
      if (message) return message
    }
  }
  return null
}

async function parseResponse<T>(response: Response): Promise<T> {
  const data =
    response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    const message = data?.detail || firstErrorText(data) || 'Request could not be completed.'
    throw new ApiError(message, response.status, data)
  }
  return data as T
}

export function setAccessToken(token: string | null) {
  accessToken = token
}

export async function loginRequest(username: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  const data = await parseResponse<AuthResponse>(response)
  setAccessToken(data.access)
  return data
}

export async function refreshSession() {
  if (!refreshRequest) {
    refreshRequest = fetch(`${API_BASE_URL}/auth/refresh/`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(parseResponse<AuthResponse>)
      .then((data) => {
        setAccessToken(data.access)
        return data
      })
      .finally(() => {
        refreshRequest = null
      })
  }
  return refreshRequest
}

export async function logoutRequest() {
  await apiFetch<void>('/auth/logout/', { method: 'POST' })
  setAccessToken(null)
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body && !headers.has('Content-Type'))
    headers.set('Content-Type', 'application/json')
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (response.status === 401 && retry && !path.startsWith('/auth/')) {
    try {
      await refreshSession()
      return apiFetch<T>(path, options, false)
    } catch {
      setAccessToken(null)
      window.location.assign('/login')
    }
  }

  return parseResponse<T>(response)
}
