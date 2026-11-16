"use client";

import { alphabet } from "../../api/_lib/alphabet";
import { CELL_DROP_PREFIX, SLAM_BONUS_POINTS, TILE_DRAG_PREFIX } from "@/game-config/constants";
import type { Axis, BoardTemplate, CellId, OngoingAttemptTile, RackTileId, ScoreBreakdown } from "@/context/types";

export type PlacementValidation =
	| {
			isSubmittable: true;
			axis: Axis;
			candidateWord: string;
			orderedTiles: OngoingAttemptTile[];
	  }
	| {
			isSubmittable: false;
			axis: Axis | null;
			candidateWord: string;
			orderedTiles: OngoingAttemptTile[];
			reason: "too_short" | "no_center" | "not_contiguous" | "mixed_axis";
	  };

export const isStreakContinuous = (puzzleId: number, lastCompletedPuzzleId?: number): boolean => {
	if (typeof lastCompletedPuzzleId !== "number") return true;
	return puzzleId === lastCompletedPuzzleId || puzzleId === lastCompletedPuzzleId + 1;
};

export const calculateDraftScore = (
	placedTiles: OngoingAttemptTile[],
	board: BoardTemplate,
	options?: {
		applySlamBonus?: boolean;
	},
): ScoreBreakdown => {
	let baseLetterScore = 0;
	let wordMultiplierTotal: 1 | 2 | 3 | 6 | 9 = 1;
	const letterMultiplierHits: ScoreBreakdown["letterMultiplierHits"] = [];
	const wordMultiplierHits: ScoreBreakdown["wordMultiplierHits"] = [];

	for (const tile of placedTiles) {
		const cell = board.cellsById[tile.cellId];
		const baseValue = alphabet[tile.letter] ?? 0;

		if (cell?.bonus === "dl") {
			baseLetterScore += baseValue * 2;
			letterMultiplierHits.push({ cellId: cell.id, bonus: "dl", multiplier: 2 });
			continue;
		}

		if (cell?.bonus === "tl") {
			baseLetterScore += baseValue * 3;
			letterMultiplierHits.push({ cellId: cell.id, bonus: "tl", multiplier: 3 });
			continue;
		}

		baseLetterScore += baseValue;

		if (cell?.bonus === "dw") {
			wordMultiplierTotal = (wordMultiplierTotal * 2) as typeof wordMultiplierTotal;
			wordMultiplierHits.push({ cellId: cell.id, bonus: "dw", multiplier: 2 });
		}

		if (cell?.bonus === "tw") {
			wordMultiplierTotal = (wordMultiplierTotal * 3) as typeof wordMultiplierTotal;
			wordMultiplierHits.push({ cellId: cell.id, bonus: "tw", multiplier: 3 });
		}
	}

	const slamBonusApplied = Boolean(options?.applySlamBonus);
	const slamBonusPoints = slamBonusApplied ? SLAM_BONUS_POINTS : 0;
	const total = baseLetterScore * wordMultiplierTotal + slamBonusPoints;

	return {
		baseLetterScore,
		letterMultiplierHits,
		wordMultiplierHits,
		wordMultiplierTotal,
		slamBonusApplied,
		slamBonusPoints,
		total,
	};
};

export const getPlacementValidation = (placedTiles: OngoingAttemptTile[], board: BoardTemplate): PlacementValidation => {
	if (placedTiles.length < 2) {
		return { isSubmittable: false, axis: null, candidateWord: "", orderedTiles: [], reason: "too_short" };
	}

	const tilesWithCoordinates = placedTiles
		.map(tile => {
			const cell = board.cellsById[tile.cellId];
			return cell ? { tile, row: cell.coordinate.row, column: cell.coordinate.column, isCenter: cell.isCenter } : null;
		})
		.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

	if (!tilesWithCoordinates.some(el => el.isCenter)) {
		return { isSubmittable: false, axis: null, candidateWord: "", orderedTiles: [], reason: "no_center" };
	}
	if (tilesWithCoordinates.length < 2) {
		return { isSubmittable: false, axis: null, candidateWord: "", orderedTiles: [], reason: "too_short" };
	}

	const uniqueRows = new Set(tilesWithCoordinates.map(entry => entry.row));
	const uniqueColumns = new Set(tilesWithCoordinates.map(entry => entry.column));

	const axis: Axis | null = uniqueRows.size === 1 ? "horizontal" : uniqueColumns.size === 1 ? "vertical" : null;
	if (!axis) {
		return { isSubmittable: false, axis: null, candidateWord: "", orderedTiles: [], reason: "mixed_axis" };
	}

	const orderedByAxis = [...tilesWithCoordinates].sort((a, b) => (axis === "horizontal" ? a.column - b.column : a.row - b.row));

	const axisCoordinates = orderedByAxis.map(entry => (axis === "horizontal" ? entry.column : entry.row));
	const minCoordinate = Math.min(...axisCoordinates);
	const maxCoordinate = Math.max(...axisCoordinates);
	const isContiguous = maxCoordinate - minCoordinate + 1 === orderedByAxis.length;

	if (!isContiguous) {
		return {
			isSubmittable: false,
			axis,
			candidateWord: "",
			orderedTiles: orderedByAxis.map(entry => entry.tile),
			reason: "not_contiguous",
		};
	}

	const orderedTiles = orderedByAxis.map(entry => entry.tile);
	const candidateWord = orderedTiles
		.map(tile => tile.letter)
		.join("")
		.toLowerCase();

	return {
		isSubmittable: true,
		axis,
		candidateWord,
		orderedTiles,
	};
};

export const parseRackTileId = (id: unknown): RackTileId | null => {
	if (typeof id !== "string" || !id.startsWith(TILE_DRAG_PREFIX)) return null;
	return id.slice(TILE_DRAG_PREFIX.length);
};

export const parseCellId = (id: unknown): CellId | null => {
	if (typeof id !== "string" || !id.startsWith(CELL_DROP_PREFIX)) return null;
	return id.slice(CELL_DROP_PREFIX.length);
};
