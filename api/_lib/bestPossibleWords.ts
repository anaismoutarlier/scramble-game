import { alphabet } from "./alphabet.js";
import type { TopScoringWord, TopScoringWordPlacement, PuzzleDefinition } from "../../src/context/types";
import { SLAM_BONUS_POINTS } from "../../src/game-config/constants.js";

function canBuildWordFromRack(word: string, rackLetters: readonly string[]): boolean {
	const availableCounts = new Map<string, number>();
	for (const letter of rackLetters) {
		availableCounts.set(letter, (availableCounts.get(letter) ?? 0) + 1);
	}

	for (const letter of word) {
		const available = availableCounts.get(letter) ?? 0;
		if (available <= 0) return false;
		availableCounts.set(letter, available - 1);
	}

	return true;
}

function calculatePlacementScore(word: string, placementCellIds: string[], puzzle: PuzzleDefinition): number {
	let baseLetterScore = 0;
	let wordMultiplierTotal = 1;

	for (let index = 0; index < word.length; index += 1) {
		const letter = word[index];
		const cell = puzzle.board.cellsById[placementCellIds[index]];
		const letterValue = alphabet[letter] ?? 0;

		if (cell?.bonus === "dl") {
			baseLetterScore += letterValue * 2;
			continue;
		}

		if (cell?.bonus === "tl") {
			baseLetterScore += letterValue * 3;
			continue;
		}

		baseLetterScore += letterValue;

		if (cell?.bonus === "dw") {
			wordMultiplierTotal *= 2;
		}

		if (cell?.bonus === "tw") {
			wordMultiplierTotal *= 3;
		}
	}

	const slamBonus = word.length === puzzle.rackTiles.length ? SLAM_BONUS_POINTS : 0;
	return baseLetterScore * wordMultiplierTotal + slamBonus;
}

function getScoredPlacementsForWord(word: string, puzzle: PuzzleDefinition): TopScoringWordPlacement[] {
	const axisCellGroups = [puzzle.board.horizontalAxis, puzzle.board.verticalAxis];
	const placements: TopScoringWordPlacement[] = [];
	const centerCellId = puzzle.board.centerCellId;

	for (const axisCells of axisCellGroups) {
		const placementWindowCount = axisCells.length - word.length + 1;
		if (placementWindowCount < 1) continue;

		for (let start = 0; start < placementWindowCount; start += 1) {
			const placementCellIds = axisCells.slice(start, start + word.length);
			if (!placementCellIds.includes(centerCellId)) continue;
			const score = calculatePlacementScore(word, placementCellIds, puzzle);

			placements.push({
				direction: axisCellGroups.indexOf(axisCells) === 0 ? "horizontal" : "vertical",
				placementCellIds,
				score,
			});
		}
	}

	return placements;
}

export function calculateTopScoringWords(
	puzzle: PuzzleDefinition,
	words: readonly string[],
	options?: { limit?: number },
): TopScoringWord[] {
	const limit = options?.limit ?? 5;
	const rackLetters = puzzle.rackTiles.map(tile => tile.letter.toLowerCase());

	return words
		.map(word => word.toLowerCase())
		.filter((word, index, allWords) => allWords.indexOf(word) === index)
		.filter(word => word.length >= 2 && word.length <= puzzle.rackTiles.length)
		.filter(word => canBuildWordFromRack(word, rackLetters))
		.map(word => {
			const placements = getScoredPlacementsForWord(word, puzzle);
			const score = placements.reduce((best, placement) => Math.max(best, placement.score), 0);
			const sortedPlacements = [...placements].sort((a, b) => {
				if (b.score !== a.score) return b.score - a.score;
				if (a.direction !== b.direction) return a.direction.localeCompare(b.direction);
				const aFirstCell = a.placementCellIds[0] ?? "";
				const bFirstCell = b.placementCellIds[0] ?? "";
				return aFirstCell.localeCompare(bFirstCell);
			});
			return { word: word.toLocaleLowerCase(), score, placements: sortedPlacements };
		})
		.sort((a, b) => {
			if (b.score !== a.score) return b.score - a.score;
			if (b.word.length !== a.word.length) return b.word.length - a.word.length;
			return a.word.localeCompare(b.word);
		})
		.slice(0, limit);
}
