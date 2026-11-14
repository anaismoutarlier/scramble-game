import { handleSchedule } from "@vercel/schedules";
import { Redis } from "@upstash/redis";
import { PuzzleEnvelope, RackTiles } from "@/context/types";
import { generateDictionary } from "./_lib/generateDictionary.js";
import { randomUUID } from "crypto";

const redis = Redis.fromEnv();
export const POST = handleSchedule(async () => {
	const puzzle = await redis.get<PuzzleEnvelope>("puzzle:2");
	if (!puzzle) return;
	console.log(`Found puzzle: `, puzzle);
	const pipeline = redis.pipeline();
	const prevPuzzle = structuredClone(puzzle);
	if (prevPuzzle) {
		prevPuzzle.date = "2026-11-15";
		prevPuzzle.id = 3;
		prevPuzzle.puzzle.id = 3;
		prevPuzzle.puzzle.date = "2026-11-15";
		prevPuzzle.puzzle.generation.seed = "3-2026-11-15-plmiean";
		console.log("Generated puzzle 3 :", prevPuzzle);
		pipeline.set("puzzle:3", JSON.stringify(prevPuzzle), { ex: 3 * 60 * 60 * 24 });
	}
	const newWord = "tosscmi";
	const newDictionary = await generateDictionary(newWord);
	const newPuzzle: PuzzleEnvelope = {
		...puzzle,
		dictionary: newDictionary,
		puzzle: { ...puzzle?.puzzle, rackTiles: newWord.split("").map(el => ({ id: randomUUID(), letter: el })) as unknown as RackTiles },
	};
	console.log("Generated puzzle 2", newPuzzle);
	pipeline.lset("puzzles:all", 0, 3);
	pipeline.set("puzzle:2", JSON.stringify(newPuzzle), { ex: 3 * 60 * 60 * 24 });
	await pipeline.exec();
	console.log("Data saved");
});
