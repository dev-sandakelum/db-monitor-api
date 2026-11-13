import { redis, KEY, authorized } from "../lib/common.js";

// DELETE /api/tecmis-delete?id=tecmis-notice-123 -> deletes a specific TECMIS notice
// Or with body: { "id": "tecmis-notice-123" }
export default async function handler(req, res) {
  if (!authorized(req)) return res.status(401).json({ error: "unauthorized" });

  res.setHeader("Cache-Control", "no-store");

  if (req.method === "DELETE") {
    try {
      // Get ID from query parameter or body
      let noticeId = req.query.id;
      
      if (!noticeId && req.body) {
        const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
        noticeId = body.id;
      }

      if (!noticeId) {
        return res.status(400).json({ 
          error: "Missing notice ID. Provide via ?id=tecmis-xxx or body {\"id\": \"tecmis-xxx\"}" 
        });
      }

      // Ensure it's a TECMIS item for safety
      if (!noticeId.startsWith('tecmis-')) {
        return res.status(400).json({ 
          error: "Invalid notice ID. Must start with 'tecmis-'" 
        });
      }

      // Check if the item exists
      const existing = await redis.hget(KEY, noticeId);
      
      if (!existing) {
        return res.status(404).json({ 
          error: "Notice not found",
          id: noticeId
        });
      }

      // Delete the item
      await redis.hdel(KEY, noticeId);

      return res.status(200).json({ 
        success: true,
        id: noticeId,
        message: "Notice deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting TECMIS notice:", error);
      return res.status(500).json({ error: "internal server error" });
    }
  }

  res.status(405).json({ error: "method not allowed" });
}
