import { NextResponse, type NextRequest } from "next/server"

import {
  errorResponse,
  successResponse,
} from "@/lib/api/middleware"
import { productQueries } from "@/lib/db/queries"

// GET /api/discount - Get discount
export async function GET(request: NextRequest) {
  try {
    const res = await productQueries.getSpacialDiscount()
    const discount = res[0] ?? null

    return NextResponse.json(
      {
        success: true,
        data: discount,
      },
      { status: 200 }
    )
    // return successResponse({ discount })
  } catch (error) {
    return errorResponse("Failed to fetch discount", 500)
  }
}




