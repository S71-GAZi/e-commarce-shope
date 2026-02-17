// API client for frontend to communicate with backend
// Handles authentication headers, error handling, and response parsing

import { cookies } from "next/headers"

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>
}

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl = "") {
    this.baseUrl = baseUrl
    this.loadToken()
  }

  private loadToken() {
    if (typeof window !== "undefined") {
      //const stored = localStorage.getItem("auth_token")
        const cookieStore = cookies();   // ✅ correct way
        const storedToken = cookieStore.get("auth_token")?.value ?? null;
      this.token = storedToken
    }
  }

  setToken(token: string | null) {
    this.token = token
    if (token) {
      localStorage.setItem("auth_token", token)
    } else {
      localStorage.removeItem("auth_token")
    }
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`
    }

    return headers
  }

  private async handleResponse(response: Response) {
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`)
    }

    return data
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      method: "GET",
      headers: { ...this.getHeaders(), ...options?.headers },
    })

    return this.handleResponse(response)
  }

  async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      method: "POST",
      headers: { ...this.getHeaders(), ...options?.headers },
      body: JSON.stringify(body),
    })

    return this.handleResponse(response)
  }

  async patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      method: "PATCH",
      headers: { ...this.getHeaders(), ...options?.headers },
      body: JSON.stringify(body),
    })

    return this.handleResponse(response)
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      method: "DELETE",
      headers: { ...this.getHeaders(), ...options?.headers },
    })

    return this.handleResponse(response)
  }
}

export const apiClient = new ApiClient()
