import { redis, KEY, authorized } from "../lib/common.js";

// GET /api/tecmis-last-date -> returns the latest posted_at date from TECMIS notices
export default async function handler(req, res) {
  if (!authorized(req)) return res.status(401).json({ error: "unauthorized" });

  res.setHeader("Cache-Control", "no-store");

  if (req.method === "GET") {
    try {
      // Get all items from Redis
      const allItems = await redis.hgetall(KEY);
      
      if (!allItems || Object.keys(allItems).length === 0) {
        return res.status(200).json({ lastDate: null });
      }

      // Filter for TECMIS items and find the latest date
      let latestDate = null;
      
      for (const [id, value] of Object.entries(allItems)) {
        if (!id.startsWith('tecmis-')) continue;
        
        const item = typeof value === "string" ? JSON.parse(value) : value;
        
        // Extract the posted_at date from the body if it exists
        const bodyMatch = item.body?.match(/\*\*Posted:\*\* (.+)/);
        if (bodyMatch) {
          const postedAt = bodyMatch[1].trim();
          if (!latestDate || postedAt > latestDate) {
            latestDate = postedAt;
          }
        }
      }

      return res.status(200).json({ lastDate: latestDate });
    } catch (error) {
      console.error("Error fetching last TECMIS date:", error);
      return res.status(500).json({ error: "internal server error" });
    }
  }

  res.status(405).json({ error: "method not allowed" });
}
