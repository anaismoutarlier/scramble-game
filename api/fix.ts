import { handleSchedule } from "@vercel/schedules";
import { Redis } from "@upstash/redis";
import { PuzzleEnvelope } from "../src/context/types";
import { calculateTopScoringWords } from "./_lib/bestPossibleWords.js";

const redis = Redis.fromEnv();

async function getAllByPrefix<T = unknown>(prefix: string): Promise<T[]> {
	let cursor = "0";
	const keys: string[] = [];
	do {
		const [nextCursor, foundKeys] = await redis.scan(cursor, {
			match: `${prefix}*`,
			count: 10,
		});
		cursor = nextCursor;
		keys.push(...foundKeys);
	} while (cursor !== "0");

	if (keys.length === 0) return [];

	return await redis.mget<T[]>(...keys);
}

export const POST = handleSchedule(async () => {
	const puzzles = await getAllByPrefix<PuzzleEnvelope>("puzzle:");

	for (const puzzle of puzzles) {
		const topScoringWords = calculateTopScoringWords(puzzle.puzzle, puzzle.dictionary);
		await redis.set(`puzzle:${puzzle.id}`, JSON.stringify({ ...puzzle, topScoringWords }));
	}
});
