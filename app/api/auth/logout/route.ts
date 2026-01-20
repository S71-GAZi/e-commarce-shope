import type { NextRequest } from "next/server"
import { successResponse } from "@/lib/api/middleware"

export async function POST(request: NextRequest) {
  // Mock logout - client should remove token from localStorage
  return successResponse({
    message: "Logged out successfully",
  })
}
