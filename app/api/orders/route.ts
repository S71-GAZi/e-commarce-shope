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
import { orderQueries, userQueries } from "@/lib/db/queries"
import { getUserFromToken } from "@/lib/jwt"
import { CreateOrderSchema } from "@/lib/api/order.validation"
import path from "path"
import fs from "fs"
import { hashPassword } from "../auth/register/route"

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
    const validation = await validateRequestBody(request, CreateOrderSchema);
    if (!validation.valid) {
      return errorResponse(validation.error, 400);
    }
    let { payment, discount = 0, sample_image, shipping_info } = validation.data;


    const token = getTokenFromRequest(request);
    let user = token ? await getUserFromToken(token) : null;

    if (!user) {
      if (!shipping_info?.email) {
        return errorResponse("Email is required", 400);
      }

      const existingUser = await userQueries.findByEmail(shipping_info.email);

      if (existingUser) {
        user = existingUser;
      } else {
        const passwordHash = await hashPassword("12345");
        user = await userQueries.create(
          shipping_info.email,
          shipping_info.name,
          passwordHash
        );
      }
    }

    // 🔒 Final Safety Check
    if (!user) {
      return errorResponse("User creation failed", 500);
    }

    // if (!user) {
    //   return errorResponse("Unauthorized", 401);
    // }



    // ✅ STEP 1: Save base64 image if exists
    let imageUrl: string | null = null;

    if (sample_image && sample_image.startsWith("data:image")) {
      const base64Data = sample_image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const fileName = `order_${Date.now()}.jpg`;
      const uploadDir = path.join(process.cwd(), "public/uploads/orders");

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, buffer);

      imageUrl = `/uploads/orders/${fileName}`;
    }


    const fullOrder = await orderQueries.createFullOrder({
      user_id: user.id,
      payment_method: payment.payment_method,
      payment_provider: payment.payment_provider,
      payment_sender_account: payment.payment_sender_account,
      payment_transaction_id: payment.payment_transaction_id,
      discount,
      payment_status: "pending",
      status: "pending",
      ip_address: null,
      create_at: new Date(),
      updated_at: new Date(),
      tax: validation.data.tax ?? 0,
      ...validation.data,
      sample_image: imageUrl,
    });
    return successResponse(fullOrder, 201);

  } catch (error) {
    console.error("Create order error:", error);
    return errorResponse("Failed to create order", 500);
  }
}