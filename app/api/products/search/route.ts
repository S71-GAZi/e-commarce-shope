import type { NextRequest } from "next/server"
import { productQueries } from "@/lib/db/queries"
import { errorResponse, successResponse } from "@/lib/api/middleware"

export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q")

    if (!query || query.length < 2) {
      return errorResponse("Search query must be at least 2 characters", 400)
    }

    const results = await productQueries.search(query)

    return successResponse({
      query,
      results,
      count: results.length,
    })
  } catch (error) {
    console.error("Search products error:", error)
    return errorResponse("Failed to search products", 500)
  }
}
