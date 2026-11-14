"use server";
import { getPuzzleById } from "./getPuzzle";

export const checkWord = async (word: string, puzzleId: number | string) => {
	const puzzle = await getPuzzleById(puzzleId);
	return puzzle?.dictionary.includes(word);
};
