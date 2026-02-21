//export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server"
import { getTokenFromRequest, getUserFromToken, errorResponse, successResponse } from "@/lib/api/middleware"
import { validateRequestBody, AddToCartSchema } from "@/lib/api/validation"
import { cartQueries } from "@/lib/db/queries"

// GET /api/cart - Get user's cart
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user) {
      return errorResponse("Unauthorized", 401)
    }

    const items = await cartQueries.findByUserId(user.id)

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    return successResponse({
      items,
      itemCount: items.length,
      subtotal: Math.round(subtotal * 100) / 100,
      total: Math.round(subtotal * 100) / 100,
    })
  } catch (error) {
    console.error("Get cart error:", error)
    return errorResponse("Failed to fetch cart", 500)
  }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user) {
      return errorResponse("Unauthorized", 401)
    }

    const validation = await validateRequestBody(request, AddToCartSchema)

    if (!validation.valid) {
      return errorResponse(validation.error, 400)
    }

    const cartItem = await cartQueries.addItem(
      user.id,
      validation.data.product_id,
      validation.data.quantity,
      validation.data.variant_id,
    )

    return successResponse(cartItem, 201)
  } catch (error) {
    console.error("Add to cart error:", error)
    return errorResponse("Failed to add to cart", 500)
  }
}

// DELETE /api/cart - Clear entire cart
export async function DELETE(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user) {
      return errorResponse("Unauthorized", 401)
    }

    await cartQueries.clearCart(user.id)

    return successResponse({ message: "Cart cleared successfully" })
  } catch (error) {
    console.error("Clear cart error:", error)
    return errorResponse("Failed to clear cart", 500)
  }
}
