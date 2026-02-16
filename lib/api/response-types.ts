// Standard API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  details?: any
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface ApiErrorResponse {
  success: false
  error: string
  details?: Record<string, any>
}


/* ================= SUCCESS RESPONSE ================= */
export function successResponse<T>(
  data?: T,
  message = "Request successful"
): ApiResponse<T> {
  return {
    success: true,
    data,
  }
}

/* ================= ERROR RESPONSE ================= */
export function errorResponse(
  message = "Something went wrong"
): ApiResponse {
  return {
    success: false,
    error: message,
  }
}
