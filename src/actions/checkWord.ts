"use server";
import type { OngoingAttemptTile } from "@/context/types";
import { getPuzzleById } from "./getPuzzle";
import { getPlacementValidation, PlacementValidationReason, calculateDraftScore } from "@/context/game-domain";
import type { Axis, ScoreBreakdown } from "@/context/types";

export type ServerPlacementValidation =
	| {
			isSubmittable: true;
			axis: Axis;
			candidateWord: string;
			orderedTiles: OngoingAttemptTile[];
			score: ScoreBreakdown;
	  }
	| {
			isSubmittable: false;
			axis: Axis | null;
			candidateWord: string;
			orderedTiles: OngoingAttemptTile[];
			reason: PlacementValidationReason | "server_error" | "invalid_word" | "invalid_rack_tiles";
	  };

export const checkWord = async ({
	puzzleId,
	placedTiles,
}: {
	puzzleId: number | string;
	placedTiles: OngoingAttemptTile[];
}): Promise<ServerPlacementValidation> => {
	const puzzle = await getPuzzleById(puzzleId);
	if (!puzzle) return { isSubmittable: false, reason: "server_error", axis: null, candidateWord: "", orderedTiles: [] };

	const rackTilesById = new Map(puzzle.puzzle.rackTiles.map(tile => [tile.id, tile.letter]));
	const seenRackTileIds = new Set<string>();
	const hasInvalidRackTile = placedTiles.some(tile => {
		const expectedLetter = rackTilesById.get(tile.rackTileId);
		if (!expectedLetter || seenRackTileIds.has(tile.rackTileId)) {
			return true;
		}

		seenRackTileIds.add(tile.rackTileId);
		return expectedLetter.toLowerCase() !== tile.letter.toLowerCase();
	});

	if (hasInvalidRackTile) {
		return {
			isSubmittable: false,
			reason: "invalid_rack_tiles",
			axis: null,
			candidateWord: "",
			orderedTiles: [],
		};
	}

	const placementValidation = getPlacementValidation(placedTiles, puzzle.puzzle.board);
	if (!placementValidation.isSubmittable) return placementValidation;
	if (puzzle?.dictionary.includes(placementValidation.candidateWord.toLowerCase()))
		return {
			isSubmittable: true,
			axis: placementValidation.axis,
			orderedTiles: placementValidation.orderedTiles,
			candidateWord: placementValidation.candidateWord,
			score: calculateDraftScore(placementValidation.orderedTiles, puzzle.puzzle.board, {
				applySlamBonus: placementValidation.candidateWord.length === puzzle.puzzle.rack.length,
			}),
		};
	else
		return {
			isSubmittable: false,
			reason: "invalid_word",
			axis: placementValidation.axis,
			orderedTiles: placementValidation.orderedTiles,
			candidateWord: placementValidation.candidateWord,
		};
};
