import { SignJWT, jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "change-me-in-production",
);
const refreshSecret = new TextEncoder().encode(
  (process.env.AUTH_SECRET || "change-me-in-production") + "-refresh",
);
const ALG = "HS256";
const EXPIRES_IN = "15m";
const REFRESH_EXPIRES_IN = "30d";

/**
 * Sign an access token (short-lived)
 */
export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(EXPIRES_IN)
    .sign(secret);
}

/**
 * Sign a refresh token (long-lived)
 */
export async function signRefreshToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRES_IN)
    .sign(refreshSecret);
}

/**
 * Verify an access token
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

/**
 * Verify a refresh token
 */
export async function verifyRefreshToken(token) {
  try {
    const { payload } = await jwtVerify(token, refreshSecret);
    return payload;
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function getTokenFromRequest(request) {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  return auth.slice(7);
}

/**
 * Middleware helper — get authenticated user ID from request
 * Returns null if not authenticated
 */
export async function getAuthUser(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload) return null;
  return payload.userId || payload.id || null;
}
