import type { BoardTemplate, PuzzleDefinition, RackTiles } from "@/context/types";

export const createBoardTemplate = (): BoardTemplate => ({
	cellsById: {
		r0c0: { id: "r0c0", coordinate: { row: 0, column: 0 }, isCenter: false, axisMembership: "both", bonus: null },
		r0c1: { id: "r0c1", coordinate: { row: 0, column: 1 }, isCenter: true, axisMembership: "both", bonus: "dw" },
		r0c2: { id: "r0c2", coordinate: { row: 0, column: 2 }, isCenter: false, axisMembership: "both", bonus: "tl" },
		r1c1: { id: "r1c1", coordinate: { row: 1, column: 1 }, isCenter: false, axisMembership: "both", bonus: "dl" },
		r2c1: { id: "r2c1", coordinate: { row: 2, column: 1 }, isCenter: false, axisMembership: "both", bonus: "tw" },
	},
	horizontalAxis: ["r0c0", "r0c1", "r0c2"],
	verticalAxis: ["r0c1", "r1c1", "r2c1"],
	centerCellId: "r0c1",
});

export const createRackTiles = (): RackTiles => [
	{ id: "t1", letter: "c" },
	{ id: "t2", letter: "a" },
	{ id: "t3", letter: "t" },
	{ id: "t4", letter: "s" },
	{ id: "t5", letter: "e" },
	{ id: "t6", letter: "r" },
	{ id: "t7", letter: "n" },
];

export const createPuzzle = (): PuzzleDefinition => ({
	id: 42,
	date: "2026-11-16",
	rack: "cats ern",
	rackTiles: createRackTiles(),
	board: createBoardTemplate(),
	generation: {
		seed: "seed",
		bonusDistributionVersion: "1",
		scoringVersion: "1",
		dictionaryVersion: "1",
		dateClaimToken: "234",
	},
});
