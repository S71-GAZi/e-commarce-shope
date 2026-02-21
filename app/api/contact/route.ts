//export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server"
import { successResponse, errorResponse } from "@/lib/api/response-types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const requiredFields = ["first_name", "last_name", "email", "subject", "message"]
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(errorResponse(`${field} is required`), { status: 400 })
      }
    }

    // For now, we'll just acknowledge receipt
    const contactMessage = {
      id: `contact-${Date.now()}`,
      first_name: body.first_name,
      last_name: body.last_name,
      email: body.email,
      phone: body.phone || null,
      subject: body.subject,
      message: body.message,
      created_at: new Date().toISOString(),
      is_read: false,
    }

    // TODO: Save to contacts table in database
    // TODO: Send email notification to admin
    // TODO: Send confirmation email to user

    return NextResponse.json(successResponse(contactMessage, "Message received successfully"), { status: 200 })
  } catch (error) {
    console.error("Contact API error:", error)
    return NextResponse.json(errorResponse(error instanceof Error ? error.message : "Internal server error"), {
      status: 500,
    })
  }
}
