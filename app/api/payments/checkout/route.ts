import type { NextRequest } from "next/server"
import { getTokenFromRequest, getUserFromToken, errorResponse, successResponse } from "@/lib/api/middleware"
import { orderQueries } from "@/lib/db/queries"

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user) {
      return errorResponse("Unauthorized", 401)
    }

    const body = await request.json()
    const { amount, couponCode } = body

    if (!amount) {
      return errorResponse("Amount is required", 400)
    }

    // Create order in database
    const order = await orderQueries.create({
      user_id: user.id,
      subtotal: amount,
      total_amount: amount,
      coupon_code: couponCode,
      payment_status: "pending",
      status: "pending",
    })

    // Mock Stripe payment intent creation
    // Replace with real Stripe integration when connected
    const paymentIntent = {
      id: `pi_${Date.now()}`,
      object: "payment_intent",
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      status: "requires_payment_method",
      client_secret: `pi_${Date.now()}_secret_${Math.random().toString(36).substring(7)}`,
      metadata: { order_id: order.id, user_id: user.id },
    }

    return successResponse({ paymentIntent, order }, 201)
  } catch (error) {
    console.error("Checkout error:", error)
    return errorResponse("Failed to create payment intent", 500)
  }
}
