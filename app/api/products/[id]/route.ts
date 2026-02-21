import type { NextRequest } from "next/server"
import { getTokenFromRequest, isAdmin, getUserFromToken, errorResponse, successResponse } from "@/lib/api/middleware"
import { validateRequestBody, UpdateProductSchema } from "@/lib/api/validation"
import { productQueries } from "@/lib/db/queries"

type RouteParams = { params: { id: string } }

// GET /api/products/[id] - Get product by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = params
    console.log(id)
    const product = await productQueries.findById(id)

    if (!product) {
      return errorResponse("Product not found", 404)
    }

    return successResponse(product)
  } catch (error) {
    console.error("Get product error:", error)
    return errorResponse("Failed to fetch product", 500)
  }
}

// PATCH /api/products/[id] - Update product (admin only)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user || !isAdmin(user)) {
      return errorResponse("Unauthorized", 401)
    }

    const { id } = params
    const validation = await validateRequestBody(request, UpdateProductSchema)

    if (!validation.valid) {
      return errorResponse(validation.error, 400)
    }

    const product = await productQueries.findById(id)
    if (!product) {
      return errorResponse("Product not found", 404)
    }

    const updatedProduct = await productQueries.update(id, validation.data)

    return successResponse(updatedProduct)
  } catch (error) {
    console.error("Update product error:", error)
    return errorResponse("Failed to update product", 500)
  }
}

// DELETE /api/products/[id] - Delete product (admin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user || !isAdmin(user)) {
      return errorResponse("Unauthorized", 401)
    }

    const { id } = params

    const product = await productQueries.findById(id)
    if (!product) {
      return errorResponse("Product not found", 404)
    }

    await productQueries.delete(id)

    return successResponse({ id, message: "Product deleted successfully" })
  } catch (error) {
    console.error("Delete product error:", error)
    return errorResponse("Failed to delete product", 500)
  }
}
