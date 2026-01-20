import type { NextRequest } from "next/server"
import { getTokenFromRequest, getUserFromToken, isAdmin, errorResponse, successResponse } from "@/lib/api/middleware"
import { validateRequestBody, CreateCategorySchema } from "@/lib/api/validation"
import { categoryQueries } from "@/lib/db/queries"

// GET /api/admin/categories
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user || !isAdmin(user)) {
      return errorResponse("Unauthorized", 401)
    }

    const categories = await categoryQueries.listAll()

    return successResponse({ categories })
  } catch (error) {
    console.error("Get categories error:", error)
    return errorResponse("Failed to fetch categories", 500)
  }
}

// POST /api/admin/categories
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user || !isAdmin(user)) {
      return errorResponse("Unauthorized", 401)
    }

    const validation = await validateRequestBody(request, CreateCategorySchema)

    if (!validation.valid) {
      return errorResponse(validation.error, 400)
    }

    const newCategory = await categoryQueries.create(validation.data)

    return successResponse(newCategory, 201)
  } catch (error) {
    console.error("Create category error:", error)
    return errorResponse("Failed to create category", 500)
  }
}
