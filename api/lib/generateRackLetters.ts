import { readFile } from "fs/promises";
import { join } from "path";
import { findSubWords } from "./sub-words";
import { Redis } from "@upstash/redis";
import { getRandomInt, randomize } from "../../src/lib/utils";
const redis = Redis.fromEnv();

export const generateRackLetters = async (): Promise<{ letters: string[7]; dictionary: string[] }> => {
	const trayLetterList: string[7][] = (await readFile(join(process.cwd(), "src/data/word-list.txt"), { encoding: "utf8" })).split("\n");
	const wordList = (await readFile(join(process.cwd(), "src/data/enable1.txt"), { encoding: "utf8" })).split("\n");
	const usedRacksLen = await redis.llen("racks:all");
	const usedRacks = await redis.lrange("racks:all", 0, usedRacksLen);
	const usedRacksSet = new Set(usedRacks);
	const usedIndices = new Set();
	let i = getRandomInt(0, trayLetterList.length);
	let rackLetters: string[7] = "";
	while (!rackLetters && usedIndices.size < trayLetterList.length) {
		if (usedIndices.has(i)) {
			i = getRandomInt(0, trayLetterList.length);
			continue;
		}
		const tmpLetters: string[7] = trayLetterList[i];
		if (!usedRacksSet.has(tmpLetters)) rackLetters = tmpLetters;
		else {
			usedIndices.add(i);
			i = getRandomInt(0, trayLetterList.length);
		}
	}
	const dictionary = findSubWords(rackLetters, wordList);
	return { letters: randomize(rackLetters), dictionary };
};
