export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server"
import { getTokenFromRequest, getUserFromToken, errorResponse, successResponse } from "@/lib/api/middleware"
import { validateRequestBody, UpdateCartItemSchema } from "@/lib/api/validation"
import { cartQueries } from "@/lib/db/queries"

type RouteParams = { params: { id: string } }

// PATCH /api/cart/[id] - Update cart item quantity
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user) {
      return errorResponse("Unauthorized", 401)
    }

    const { id } = params
    const validation = await validateRequestBody(request, UpdateCartItemSchema)

    if (!validation.valid) {
      return errorResponse(validation.error, 400)
    }

    const updatedItem = await cartQueries.updateQuantity(
      id,
      user.id,
      validation.data.quantity
    )

    return successResponse(updatedItem)
  } catch (error) {
    console.error("Update cart item error:", error)
    return errorResponse("Failed to update cart item", 500)
  }
}

// DELETE /api/cart/[id] - Remove item from cart
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user) {
      return errorResponse("Unauthorized", 401)
    }

    const { id } = params

    await cartQueries.removeItem(id, user.id)

    return successResponse({ id, message: "Item removed from cart" })
  } catch (error: any) {
    console.error("Remove cart item error:", error)

    if (error.message === "Cart item not found") {
      return errorResponse("Cart item not found", 404)
    }

    return errorResponse("Failed to remove cart item", 500)
  }
}
