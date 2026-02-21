//export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server"
import { successResponse, errorResponse } from "@/lib/api/response-types"

export async function DELETE(request: NextRequest) {
  try {
    const bannerId = request.nextUrl.pathname.split("/").pop()

    if (!bannerId) {
      return NextResponse.json(errorResponse("Banner ID is required"), { status: 400 })
    }

    // TODO: Delete from database

    return NextResponse.json(successResponse({ id: bannerId }, "Banner deleted"), { status: 200 })
  } catch (error) {
    console.error("Banners API error:", error)
    return NextResponse.json(errorResponse(error instanceof Error ? error.message : "Internal server error"), {
      status: 500,
    })
  }
}
