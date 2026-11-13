import { redis, KEY, authorized, isNewer } from "../../lib/common.js";

// GET /api/items/:id     -> one record
// PUT /api/items/:id     -> create/replace (last-write-wins on updatedAt)
// DELETE /api/items/:id  -> remove a record
export default async function handler(req, res) {
  if (!authorized(req)) return res.status(401).json({ error: "unauthorized" });

  const { id } = req.query;
  const existingRaw = await redis.hget(KEY, id);
  const existing = existingRaw ? (typeof existingRaw === "string" ? JSON.parse(existingRaw) : existingRaw) : null;
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    return existing ? res.status(200).json(existing) : res.status(404).json({ error: "not found" });
  }

  if (req.method === "PUT") {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const incoming = { ...body, id };
    if (isNewer(incoming, existing)) {
      await redis.hset(KEY, { [id]: JSON.stringify(incoming) });
      return res.status(200).json(incoming);
    }
    return res.status(200).json(existing); // server copy is newer
  }

  if (req.method === "DELETE") {
    await redis.hdel(KEY, id);
    return res.status(200).json({ id, deleted: true });
  }

  res.status(405).json({ error: "method not allowed" });
}
