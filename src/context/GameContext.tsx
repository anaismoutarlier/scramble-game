"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/react";
import { alphabet } from "@/data/alphabet";
import { mockPuzzleDefinition } from "@/data/mockPuzzleDefinition";
import { mockPuzzleValidWordSet } from "@/data/mockPuzzleValidWords";
import type { Axis, BoardTemplate, CellId, GameProgress, OngoingAttemptTile, RackTileId, ScoreBreakdown } from "@/hooks/types";

type StoredProgress = Omit<GameProgress, "currentAttempt">;

type PlacementValidation = {
	isSubmittable: boolean;
	axis: Axis | null;
	candidateWord: string;
	orderedTiles: OngoingAttemptTile[];
};

type SubmissionFeedback = {
	type: "none" | "valid" | "invalid";
	message: string;
};

type GameContextValue = {
	puzzle: typeof mockPuzzleDefinition;
	progress: GameProgress;
	isClickPlacementEnabled: boolean;
	selectedRackTileId: RackTileId | null;
	placementValidation: PlacementValidation;
	submissionFeedback: SubmissionFeedback;
	activeDragLetter: string | null;
	isRackTileInUse: (rackTileId: RackTileId) => boolean;
	getPlacedTileByCellId: (cellId: CellId) => OngoingAttemptTile | undefined;
	onRackTileClick: (rackTileId: RackTileId) => void;
	onBoardCellClick: (cellId: CellId) => void;
	onDragStart: (event: DragStartEvent) => void;
	onDragEnd: (event: DragEndEvent) => void;
	onSubmitCurrentAttempt: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

const STORAGE_KEY_PREFIX = "scramblegame:progress:";
const TILE_DRAG_PREFIX = "tile:";
const CELL_DROP_PREFIX = "cell:";
const TRAY_DROP_ID = "tray-dropzone";
const RACK_TILE_DND_TYPE = "rack-tile";
const MAX_ATTEMPTS = 5;
const ENABLE_CLICK_PLACEMENT = false;

const getStorageKey = (puzzleId: string) => `${STORAGE_KEY_PREFIX}${puzzleId}`;

const createDefaultStoredProgress = (puzzleId: string, puzzleDate: string): StoredProgress => {
	const seededTimestamp = `${puzzleDate}T00:00:00.000Z`;
	return {
		puzzleId,
		status: "in_progress",
		attemptsUsed: 0,
		totalScore: 0,
		attempts: [],
		startedAt: seededTimestamp,
		updatedAt: seededTimestamp,
	};
};

const calculateDraftScore = (placedTiles: OngoingAttemptTile[], board: BoardTemplate): ScoreBreakdown => {
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

	const total = baseLetterScore * wordMultiplierTotal;

	return {
		baseLetterScore,
		letterMultiplierHits,
		wordMultiplierHits,
		wordMultiplierTotal,
		slamBonusApplied: false,
		slamBonusPoints: 0,
		total,
	};
};

const getPlacementValidation = (placedTiles: OngoingAttemptTile[], board: BoardTemplate): PlacementValidation => {
	if (placedTiles.length < 2) {
		return { isSubmittable: false, axis: null, candidateWord: "", orderedTiles: [] };
	}

	const tilesWithCoordinates = placedTiles
		.map(tile => {
			const cell = board.cellsById[tile.cellId];
			return cell ? { tile, row: cell.coordinate.row, column: cell.coordinate.column } : null;
		})
		.filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

	if (tilesWithCoordinates.length < 2) {
		return { isSubmittable: false, axis: null, candidateWord: "", orderedTiles: [] };
	}

	const uniqueRows = new Set(tilesWithCoordinates.map(entry => entry.row));
	const uniqueColumns = new Set(tilesWithCoordinates.map(entry => entry.column));

	const axis: Axis | null = uniqueRows.size === 1 ? "horizontal" : uniqueColumns.size === 1 ? "vertical" : null;
	if (!axis) {
		return { isSubmittable: false, axis: null, candidateWord: "", orderedTiles: [] };
	}

	const orderedByAxis = [...tilesWithCoordinates].sort((a, b) => (axis === "horizontal" ? a.column - b.column : a.row - b.row));

	const axisCoordinates = orderedByAxis.map(entry => (axis === "horizontal" ? entry.column : entry.row));
	const minCoordinate = Math.min(...axisCoordinates);
	const maxCoordinate = Math.max(...axisCoordinates);
	const isContiguous = maxCoordinate - minCoordinate + 1 === orderedByAxis.length;

	if (!isContiguous) {
		return { isSubmittable: false, axis, candidateWord: "", orderedTiles: orderedByAxis.map(entry => entry.tile) };
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

const parseRackTileId = (id: unknown): RackTileId | null => {
	if (typeof id !== "string" || !id.startsWith(TILE_DRAG_PREFIX)) return null;
	return id.slice(TILE_DRAG_PREFIX.length);
};

const parseCellId = (id: unknown): CellId | null => {
	if (typeof id !== "string" || !id.startsWith(CELL_DROP_PREFIX)) return null;
	return id.slice(CELL_DROP_PREFIX.length);
};

export function GameProvider({ children }: { children: React.ReactNode }) {
	const puzzle = mockPuzzleDefinition;
	const storageKey = getStorageKey(puzzle.id);
	const [savedProgress, setSavedProgress] = useState<StoredProgress>(() => {
		const fallback = createDefaultStoredProgress(puzzle.id, puzzle.date);
		if (typeof window === "undefined") return fallback;

		const raw = window.localStorage.getItem(storageKey);
		if (!raw) return fallback;

		try {
			const parsed = JSON.parse(raw) as Partial<StoredProgress>;
			if (parsed.puzzleId !== puzzle.id) return fallback;

			return {
				...fallback,
				...parsed,
				attempts: Array.isArray(parsed.attempts) ? parsed.attempts : fallback.attempts,
				attemptsUsed: typeof parsed.attemptsUsed === "number" ? parsed.attemptsUsed : fallback.attemptsUsed,
				totalScore: typeof parsed.totalScore === "number" ? parsed.totalScore : fallback.totalScore,
				status: parsed.status === "completed" ? "completed" : "in_progress",
				startedAt: typeof parsed.startedAt === "string" ? parsed.startedAt : fallback.startedAt,
				updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : fallback.updatedAt,
				completedAt: typeof parsed.completedAt === "string" ? parsed.completedAt : undefined,
			};
		} catch {
			window.localStorage.removeItem(storageKey);
			return fallback;
		}
	});
	const [placedTiles, setPlacedTiles] = useState<OngoingAttemptTile[]>([]);
	const [selectedRackTileId, setSelectedRackTileId] = useState<RackTileId | null>(null);
	const [submissionFeedback, setSubmissionFeedback] = useState<SubmissionFeedback>({ type: "none", message: "" });
	const [activeDragLetter, setActiveDragLetter] = useState<string | null>(null);
	const suppressClickRef = useRef(false);

	useEffect(() => {
		if (typeof window === "undefined") return;
		window.localStorage.setItem(storageKey, JSON.stringify(savedProgress));
	}, [savedProgress, storageKey]);

	const placeTileOnCell = useCallback(
		(rackTileId: RackTileId, cellId: CellId) => {
			const tileFromRack = puzzle.rackTiles.find(tile => tile.id === rackTileId);
			if (!tileFromRack || !puzzle.board.cellsById[cellId]) return;

			setPlacedTiles(prev => {
				const withoutSource = prev.filter(tile => tile.rackTileId !== rackTileId);
				const withoutTarget = withoutSource.filter(tile => tile.cellId !== cellId);
				return [...withoutTarget, { rackTileId, cellId, letter: tileFromRack.letter }];
			});
			setSubmissionFeedback({ type: "none", message: "" });
		},
		[puzzle.board.cellsById, puzzle.rackTiles],
	);

	const removePlacedTile = useCallback((rackTileId: RackTileId) => {
		setPlacedTiles(prev => prev.filter(tile => tile.rackTileId !== rackTileId));
		setSubmissionFeedback({ type: "none", message: "" });
	}, []);

	const getPlacedTileByCellId = useCallback((cellId: CellId) => placedTiles.find(tile => tile.cellId === cellId), [placedTiles]);
	const isRackTileInUse = useCallback(
		(rackTileId: RackTileId) => placedTiles.some(tile => tile.rackTileId === rackTileId),
		[placedTiles],
	);

	const onRackTileClick = useCallback((rackTileId: RackTileId) => {
		if (!ENABLE_CLICK_PLACEMENT) return;
		if (suppressClickRef.current) return;
		setSelectedRackTileId(current => (current === rackTileId ? null : rackTileId));
	}, []);

	const onBoardCellClick = useCallback(
		(cellId: CellId) => {
			if (!ENABLE_CLICK_PLACEMENT) return;
			if (suppressClickRef.current) return;
			if (selectedRackTileId) {
				placeTileOnCell(selectedRackTileId, cellId);
				setSelectedRackTileId(null);
				return;
			}

			const occupyingTile = getPlacedTileByCellId(cellId);
			if (occupyingTile) {
				removePlacedTile(occupyingTile.rackTileId);
			}
		},
		[getPlacedTileByCellId, placeTileOnCell, removePlacedTile, selectedRackTileId],
	);

	const placementValidation = useMemo(() => getPlacementValidation(placedTiles, puzzle.board), [placedTiles, puzzle.board]);
	const currentAttemptScore = useMemo(() => calculateDraftScore(placedTiles, puzzle.board), [placedTiles, puzzle.board]);

	const onSubmitCurrentAttempt = useCallback(() => {
		if (!placementValidation.isSubmittable || !placementValidation.axis) return;
		const placementAxis: Axis = placementValidation.axis;

		const candidateWord = placementValidation.candidateWord;
		const isValidWord = mockPuzzleValidWordSet.has(candidateWord);
		if (!isValidWord) {
			setSubmissionFeedback({ type: "invalid", message: `"${candidateWord.toUpperCase()}" is not in the valid sub-word list.` });
			return;
		}

		const attemptNumber = savedProgress.attemptsUsed + 1;
		const placementCells = placementValidation.orderedTiles.map(tile => tile.cellId);
		const rackTileIdsInPlacementOrder = placementValidation.orderedTiles.map(tile => tile.rackTileId);
		const now = new Date().toISOString();

		setSavedProgress(prev => {
			const nextAttemptsUsed = prev.attemptsUsed + 1;
			const totalScore = prev.totalScore + currentAttemptScore.total;

			return {
				...prev,
				attemptsUsed: nextAttemptsUsed,
				totalScore,
				status: nextAttemptsUsed >= MAX_ATTEMPTS ? "completed" : prev.status,
				updatedAt: now,
				completedAt: nextAttemptsUsed >= MAX_ATTEMPTS ? now : prev.completedAt,
				attempts: [
					...prev.attempts,
					{
						id: `attempt-${attemptNumber}`,
						attemptNumber,
						submittedAt: now,
						word: candidateWord,
						rackTileIdsUsed: rackTileIdsInPlacementOrder,
						placement: {
							direction: placementAxis,
							startCellId: placementCells[0],
							placementCells,
							rackTileIdsInPlacementOrder,
						},
						score: currentAttemptScore,
					},
				],
			};
		});

		setPlacedTiles([]);
		setSelectedRackTileId(null);
		setSubmissionFeedback({ type: "valid", message: `Accepted "${candidateWord.toUpperCase()}".` });
	}, [currentAttemptScore, placementValidation, savedProgress.attemptsUsed]);

	const onDragStart = useCallback(
		(event: DragStartEvent) => {
			console.log("start", event);
			const sourceRackTileId = parseRackTileId(event.operation.source?.id);
			if (sourceRackTileId) {
				const placedTile = placedTiles.find(tile => tile.rackTileId === sourceRackTileId);
				const letterFromRack = puzzle.rackTiles.find(tile => tile.id === sourceRackTileId)?.letter;
				setActiveDragLetter(placedTile?.letter ?? letterFromRack ?? null);
			}

			suppressClickRef.current = true;
		},
		[placedTiles, puzzle.rackTiles],
	);

	const onDragEnd = useCallback(
		(event: DragEndEvent) => {
			console.log("end", event);
			setActiveDragLetter(null);
			if (event.canceled) {
				setTimeout(() => {
					suppressClickRef.current = false;
				}, 0);
				return;
			}

			const sourceRackTileId = parseRackTileId(event.operation.source?.id);
			if (!sourceRackTileId) {
				setTimeout(() => {
					suppressClickRef.current = false;
				}, 0);
				return;
			}
			const sourceOrigin = event.operation.source?.data?.source;

			const targetId = event.operation.target?.id;
			const targetCellId = parseCellId(targetId);

			if (targetCellId) {
				placeTileOnCell(sourceRackTileId, targetCellId);
				setSelectedRackTileId(null);
				setTimeout(() => {
					suppressClickRef.current = false;
				}, 0);
				return;
			}

			if (targetId === TRAY_DROP_ID) {
				removePlacedTile(sourceRackTileId);
				setSelectedRackTileId(null);
				setTimeout(() => {
					suppressClickRef.current = false;
				}, 0);
				return;
			}

			if (!event.operation.target && sourceOrigin === "board") {
				removePlacedTile(sourceRackTileId);
				setSelectedRackTileId(null);
			}

			setTimeout(() => {
				suppressClickRef.current = false;
			}, 0);
		},
		[placeTileOnCell, removePlacedTile],
	);

	const progress = useMemo<GameProgress>(
		() => ({
			...savedProgress,
			currentAttempt: {
				attemptNumber: savedProgress.attemptsUsed + 1,
				placedTiles,
				score: currentAttemptScore,
			},
		}),
		[currentAttemptScore, placedTiles, savedProgress],
	);

	const value = useMemo<GameContextValue>(
		() => ({
			puzzle,
			progress,
			isClickPlacementEnabled: ENABLE_CLICK_PLACEMENT,
			selectedRackTileId,
			placementValidation,
			submissionFeedback,
			activeDragLetter,
			isRackTileInUse,
			getPlacedTileByCellId,
			onRackTileClick,
			onBoardCellClick,
			onDragStart,
			onDragEnd,
			onSubmitCurrentAttempt,
		}),
		[
			activeDragLetter,
			getPlacedTileByCellId,
			isRackTileInUse,
			onBoardCellClick,
			onDragEnd,
			onDragStart,
			onRackTileClick,
			onSubmitCurrentAttempt,
			placementValidation,
			progress,
			puzzle,
			selectedRackTileId,
			submissionFeedback,
		],
	);

	return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameContext() {
	const context = useContext(GameContext);
	if (!context) {
		throw new Error("useGameContext must be used inside GameProvider");
	}
	return context;
}

export const gameDndIds = {
	tileDragPrefix: TILE_DRAG_PREFIX,
	cellDropPrefix: CELL_DROP_PREFIX,
	trayDropId: TRAY_DROP_ID,
	rackTileType: RACK_TILE_DND_TYPE,
};
