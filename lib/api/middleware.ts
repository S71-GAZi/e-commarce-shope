import { type NextRequest, NextResponse } from "next/server"
import type { IUser } from "@/lib/types/database"
import { UserPayload } from "../jwt"

// Parse JWT token from request headers
export function getTokenFromRequest(request: NextRequest): string | null {
  const token = request.cookies.get("authToken")?.value
  const authHeader = request.headers.get("Authorization")
  return token ? token : authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null
}

// Mock user extraction (replace with real JWT verification)
export function getUserFromToken(token: string): IUser | null {
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
export function isAdmin(user: UserPayload | null): boolean {
  // console.log("Checking admin for user:", user);
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
