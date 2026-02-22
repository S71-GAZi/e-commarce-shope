export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server"
import {
  getTokenFromRequest,
  // getUserFromToken,
  isAdmin,
  errorResponse,
  successResponse,
  getPaginationParams,
} from "@/lib/api/middleware"
import { userQueries } from "@/lib/db/queries"
import { getUserFromToken } from "@/lib/jwt";

// GET /api/admin/customers
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user || !isAdmin(user)) {
      return errorResponse("Unauthorized", 401)
    }

    const { limit, offset } = getPaginationParams(request)

    const customers = await userQueries.listAllCustomers(limit, offset)

    return successResponse({
      customers,
      pagination: { limit, offset, total: customers.length },
    })
  } catch (error) {
    console.error("Get customers error:", error)
    return errorResponse("Failed to fetch customers", 500)
  }
}
