"use server";
import { getPuzzleById } from "./getPuzzle";

export const getResults = async (id: string | number) => {
	const puzzle = await getPuzzleById(id);
	return {
		topScoringWords: puzzle?.topScoringWords,
		totalScore: (puzzle?.topScoringWords ?? []).slice(0, 5).reduce((a, c) => a + c.score, 0),
	};
};
