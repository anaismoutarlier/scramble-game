import type { PuzzleDefinition, BoardCell, BoardTemplate, OngoingAttempt } from "./types";
import { useState } from "react";
import { mockPuzzleDefinition } from "@/data/mockPuzzleDefinition";

export { PuzzleDefinition, BoardCell, BoardTemplate };
export const useGameState = () => {
	const [puzzle] = useState<PuzzleDefinition>(mockPuzzleDefinition);
	const [currentAttempt] = useState<OngoingAttempt>({
		attemptNumber: 1,
		placedTiles: [
			{ rackTileId: "rack-5", cellId: "r2c3", letter: "e" },
			{ rackTileId: "rack-2", cellId: "r3c3", letter: "g" },
			{ rackTileId: "rack-3", cellId: "r3c2", letter: "o" },
		],
		score: {
			baseLetterScore: 4,
			letterMultiplierHits: [{ cellId: "r3c2", bonus: "dl", multiplier: 2 }],
			wordMultiplierHits: [{ cellId: "r2c3", bonus: "dw", multiplier: 2 }],
			wordMultiplierTotal: 2,
			slamBonusApplied: false,
			slamBonusPoints: 0,
			total: 10,
		},
	});
	return { puzzle, currentAttempt };
};
