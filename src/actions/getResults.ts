"use server";
import { getPuzzleById } from "./getPuzzle";

export const getResults = async (id: string | number) => {
	const puzzle = await getPuzzleById(id);
	const slams = (puzzle?.dictionary ?? []).filter(el => el.length === puzzle?.puzzle.rack.length);
	return {
		topScoringWords: puzzle?.topScoringWords,
		totalScore: (puzzle?.topScoringWords ?? []).slice(0, 5).reduce((a, c) => a + c.score, 0),
		nbDictWords: puzzle?.dictionary.length ?? 0,
		nbSlams: slams.length,
		allSlams: slams,
	};
};
