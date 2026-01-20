import type { NextRequest } from "next/server"
import { getProducts } from "@/lib/db-utils"
import {
  getTokenFromRequest,
  isAdmin,
  getUserFromToken,
  errorResponse,
  successResponse,
  getPaginationParams,
} from "@/lib/api/middleware"
import { validateRequestBody, CreateProductSchema } from "@/lib/api/validation"
import { productQueries } from "@/lib/db/queries"

// GET /api/products - Get all products
export async function GET(request: NextRequest) {
  try {
    const { limit, offset } = getPaginationParams(request)
    const category = request.nextUrl.searchParams.get("category")
    const search = request.nextUrl.searchParams.get("search")
    const featured = request.nextUrl.searchParams.get("featured") === "true"

    const products = await getProducts({
      category: category || undefined,
      search: search || undefined,
      featured,
      limit,
      offset,
    })

    return successResponse({
      products,
      pagination: {
        limit,
        offset,
        total: products.length,
      },
    })
  } catch (error) {
    console.error("Get products error:", error)
    return errorResponse("Failed to fetch products", 500)
  }
}

// POST /api/products - Create new product (admin only)
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user || !isAdmin(user)) {
      return errorResponse("Unauthorized", 401)
    }

    const validation = await validateRequestBody(request, CreateProductSchema)

    if (!validation.valid) {
      return errorResponse(validation.error, 400)
    }

    const newProduct = await productQueries.create(validation.data)

    return successResponse(newProduct, 201)
  } catch (error) {
    console.error("Create product error:", error)
    return errorResponse("Failed to create product", 500)
  }
}
