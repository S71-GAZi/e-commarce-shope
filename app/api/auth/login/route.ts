import type { NextRequest } from "next/server"
import { validateRequestBody, LoginSchema } from "@/lib/api/validation"
import { errorResponse, successResponse } from "@/lib/api/middleware"
import { userQueries } from "@/lib/db/queries"
import crypto from "crypto"
import { cookies } from "next/headers"
import { generateToken } from "@/lib/jwt"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

// function generateToken(userId: string): string {
//   return crypto.randomBytes(32).toString("hex")
// }

export async function POST(request: NextRequest) {
  try {
    const validation = await validateRequestBody(request, LoginSchema)

    if (!validation.valid) {
      return errorResponse(validation.error, 400)
    }

    const { email, password } = validation.data

    const user = await userQueries.findByEmail(email)

    if (!user) {
      return errorResponse("Invalid email or password", 401)
    }

    // Hash the provided password and compare with stored hash
    const passwordHash = hashPassword(password)

    if (user.password_hash !== passwordHash) {
      return errorResponse("Invalid email or password", 401)
    }

    const token = generateToken(user)

    cookies().set("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        email_verified: user.email_verified,
      },
      token,
      expiresIn: process.env.JWT_EXPIRES_IN,
    })
  } catch (error) {
    console.error("Login error:", error)
    return errorResponse("Internal server error", 500)
  }
}
