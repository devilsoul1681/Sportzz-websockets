import { db } from "../db/db.js";
import { matches } from "../db/schema.js";
import { Router } from "express";
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from "../validation/matches.js";
import { getMatchStatus } from "../utils/match-status.js";
import { desc } from "drizzle-orm";
const matchRouter = Router();

matchRouter.get("/", async (req, res) => {
  const parser = listMatchesQuerySchema.safeParse(req.query);
  if (!parser.success) {
    return res.status(400).json({
      error: "Invalid query parameters",
      details: parser.error.errors,
    });
  }
  try {
    const limit = Math.min(parser.data.limit ?? 50, 100);
    const allMatches = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);
    res.status(200).json({ matches: allMatches });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

matchRouter.post("/", async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid payload",
      details: JSON.stringify(parsed.error.errors),
    });
  }

  try {
    const [newMatch] = await db
      .insert(matches)
      .values({
        ...parsed.data,
        startTime: new Date(parsed.data.startTime),
        endTime: new Date(parsed.data.endTime),
        homeScore: parsed.data.homeScore ?? 0,
        awayScore: parsed.data.awayScore ?? 0,
        status: getMatchStatus(parsed.data.startTime, parsed.data.endTime),
      })
      .returning();
    res
      .status(201)
      .json({ message: "Match created successfully", match: newMatch });
  } catch (error) {
    console.error("Error creating match:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default matchRouter;
