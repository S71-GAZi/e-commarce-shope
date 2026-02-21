//export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server"
import { errorResponse, successResponse } from "@/lib/api/middleware"
import { couponQueries } from "@/lib/db/queries"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { couponCode, cartTotal } = body

    if (!couponCode) {
      return errorResponse("Coupon code is required", 400)
    }

    // Find coupon in database
    const coupon = await couponQueries.findByCode(couponCode.toUpperCase())

    if (!coupon) {
      return errorResponse("Invalid coupon code", 404)
    }

    // Validate coupon conditions
    if (coupon.min_purchase_amount && cartTotal < coupon.min_purchase_amount) {
      return errorResponse(`Minimum purchase amount of $${coupon.min_purchase_amount} required`, 400)
    }

    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return errorResponse("Coupon usage limit exceeded", 400)
    }

    // Calculate discount
    let discount = 0
    if (coupon.discount_type === "percentage") {
      discount = (cartTotal * coupon.discount_value) / 100
      if (coupon.max_discount_amount) {
        discount = Math.min(discount, coupon.max_discount_amount)
      }
    } else {
      discount = coupon.discount_value
    }

    return successResponse({
      coupon: {
        code: coupon.code,
        discount_type: coupon.discount_type,
        discount_value: coupon.discount_value,
      },
      discount: Math.round(discount * 100) / 100,
      subtotal: cartTotal,
      total: Math.max(0, Math.round((cartTotal - discount) * 100) / 100),
    })
  } catch (error) {
    console.error("Validate coupon error:", error)
    return errorResponse("Failed to validate coupon", 500)
  }
}
