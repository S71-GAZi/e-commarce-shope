//export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server"
import {
  getTokenFromRequest,
  getUserFromToken,
  isAdmin,
  errorResponse,
  successResponse,
  getPaginationParams,
} from "@/lib/api/middleware"
import { validateRequestBody, CreateOrderSchema } from "@/lib/api/validation"
import { orderQueries } from "@/lib/db/queries"

// GET /api/orders - Get orders for authenticated user
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user) {
      return errorResponse("Unauthorized", 401)
    }

    const { limit, offset } = getPaginationParams(request)

    const orders = isAdmin(user)
      ? await orderQueries.listAll(limit, offset)
      : await orderQueries.findByUserId(user.id, limit, offset)

    return successResponse({
      orders,
      pagination: { limit, offset, total: orders.length },
    })
  } catch (error) {
    console.error("Get orders error:", error)
    return errorResponse("Failed to fetch orders", 500)
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user) {
      return errorResponse("Unauthorized", 401)
    }

    const validation = await validateRequestBody(request, CreateOrderSchema)

    if (!validation.valid) {
      return errorResponse(validation.error, 400)
    }

    const newOrder = await orderQueries.create({
      user_id: user.id,
      ...validation.data,
    })

    return successResponse(newOrder, 201)
  } catch (error) {
    console.error("Create order error:", error)
    return errorResponse("Failed to create order", 500)
  }
}
