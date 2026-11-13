import { redis, KEY, authorized } from "../../lib/common.js";

// GET /api/items  ->  JSON array of all records
export default async function handler(req, res) {
  if (!authorized(req)) return res.status(401).json({ error: "unauthorized" });
  if (req.method !== "GET") return res.status(405).json({ error: "method not allowed" });

  const all = (await redis.hgetall(KEY)) || {};
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json(Object.values(all));
}
