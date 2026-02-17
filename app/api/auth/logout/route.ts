import { NextResponse, type NextRequest } from "next/server"
import { successResponse } from "@/lib/api/middleware"

// export async function POST(request: NextRequest) {
//   // Mock logout - client should remove token from localStorage
//   return successResponse({
//     message: "Logged out successfully",
//   })
// }


export async function POST() {
  const response = NextResponse.json({ message: "Logged out" });

  response.cookies.set("refreshToken", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  return response;
}
