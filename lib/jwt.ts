//import jwt from "jsonwebtoken";
import jwt, { SignOptions } from "jsonwebtoken";


const SECRET_KEY: string = process.env.JWT_SECRET || "default_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET!;
export interface UserPayload {
  id: number;
  email: string;
  role: string;
}

export const generateToken = (user: UserPayload): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  //const options: SignOptions = { expiresIn: process.env.JWT_EXPIRES_IN || "1h" };
  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as any };


  return jwt.sign(payload, SECRET_KEY, options);
};



export const verifyToken = (token: string): UserPayload | null => {
  try {
    return jwt.verify(token, SECRET_KEY) as UserPayload;
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
};



export function getUserFromToken(token: string): UserPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as UserPayload;
    return decoded;
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}

export const generateRefreshToken = (user: UserPayload): string => {
  return jwt.sign(
    { id: user.id }, // keep minimal payload
    REFRESH_SECRET,
    { expiresIn: "111m" }
  );
};

// export const verifyRefreshToken = (token: string): { id: any } | null => {
//   try {
//     return jwt.verify(token, REFRESH_SECRET) as { id: number };
//   } catch {
//     return null;
//   }
// };

export const verifyRefreshToken = (token: string): { id: number } | null => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { id: number };
  } catch (error) {
    console.error("Refresh token verify error:", error);
    return null;
  }
};
