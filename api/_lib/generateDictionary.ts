import { readFile } from "fs/promises";
import { join } from "path";
import { findSubWords } from "./sub-words.js";

export const generateDictionary = async (letters: string[7]) => {
	const wordList = (await readFile(join(process.cwd(), "src/data/dictionary.txt"), { encoding: "utf8" })).split("\n");
	return findSubWords(letters, wordList);
};
