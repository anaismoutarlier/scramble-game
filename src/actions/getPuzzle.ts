"use server";
import { Redis } from "@upstash/redis";
import moment from "moment";
import type { PuzzleEnvelope } from "@/lib/generatePuzzle";

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

export async function getPuzzle({ date }: { date: Date }) {
	const localeStringDate = moment(date).format("YYYY-MM-DD");
	const puzzles = await getAllByPrefix<PuzzleEnvelope>("puzzle:");
	const puzzle = puzzles.find(el => el.date === localeStringDate);
	return puzzle?.puzzle;
}
