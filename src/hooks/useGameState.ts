import type { PuzzleDefinition, BoardCell, BoardTemplate, OngoingAttempt, GameProgress } from "./types";
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

	const [progress] = useState<GameProgress>({
		puzzleId: puzzle.id,
		status: "in_progress",
		attemptsUsed: 2,
		totalScore: 23,
		currentAttempt,
		attempts: [
			{
				id: "attempt-1",
				attemptNumber: 1,
				word: "got",
				rackTileIdsUsed: ["rack-2", "rack-3", "rack-4"],
				placement: {
					direction: "horizontal",
					startCellId: "r3c2",
					placementCells: ["r3c2", "r3c3", "r3c4"],
					rackTileIdsInPlacementOrder: ["rack-2", "rack-3", "rack-4"],
				},
				score: {
					baseLetterScore: 4,
					letterMultiplierHits: [],
					wordMultiplierHits: [{ cellId: "r2c3", bonus: "dw", multiplier: 2 }],
					wordMultiplierTotal: 2,
					slamBonusApplied: false,
					slamBonusPoints: 0,
					total: 8,
				},
			},
			{
				id: "attempt-2",
				attemptNumber: 2,
				word: "toes",
				rackTileIdsUsed: ["rack-4", "rack-3", "rack-5", "rack-6"],
				placement: {
					direction: "vertical",
					startCellId: "r2c3",
					placementCells: ["r2c3", "r3c3", "r4c3", "r5c3"],
					rackTileIdsInPlacementOrder: ["rack-4", "rack-3", "rack-5", "rack-6"],
				},
				score: {
					baseLetterScore: 8,
					letterMultiplierHits: [],
					wordMultiplierHits: [],
					wordMultiplierTotal: 1,
					slamBonusApplied: false,
					slamBonusPoints: 0,
					total: 15,
				},
			},
		],
		startedAt: "2026-11-11T08:00:00.000Z",
		updatedAt: "2026-11-11T08:12:00.000Z",
	});

	return { puzzle, progress };
};
