//import jwt from "jsonwebtoken";
import jwt, { SignOptions } from "jsonwebtoken";


const SECRET_KEY: string = process.env.JWT_SECRET || "default_secret";
export interface UserPayload {
  id: number;
  email: string;
  role: string;
}

// export const generateToken = (user:any) => {
//   return jwt.sign(
//     { id: user.id, email: user.email, role: user.role },
//     SECRET_KEY,
//     { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
//   );
// };


export const generateToken = (user: UserPayload): string => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  //const options: SignOptions = { expiresIn: process.env.JWT_EXPIRES_IN || "1h" };
  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN || "1h") as any };


  return jwt.sign(payload, SECRET_KEY, options);
};


// export const verifyToken = (token:any) => {
//   try {
//     return jwt.verify(token, SECRET_KEY);
//   } catch (err) {
//     return null;
//   }
// };

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
