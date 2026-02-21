//export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server"
import { getTokenFromRequest, getUserFromToken, isAdmin, errorResponse, successResponse } from "@/lib/api/middleware"
import { validateRequestBody, UpdateOrderStatusSchema } from "@/lib/api/validation"
import { orderQueries } from "@/lib/db/queries"

type RouteParams = { params: { id: string } }

// GET /api/orders/[id] - Get order details
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user) {
      return errorResponse("Unauthorized", 401)
    }

    const { id } = params

    const order = await orderQueries.findById(id)

    if (!order) {
      return errorResponse("Order not found", 404)
    }

    // Verify ownership or admin access
    if (order.user_id !== user.id && !isAdmin(user)) {
      return errorResponse("Forbidden", 403)
    }

    return successResponse(order)
  } catch (error) {
    console.error("Get order error:", error)
    return errorResponse("Failed to fetch order", 500)
  }
}

// PATCH /api/orders/[id] - Update order status (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user || !isAdmin(user)) {
      return errorResponse("Unauthorized", 401)
    }

    const { id } = params
    const validation = await validateRequestBody(request, UpdateOrderStatusSchema)

    if (!validation.valid) {
      return errorResponse(validation.error, 400)
    }

    const order = await orderQueries.findById(id)
    if (!order) {
      return errorResponse("Order not found", 404)
    }

    const updatedOrder = await orderQueries.updateStatus(id, validation.data.status)

    return successResponse(updatedOrder)
  } catch (error) {
    console.error("Update order error:", error)
    return errorResponse("Failed to update order", 500)
  }
}
