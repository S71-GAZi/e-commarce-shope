import type { NextRequest } from "next/server"
import { successResponse, errorResponse } from "@/lib/api/middleware"
import { orderQueries } from "@/lib/db/queries"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    // Mock Stripe webhook handling
    // In production, verify webhook signature with Stripe

    switch (type) {
      case "payment_intent.succeeded": {
        const orderId = data.payment_intent?.metadata?.order_id
        if (orderId) {
          await orderQueries.updateStatus(orderId, "processing", "paid")
          console.log("Order marked as paid:", orderId)
        }
        break
      }
      case "payment_intent.payment_failed": {
        const orderId = data.payment_intent?.metadata?.order_id
        if (orderId) {
          await orderQueries.updateStatus(orderId, "cancelled", "failed")
          console.log("Order marked as failed:", orderId)
        }
        break
      }
      default:
        console.log("Unhandled webhook type:", type)
    }

    return successResponse({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return errorResponse("Webhook processing failed", 500)
  }
}
