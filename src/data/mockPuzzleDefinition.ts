import type { PuzzleDefinition } from "@/hooks/types";

export const mockPuzzleDefinition: PuzzleDefinition = {
	id: "142",
	date: "2026-11-11",
	rackTiles: [
		{ id: "rack-0", letter: "z" },
		{ id: "rack-1", letter: "y" },
		{ id: "rack-2", letter: "g" },
		{ id: "rack-3", letter: "o" },
		{ id: "rack-4", letter: "t" },
		{ id: "rack-5", letter: "e" },
		{ id: "rack-6", letter: "s" },
	],
	board: {
		centerCellId: "r3c3",
		horizontalAxis: ["r3c0", "r3c1", "r3c2", "r3c3", "r3c4", "r3c5", "r3c6"],
		verticalAxis: ["r0c3", "r1c3", "r2c3", "r3c3", "r4c3", "r5c3", "r6c3"],
		cellsById: {
			r0c3: { id: "r0c3", coordinate: { row: 0, column: 3 }, isCenter: false, axisMembership: "vertical", bonus: null },
			r1c3: { id: "r1c3", coordinate: { row: 1, column: 3 }, isCenter: false, axisMembership: "vertical", bonus: "tl" },
			r2c3: { id: "r2c3", coordinate: { row: 2, column: 3 }, isCenter: false, axisMembership: "vertical", bonus: "dw" },
			r3c0: { id: "r3c0", coordinate: { row: 3, column: 0 }, isCenter: false, axisMembership: "horizontal", bonus: null },
			r3c1: { id: "r3c1", coordinate: { row: 3, column: 1 }, isCenter: false, axisMembership: "horizontal", bonus: null },
			r3c2: { id: "r3c2", coordinate: { row: 3, column: 2 }, isCenter: false, axisMembership: "horizontal", bonus: "dl" },
			r3c3: { id: "r3c3", coordinate: { row: 3, column: 3 }, isCenter: true, axisMembership: "both", bonus: null },
			r3c4: { id: "r3c4", coordinate: { row: 3, column: 4 }, isCenter: false, axisMembership: "horizontal", bonus: null },
			r3c5: { id: "r3c5", coordinate: { row: 3, column: 5 }, isCenter: false, axisMembership: "horizontal", bonus: null },
			r3c6: { id: "r3c6", coordinate: { row: 3, column: 6 }, isCenter: false, axisMembership: "horizontal", bonus: null },
			r4c3: { id: "r4c3", coordinate: { row: 4, column: 3 }, isCenter: false, axisMembership: "vertical", bonus: null },
			r5c3: { id: "r5c3", coordinate: { row: 5, column: 3 }, isCenter: false, axisMembership: "vertical", bonus: "tw" },
			r6c3: { id: "r6c3", coordinate: { row: 6, column: 3 }, isCenter: false, axisMembership: "vertical", bonus: null },
		},
	},
	generation: {
		seed: "daily-2026-11-11",
		bonusDistributionVersion: "v1",
		scoringVersion: "v1",
		dictionaryVersion: "v1",
	},
};
