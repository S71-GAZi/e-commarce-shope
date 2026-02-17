import type { NextRequest } from "next/server"
import { getTokenFromRequest, getUserFromToken, isAdmin, errorResponse, successResponse } from "@/lib/api/middleware"
import { validateRequestBody, CreateCategorySchema } from "@/lib/api/validation"
import { categoryQueries } from "@/lib/db/queries"

type RouteParams = { params: { id: string } }

// PATCH /api/admin/categories/[id]
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user || !isAdmin(user as any)) {
      return errorResponse("Unauthorized", 401)
    }

    const { id } = params
    const validation = await validateRequestBody(request, CreateCategorySchema.partial())

    if (!validation.valid) {
      return errorResponse(validation.error, 400)
    }

    const updatedCategory = await categoryQueries.update(id, validation.data)

    return successResponse(updatedCategory)
  } catch (error) {
    console.error("Update category error:", error)
    return errorResponse("Failed to update category", 500)
  }
}

// DELETE /api/admin/categories/[id]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user || !isAdmin(user as any)) {
      return errorResponse("Unauthorized", 401)
    }

    const { id } = params

    await categoryQueries.delete(id)

    return successResponse({ id, message: "Category deleted successfully" })
  } catch (error) {
    console.error("Delete category error:", error)
    return errorResponse("Failed to delete category", 500)
  }
}
