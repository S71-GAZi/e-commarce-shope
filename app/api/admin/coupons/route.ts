import type { NextRequest } from "next/server"
import {
  getTokenFromRequest,
  getUserFromToken,
  isAdmin,
  errorResponse,
  successResponse,
  getPaginationParams,
} from "@/lib/api/middleware"
import { validateRequestBody, CreateCouponSchema } from "@/lib/api/validation"
import { couponQueries } from "@/lib/db/queries"

// GET /api/admin/coupons
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user || !isAdmin(user as any)) {
      return errorResponse("Unauthorized", 401)
    }

    const { limit, offset } = getPaginationParams(request)

    const coupons = await couponQueries.listAll(limit, offset)

    return successResponse({ coupons, pagination: { limit, offset, total: coupons.length } })
  } catch (error) {
    console.error("Get coupons error:", error)
    return errorResponse("Failed to fetch coupons", 500)
  }
}

// POST /api/admin/coupons
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user || !isAdmin(user as any)) {
      return errorResponse("Unauthorized", 401)
    }

    const validation = await validateRequestBody(request, CreateCouponSchema)

    if (!validation.valid) {
      return errorResponse(validation.error, 400)
    }

    const newCoupon = await couponQueries.create(validation.data)

    return successResponse(newCoupon, 201)
  } catch (error) {
    console.error("Create coupon error:", error)
    return errorResponse("Failed to create coupon", 500)
  }
}
