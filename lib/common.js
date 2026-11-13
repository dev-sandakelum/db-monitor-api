import { Redis } from "@upstash/redis";

// Works with both Upstash-native and Vercel Marketplace (KV_*) env var names
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

export const KEY = "items";

// Accepts "Authorization: Bearer <token>", "X-API-Key: <token>" or "?key=<token>"
export function authorized(req) {
  const token = process.env.API_TOKEN;
  if (!token) return false;
  const bearer = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  return bearer === token || req.headers["x-api-key"] === token || req.query?.key === token;
}

export function isNewer(incoming, existing) {
  if (!existing) return true;
  return new Date(incoming.updatedAt || 0) >= new Date(existing.updatedAt || 0);
}
