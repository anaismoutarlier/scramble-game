import type { TopScoringWord } from "../../api/_lib/bestPossibleWords";

export type BonusTile = "dl" | "tl" | "dw" | "tw";
export type Axis = "horizontal" | "vertical";
export type AxisMembership = Axis | "both";
export type GameStatus = "unstarted" | "in_progress" | "completed";
export type ValidationErrorCode =
	| "invalid_word"
	| "invalid_characters"
	| "insufficient_letters"
	| "invalid_start_cell"
	| "out_of_bounds"
	| "cross_center_required"
	| "not_contiguous"
	| "attempt_limit_reached";

export type CellId = string;
export type PuzzleId = number;
export type RackTileId = string;

export interface RackTile {
	id: RackTileId;
	letter: string;
}

export type RackTiles = readonly [RackTile, RackTile, RackTile, RackTile, RackTile, RackTile, RackTile];

export interface CellCoordinate {
	row: number;
	column: number;
}

export interface BoardCell {
	id: CellId;
	coordinate: CellCoordinate;
	isCenter: boolean;
	axisMembership: AxisMembership;
	bonus: BonusTile | null;
}

export interface BoardTemplate {
	cellsById: Record<CellId, BoardCell>;
	horizontalAxis: CellId[];
	verticalAxis: CellId[];
	centerCellId: CellId;
}

export interface PuzzleGenerationMetadata {
	seed: string;
	bonusDistributionVersion: string;
	scoringVersion: string;
	dictionaryVersion: string;
}

export interface PuzzleDefinition {
	id: PuzzleId;
	date: string;
	rackTiles: RackTiles;
	board: BoardTemplate;
	generation: PuzzleGenerationMetadata;
}

export interface WordPlacement {
	direction: Axis;
	startCellId: CellId;
	placementCells: CellId[];
	rackTileIdsInPlacementOrder: RackTileId[];
}

export interface ScoreBreakdown {
	baseLetterScore: number;
	letterMultiplierHits: Array<{
		cellId: CellId;
		bonus: Extract<BonusTile, "dl" | "tl">;
		multiplier: 2 | 3;
	}>;
	wordMultiplierHits: Array<{
		cellId: CellId;
		bonus: Extract<BonusTile, "dw" | "tw">;
		multiplier: 2 | 3;
	}>;
	wordMultiplierTotal: number;
	slamBonusApplied: boolean;
	slamBonusPoints: number;
	total: number;
}

export interface AttemptValidationFailure {
	code: ValidationErrorCode;
	message: string;
}

export interface AttemptRecord {
	id?: string;
	attemptNumber: number;
	submittedAt?: string;
	word: string;
	rackTileIdsUsed: RackTileId[];
	placement: WordPlacement;
	score: ScoreBreakdown;
	validationFailure?: AttemptValidationFailure;
}

export interface OngoingAttemptTile {
	rackTileId: RackTileId;
	cellId: CellId;
	letter: string;
}

export interface OngoingAttempt {
	id?: string;
	attemptNumber: number;
	placedTiles: OngoingAttemptTile[];
	score: ScoreBreakdown;
}

export interface GameProgress {
	puzzleId: PuzzleId;
	status: GameStatus;
	attemptsUsed: number;
	totalScore: number;
	currentAttempt?: OngoingAttempt;
	attempts: AttemptRecord[];
	startedAt: string;
	updatedAt: string;
	completedAt?: string;
}

export interface GameStateSchema {
	puzzle: PuzzleDefinition;
	progress: GameProgress;
}

export type PuzzleEnvelope = {
	id: number;
	date: string;
	puzzle: PuzzleDefinition;
	dictionary: string[];
	createdAt: Date;
	topScoringWords: TopScoringWord[];
};
