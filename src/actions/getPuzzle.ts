"use server";
import { Redis } from "@upstash/redis";
import type { PuzzleEnvelope } from "@/context/types";

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

export async function getPuzzle({ date }: { date: string }) {
	const puzzles = await getAllByPrefix<PuzzleEnvelope>("puzzle:");
	const puzzle = puzzles.find(el => el.date === date);
	return puzzle?.puzzle ?? null;
}
