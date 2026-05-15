/**
 * Auth utilities — JWT (HS256) + PBKDF2 password hashing
 * Uses Web Crypto API — available in Cloudflare Workers natively.
 */

// ── Password hashing ────────────────────────────────────────────────

export async function hashPassword(password: string, saltHex?: string): Promise<string> {
  const salt = saltHex
    ? hexToBytes(saltHex)
    : crypto.getRandomValues(new Uint8Array(16));

  const keyMaterial = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password),
    "PBKDF2", false, ["deriveBits"],
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: salt as unknown as BufferSource, iterations: 100_000 },
    keyMaterial, 256,
  );
  return `${bytesToHex(salt)}:${bytesToHex(new Uint8Array(derived))}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex] = stored.split(":");
  const rehashed  = await hashPassword(password, saltHex);
  return rehashed === stored;
}

// ── JWT ─────────────────────────────────────────────────────────────

export interface JWTPayload {
  sub:     string;   // user _id
  email:   string;
  name:    string;
  role:    "farmer" | "supplier";
  iat:     number;
  exp:     number;
}

export async function signJWT(payload: Omit<JWTPayload, "iat" | "exp">, secret: string, expiresInSec = 60 * 60 * 24 * 7): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const full: JWTPayload = { ...payload, iat: now, exp: now + expiresInSec };

  const header  = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body    = b64url(JSON.stringify(full));
  const sig     = await hmacSign(`${header}.${body}`, secret);

  return `${header}.${body}.${sig}`;
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const [header, body, sig] = token.split(".");
    const expected = await hmacSign(`${header}.${body}`, secret);
    if (sig !== expected) return null;

    const payload = JSON.parse(atob(body.replace(/-/g, "+").replace(/_/g, "/"))) as JWTPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── Helpers ─────────────────────────────────────────────────────────

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return bytesToB64url(new Uint8Array(sig));
}

function b64url(str: string): string {
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function bytesToB64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
  return bytes;
}
