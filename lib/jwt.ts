//import jwt from "jsonwebtoken";
import jwt, { SignOptions } from "jsonwebtoken";


const SECRET_KEY: string = process.env.JWT_SECRET || "default_secret";
const REFRESH_SECRET = process.env.REFRESH_SECRET!;
export interface IUserPayload {
  id: number;
  email: string;
  role: string;
}

export const generateToken = (user: IUserPayload): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  //const options: SignOptions = { expiresIn: process.env.JWT_EXPIRES_IN || "1h" };
  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || "1d") as any };


  return jwt.sign(payload, SECRET_KEY, options);
};



export const verifyToken = (token: string): IUserPayload | null => {
  try {
    return jwt.verify(token, SECRET_KEY) as IUserPayload;
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
};



export function getUserFromToken(token: string): IUserPayload | null {
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as IUserPayload;
    return decoded;
  } catch (err) {
    console.error("Invalid token:", err);
    return null;
  }
}

export const generateRefreshToken = (user: IUserPayload): string => {
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
