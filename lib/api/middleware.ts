import { type NextRequest, NextResponse } from "next/server"
import type { User } from "@/lib/types/database"

// Parse JWT token from request headers
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  return authHeader.slice(7)
}

// Mock user extraction (replace with real JWT verification)
export function getUserFromToken(token: string): User | null {
  // In production, verify JWT token here
  // For now, returning mock user for demo
  if (token === "mock-token-customer") {
    return {
      id: "user-1",
      email: "demo@example.com",
      full_name: "Demo User",
      role: "customer",
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
  if (token === "mock-token-admin") {
    return {
      id: "user-2",
      email: "admin@example.com",
      full_name: "Admin User",
      role: "admin",
      email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  }
  return null
}

// Check if user has admin access
export function isAdmin(user: User | null): boolean {
  return user?.role === "admin" || user?.role === "manager"
}

// Generic error response helper
export function errorResponse(message: string, status = 400, details?: any) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details && { details }),
    },
    { status },
  )
}

// Generic success response helper
export function successResponse(data: any, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status },
  )
}

// Pagination helper
export function getPaginationParams(request: NextRequest) {
  const page = Math.max(1, Number.parseInt(request.nextUrl.searchParams.get("page") || "1"))
  const limit = Math.min(100, Number.parseInt(request.nextUrl.searchParams.get("limit") || "20"))
  const offset = (page - 1) * limit
  return { page, limit, offset }
}
