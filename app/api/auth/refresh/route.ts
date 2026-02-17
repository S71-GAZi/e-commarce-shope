import { NextResponse } from "next/server";
import { verifyRefreshToken, generateToken, generateRefreshToken } from "@/lib/jwt";
import { userQueries } from "@/lib/db/queries"
import { cookies } from "next/headers";


export async function POST(req: Request) {
  //const refreshToken = req.cookies.get("refreshToken")?.value;
  const cookieStore = cookies();   // ✅ correct way
  const refreshToken = cookieStore.get("refreshToken")?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    return NextResponse.json({ message: "Invalid token" }, { status: 403 });
  }

  // fetch user from DB
  //const user = await getUserById(decoded.id);
  const user = await userQueries.findById(decoded.id as any)


  const newAccessToken = generateToken(user as any);
  const newRefreshToken = generateRefreshToken(user as any);

  const response = NextResponse.json({user : user,accessToken: newAccessToken });

  response.cookies.set("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
  });

  return response;
}
