import { jwtVerify } from "jose";

export interface VerifiedAuthUser {
  id: string;
  email: string | null;
  role?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
}

const rawSecret = process.env.SUPABASE_JWT_SECRET || "";
const secretKey = rawSecret ? new TextEncoder().encode(rawSecret) : null;

export async function verifySupabaseJWT(token: string): Promise<VerifiedAuthUser | null> {
  if (!token || !secretKey) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ["HS256"],
    });

    if (!payload.sub) return null;

    return {
      id: payload.sub,
      email: (payload.email as string) || null,
      role: (payload.role as string) || undefined,
      user_metadata: (payload.user_metadata as Record<string, any>) || {},
      app_metadata: (payload.app_metadata as Record<string, any>) || {},
    };
  } catch {
    return null;
  }
}

export function extractSupabaseTokenFromCookies(
  cookies: string | { name: string; value: string }[] | { getAll: () => { name: string; value: string }[] } | null | undefined
): string | null {
  if (!cookies) return null;

  let cookieEntries: { name: string; value: string }[] = [];
  if (typeof cookies === "string") {
    const pairs = cookies.split(";");
    for (const pair of pairs) {
      const idx = pair.indexOf("=");
      if (idx === -1) continue;
      cookieEntries.push({
        name: pair.substring(0, idx).trim(),
        value: pair.substring(idx + 1).trim(),
      });
    }
  } else if (Array.isArray(cookies)) {
    cookieEntries = cookies;
  } else if (typeof (cookies as any).getAll === "function") {
    cookieEntries = (cookies as any).getAll();
  }

  const authCookies = cookieEntries.filter(
    (c) => c.name.startsWith("sb-") && c.name.includes("-auth-token")
  );
  if (authCookies.length === 0) return null;

  authCookies.sort((a, b) => {
    const aPart = a.name.split("-auth-token.")[1];
    const bPart = b.name.split("-auth-token.")[1];
    const aIdx = aPart !== undefined ? parseInt(aPart, 10) : -1;
    const bIdx = bPart !== undefined ? parseInt(bPart, 10) : -1;
    return aIdx - bIdx;
  });

  let combined = authCookies.map((c) => c.value).join("");
  if (!combined) return null;

  try {
    combined = decodeURIComponent(combined);
  } catch {}

  let rawJson = combined;
  if (rawJson.startsWith("base64-")) {
    const b64 = rawJson.substring(7);
    try {
      rawJson = Buffer.from(b64, "base64url").toString("utf8");
    } catch {
      try {
        rawJson = Buffer.from(b64, "base64").toString("utf8");
      } catch {}
    }
  }

  try {
    const parsed = JSON.parse(rawJson);
    if (typeof parsed === "object" && parsed !== null) {
      if (typeof parsed.access_token === "string") return parsed.access_token;
      if (Array.isArray(parsed) && typeof parsed[0] === "string") return parsed[0];
    }
  } catch {
    if (combined.startsWith("eyJ")) return combined;
  }

  return null;
}
