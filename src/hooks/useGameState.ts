import type { PuzzleDefinition, BoardCell, BoardTemplate, OngoingAttempt } from "./types";
import { useState } from "react";
import { mockPuzzleDefinition } from "@/data/mockPuzzleDefinition";

export { PuzzleDefinition, BoardCell, BoardTemplate };
export const useGameState = () => {
	const [puzzle] = useState<PuzzleDefinition>(mockPuzzleDefinition);
	const [currentAttempt] = useState<OngoingAttempt>({
		attemptNumber: 1,
		placedTiles: [
			{ cellId: "r2c3", letter: "e" },
			{ cellId: "r3c3", letter: "g" },
			{ cellId: "r3c2", letter: "o" },
		],
		score: {
			baseLetterScore: 4,
			letterMultiplierHits: [{ cellId: "r3c2", bonus: "dl", multiplier: 2 }],
			wordMultiplierHits: [
				{ cellId: "r2c3", bonus: "dw", multiplier: 2 },
				{ cellId: "r5c3", bonus: "tw", multiplier: 3 },
			],
			wordMultiplierTotal: 6,
			slamBonusApplied: false,
			slamBonusPoints: 0,
			total: 36,
		},
	});
	return { puzzle, currentAttempt };
};
