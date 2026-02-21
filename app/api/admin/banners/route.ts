//export const dynamic = "force-dynamic";

import { type NextRequest, NextResponse } from "next/server"
import { successResponse, errorResponse } from "@/lib/api/response-types"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body.title || !body.image_url) {
      return NextResponse.json(errorResponse("Title and image URL are required"), { status: 400 })
    }

    const banner = {
      id: `banner-${Date.now()}`,
      title: body.title,
      description: body.description || null,
      image_url: body.image_url,
      link_url: body.link_url || null,
      is_active: true,
      display_order: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // TODO: Save to banners table in database

    return NextResponse.json(successResponse(banner, "Banner created"), { status: 201 })
  } catch (error) {
    console.error("Banners API error:", error)
    return NextResponse.json(errorResponse(error instanceof Error ? error.message : "Internal server error"), {
      status: 500,
    })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const bannerId = new URL(request.url).pathname.split("/").pop()

    // TODO: Update in database

    return NextResponse.json(successResponse(body, "Banner updated"), { status: 200 })
  } catch (error) {
    console.error("Banners API error:", error)
    return NextResponse.json(errorResponse(error instanceof Error ? error.message : "Internal server error"), {
      status: 500,
    })
  }
}
