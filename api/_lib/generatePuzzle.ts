import type { PuzzleEnvelope, BoardCell, BoardTemplate, BonusTile, PuzzleDefinition, RackTiles } from "../../src/context/types";
import { Redis } from "@upstash/redis";
import moment from "moment-timezone";
import { randomUUID } from "crypto";
import { getRandomInt } from "./utils.js";
import { generateRackLetters } from "./generateRackLetters.js";
import { calculateTopScoringWords } from "./bestPossibleWords.js";

const redis = Redis.fromEnv();

const boardTemplate: PuzzleDefinition["board"] = {
	centerCellId: "r3c3",
	horizontalAxis: ["r3c0", "r3c1", "r3c2", "r3c3", "r3c4", "r3c5", "r3c6"],
	verticalAxis: ["r0c3", "r1c3", "r2c3", "r3c3", "r4c3", "r5c3", "r6c3"],
	cellsById: {
		r0c3: { id: "r0c3", coordinate: { row: 0, column: 3 }, isCenter: false, axisMembership: "vertical", bonus: null },
		r1c3: { id: "r1c3", coordinate: { row: 1, column: 3 }, isCenter: false, axisMembership: "vertical", bonus: null },
		r2c3: { id: "r2c3", coordinate: { row: 2, column: 3 }, isCenter: false, axisMembership: "vertical", bonus: null },
		r3c0: { id: "r3c0", coordinate: { row: 3, column: 0 }, isCenter: false, axisMembership: "horizontal", bonus: null },
		r3c1: { id: "r3c1", coordinate: { row: 3, column: 1 }, isCenter: false, axisMembership: "horizontal", bonus: null },
		r3c2: { id: "r3c2", coordinate: { row: 3, column: 2 }, isCenter: false, axisMembership: "horizontal", bonus: null },
		r3c3: { id: "r3c3", coordinate: { row: 3, column: 3 }, isCenter: true, axisMembership: "both", bonus: null },
		r3c4: { id: "r3c4", coordinate: { row: 3, column: 4 }, isCenter: false, axisMembership: "horizontal", bonus: null },
		r3c5: { id: "r3c5", coordinate: { row: 3, column: 5 }, isCenter: false, axisMembership: "horizontal", bonus: null },
		r3c6: { id: "r3c6", coordinate: { row: 3, column: 6 }, isCenter: false, axisMembership: "horizontal", bonus: null },
		r4c3: { id: "r4c3", coordinate: { row: 4, column: 3 }, isCenter: false, axisMembership: "vertical", bonus: null },
		r5c3: { id: "r5c3", coordinate: { row: 5, column: 3 }, isCenter: false, axisMembership: "vertical", bonus: null },
		r6c3: { id: "r6c3", coordinate: { row: 6, column: 3 }, isCenter: false, axisMembership: "vertical", bonus: null },
	},
};

const bonusTileTypes: BonusTile[] = ["dl", "dw", "tl", "tw"];

const generateBonusTiles = () => {
	const bonusTileCount = getRandomInt(2, 6);
	const bonuses = Array.from({ length: bonusTileCount }, () => {
		const index = getRandomInt(0, bonusTileTypes.length);
		return bonusTileTypes[index];
	});

	const cells: BoardCell[] = Object.values(boardTemplate.cellsById).map(cell => ({
		...cell,
		coordinate: { ...cell.coordinate },
		bonus: null,
	}));
	const cellsCopy = cells.filter(cell => !cell.isCenter);

	for (const bonus of bonuses) {
		if (cellsCopy.length === 0) break;
		const index = getRandomInt(0, cellsCopy.length);
		const selectedCell = cellsCopy[index];
		const target = cells.find(cell => cell.id === selectedCell.id);
		if (target) target.bonus = bonus;
		cellsCopy.splice(index, 1);
	}

	return cells.reduce(
		(accumulator, cell): BoardTemplate["cellsById"] => {
			accumulator[cell.id] = cell;
			return accumulator;
		},
		{} as BoardTemplate["cellsById"],
	);
};

export const generatePuzzleStructure = async ({ letters }: { letters: string[7] }) => {
	const puzzlesLen = await redis.llen("puzzles:all");
	const allPuzzles = await redis.lrange("puzzles:all", 0, puzzlesLen);
	const allIds = [...allPuzzles.map(el => Number(el))].filter(Boolean);
	const prevPuzzleId = Math.max(...allIds);
	const id = prevPuzzleId ? prevPuzzleId + 1 : 1;
	const date = moment().tz("Pacific/Kiritimati").format("YYYY-MM-DD");
	const letterArr = Array.from(letters);
	if (letterArr.length !== 7) {
		throw new Error(`Expected 7 letters for puzzle rack, received ${letterArr.length}: ${letters}`);
	}
	const rackTiles = letterArr.map(letter => ({ id: randomUUID(), letter })) as unknown as RackTiles;
	const board = {
		...structuredClone(boardTemplate),
		cellsById: generateBonusTiles(),
	};
	const generation = {
		seed: `${id}-${date}-${letters}`,
		bonusDistributionVersion: "v1",
		scoringVersion: "v1",
		dictionaryVersion: "v1",
	};

	return {
		id,
		date,
		rackTiles,
		generation,
		board,
	};
};

export const generatePuzzle = async () => {
	try {
		const { letters, dictionary } = await generateRackLetters();
		console.log("Generated rack letters: ", letters);
		if (!letters || !dictionary?.length) return;

		const puzzle = await generatePuzzleStructure({ letters });
		console.log("Generated puzzle config.");

		const rackKey = `puzzle:${puzzle.id}`;
		const topScoringWords = calculateTopScoringWords(puzzle, dictionary, { limit: 20 });
		const puzzleEnvelope: PuzzleEnvelope = {
			id: puzzle.id,
			date: puzzle.date,
			puzzle,
			dictionary,
			createdAt: new Date(),
			topScoringWords,
		};
		console.log("Puzzle envelope created:", puzzleEnvelope);
		const pipeline = redis.pipeline();
		pipeline.lpush("puzzles:all", puzzle.id);
		pipeline.lpush("racks:all", letters);
		pipeline.set(rackKey, JSON.stringify(puzzleEnvelope), { ex: 3 * 60 * 60 * 24 });
		await pipeline.exec();
		console.log("Data uploaded.", puzzleEnvelope);
		return puzzleEnvelope;
	} catch (error) {
		console.error(error);
	}
};
