import { jwtDecode } from "jwt-decode";

export interface DecodedToken {
  sub: string;        // username
  userId: string;
  roles?: string[];
  claims?: string[];
  exp: number;
  iat: number;
}

export function getDecodedToken(): DecodedToken | null {
  const token = sessionStorage.getItem("accessToken");
  if (!token) return null;
  try {
    return jwtDecode<DecodedToken>(token);
  } 
  catch (err) {
    console.error("Invalid JWT:", err);
    return null;
  }
}
