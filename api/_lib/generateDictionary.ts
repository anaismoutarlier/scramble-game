import { readFile } from "fs/promises";
import { join } from "path";
import { findSubWords } from "./sub-words.js";

export const generateDictionary = async (letters: string[7]) => {
	if (!letters) return [];
	const wordList = (await readFile(join(process.cwd(), "src/data/dictionary.txt"), { encoding: "utf8" }))
		.split("\n")
		.map(l => l.trim())
		.filter(Boolean);
	console.log("Word list loaded.");
	return findSubWords(letters, wordList).map(el => el.toLocaleLowerCase());
};
