import { readFile } from "fs/promises";
import { join } from "path";
import { Redis } from "@upstash/redis";
import { getRandomInt, randomize } from "./utils.js";
import { generateDictionary } from "./generateDictionary.js";

const redis = Redis.fromEnv();

export const generateRackLetters = async (): Promise<{ letters: string[7]; dictionary: string[] }> => {
	const trayLetterList: string[7][] = (await readFile(join(process.cwd(), "src/data/word-list.txt"), { encoding: "utf8" }))
		.split("\n")
		.map(l => l.trim())
		.filter(Boolean);
	const usedRacks = await redis.lrange("racks:all", 0, -1);
	const usedRacksSet = new Set(usedRacks.map(l => l.split("").sort().join("")));
	const usedIndices = new Set();
	let i = getRandomInt(0, trayLetterList.length);
	let rackLetters: string[7] = "";
	while (!rackLetters && usedIndices.size < trayLetterList.length) {
		if (usedIndices.has(i)) {
			i = getRandomInt(0, trayLetterList.length);
			continue;
		}
		const tmpLetters: string[7] = trayLetterList[i];
		if (tmpLetters.length !== 7) {
			usedIndices.add(i);
			i = getRandomInt(0, trayLetterList.length);
		}
		const orderedTmpLetters = tmpLetters.split("").sort().join("");
		if (!usedRacksSet.has(orderedTmpLetters)) rackLetters = tmpLetters;
		else {
			usedIndices.add(i);
			i = getRandomInt(0, trayLetterList.length);
		}
	}
	const dictionary = await generateDictionary(rackLetters);
	return { letters: randomize(rackLetters), dictionary };
};
