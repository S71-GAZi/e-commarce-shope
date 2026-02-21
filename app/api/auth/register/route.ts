//export const dynamic = "force-dynamic";

import type { NextRequest } from "next/server"
import { validateRequestBody, RegisterSchema } from "@/lib/api/validation"
import { errorResponse, successResponse } from "@/lib/api/middleware"
import { userQueries } from "@/lib/db/queries"
import crypto from "crypto"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

function generateToken(userId: string): string {
  return crypto.randomBytes(32).toString("hex")
}

export async function POST(request: NextRequest) {
  try {
    const validation = await validateRequestBody(request, RegisterSchema)

    if (!validation.valid) {
      return errorResponse(validation.error, 400)
    }

    const { email, password, full_name } = validation.data

    const existingUser = await userQueries.findByEmail(email)
    if (existingUser) {
      return errorResponse("Email already exists", 409)
    }

    const passwordHash = hashPassword(password)
    const newUser = await userQueries.create(email, full_name, passwordHash)

    if (!newUser) {
      return errorResponse("Failed to create user", 500)
    }

    const token = generateToken(newUser.id)

    return successResponse(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          role: newUser.role,
          email_verified: newUser.email_verified,
        },
        token,
        expiresIn: 86400,
      },
      201,
    )
  } catch (error) {
    console.error("[v0] Register error:", error)
    return errorResponse("Internal server error", 500)
  }
}
