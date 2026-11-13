import { redis, KEY, authorized } from "../lib/common.js";

// DELETE /api/tecmis-delete-old -> deletes TECMIS notices that are no longer in the provided list
// Body: { "currentIds": ["tecmis-notice-123", "tecmis-file-456", ...] }
export default async function handler(req, res) {
  if (!authorized(req)) return res.status(401).json({ error: "unauthorized" });

  res.setHeader("Cache-Control", "no-store");

  if (req.method === "DELETE") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const currentIds = body.currentIds || [];

      if (!Array.isArray(currentIds)) {
        return res.status(400).json({ error: "currentIds must be an array" });
      }

      // Get all items from Redis
      const allItems = await redis.hgetall(KEY);
      
      if (!allItems || Object.keys(allItems).length === 0) {
        return res.status(200).json({ 
          deleted: 0, 
          message: "No items in Redis" 
        });
      }

      // Find TECMIS items that are NOT in the currentIds list
      const idsToDelete = [];
      
      for (const id of Object.keys(allItems)) {
        // Only consider TECMIS items
        if (id.startsWith('tecmis-') && !currentIds.includes(id)) {
          idsToDelete.push(id);
        }
      }

      if (idsToDelete.length === 0) {
        return res.status(200).json({ 
          deleted: 0, 
          message: "No old notices to delete" 
        });
      }

      // Delete the old items
      await redis.hdel(KEY, ...idsToDelete);

      return res.status(200).json({ 
        deleted: idsToDelete.length,
        deletedIds: idsToDelete,
        message: `Deleted ${idsToDelete.length} old notice(s)`
      });
    } catch (error) {
      console.error("Error deleting old TECMIS notices:", error);
      return res.status(500).json({ error: "internal server error" });
    }
  }

  res.status(405).json({ error: "method not allowed" });
}
