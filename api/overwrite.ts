import { handleSchedule } from "@vercel/schedules";
import { Redis } from "@upstash/redis";
import { PuzzleEnvelope, RackTiles } from "@/context/types";
import { generateDictionary } from "./_lib/generateDictionary.js";
import { randomUUID } from "crypto";

const redis = Redis.fromEnv();
export const POST = handleSchedule(async () => {
	const puzzle6 = await redis.get<PuzzleEnvelope>("puzzle:6");
	if (!puzzle6) return;
	puzzle6.id = 4;
	puzzle6.puzzle.id = 4;
	puzzle6.puzzle.generation.seed = "4-2026-11-16-selptnu";
	const pipeline = redis.pipeline();
	pipeline.set("puzzle:4", JSON.stringify(puzzle6), { ex: 3 * 60 * 60 * 24 });
	pipeline.set("puzzles:next-id", 4);
	pipeline.del("puzzle:6");
	await pipeline.exec();
});
