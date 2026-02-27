//export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server"
import {
  getTokenFromRequest,
  isAdmin,
  errorResponse,
  successResponse,
  getPaginationParams,
} from "@/lib/api/middleware"
import { validateRequestBody } from "@/lib/api/validation"
import { orderQueries } from "@/lib/db/queries"
import { getUserFromToken } from "@/lib/jwt"
import { CreateOrderSchema } from "@/lib/api/order.validation"

// GET /api/orders - Get orders for authenticated user
export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    const user = token ? getUserFromToken(token) : null

    if (!user) {
      return errorResponse("Unauthorized", 401)
    }

    const { limit, offset } = getPaginationParams(request)

    const result: any = isAdmin(user)
      ? await orderQueries.listAll(limit, offset)
      : await orderQueries.findByUserId(user.id, limit, offset)

    const orders = result.map((o: { shipping_info: string; order_items: string }) => ({
      ...o,
      shipping_info: o.shipping_info ? JSON.parse(o.shipping_info) : null,
      order_items: o.order_items ? JSON.parse(o.order_items) : []
    }))

    return successResponse({
      orders,
      pagination: { limit, offset, total: orders.length },
    })
  } catch (error) {
    console.error("Get orders error:", error)
    return errorResponse("Failed to fetch orders", 500)
  }
}
// POST /api/orders - Create new order (transaction-safe)
export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    const user = token ? getUserFromToken(token) : null;

    if (!user) {
      return errorResponse("Unauthorized", 401);
    }
    const validation = await validateRequestBody(request, CreateOrderSchema);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }

    const {
      payment,
      discount = 0,
    } = validation.data;

    const fullOrder = await orderQueries.createFullOrder({
      user_id: user.id,  // ✅ number
      payment_method: payment.payment_method,
      payment_provider: payment.payment_provider,
      payment_sender_account: payment.payment_sender_account,
      payment_transaction_id: payment.payment_transaction_id,
      discount,
      payment_status: "pending", // ✅ COD is paid immediately, mobile banking starts as pending
      status: "pending", // ✅ default status for new orders
      ip_address: null, // You can capture real IP from request in route handler and pass it here
      create_at: new Date(),
      updated_at: new Date(),
      ...validation.data
    });

    return successResponse(fullOrder, 201);

  } catch (error) {
    console.error("Create order error:", error);
    return errorResponse("Failed to create order", 500);
  }
}