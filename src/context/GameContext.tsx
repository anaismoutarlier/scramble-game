"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/react";
import type { CellId, GameProgress, OngoingAttemptTile, PuzzleDefinition, RackTileId, RackTile, RackTiles } from "@/context/types";
import { calculateDraftScore, getPlacementValidation, type PlacementValidation } from "@/context/game-domain";
import {
	persistStoredProgress,
	persistStreakStorage,
	readStoredProgressForPuzzle,
	readStreakStorageForPuzzle,
	type StreakStorage,
	type StoredProgress,
} from "@/context/game-storage";
import { CELL_DROP_PREFIX, ENABLE_CLICK_PLACEMENT, RACK_TILE_DND_TYPE, TILE_DRAG_PREFIX, TRAY_DROP_ID } from "@/game-config/constants";
import { useGameProgressActions } from "@/context/useGameProgressActions";
import { usePuzzleOfTheDay } from "@/context/usePuzzleOfTheDay";
import { useRackBoardInteractions } from "@/context/useRackBoardInteractions";

type GameContextValue = {
	puzzle: PuzzleDefinition;
	progress: GameProgress;
	rackTiles: RackTiles | [];
	currentStreak: number;
	onStartPuzzle: () => void;
	onGiveUpPuzzle: () => void;
	onShuffleRackTiles: () => void;
	isClickPlacementEnabled: boolean;
	selectedRackTileId: RackTileId | null;
	placementValidation: PlacementValidation;
	activeDragLetter: string | null;
	isRackTileInUse: (rackTileId: RackTileId) => boolean;
	getPlacedTileByCellId: (cellId: CellId) => OngoingAttemptTile | undefined;
	onRackTileClick: (rackTileId: RackTileId) => void;
	onBoardCellClick: (cellId: CellId) => void;
	onDragStart: (event: DragStartEvent) => void;
	onDragEnd: (event: DragEndEvent) => void;
	onSubmitCurrentAttempt: () => void;
	recallRackTiles: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

type GameProviderStateProps = {
	children: ReactNode;
	puzzle: PuzzleDefinition;
};

export function GameProvider({ children }: { children: ReactNode }) {
	const { puzzle, loadErrorMessage } = usePuzzleOfTheDay();

	if (loadErrorMessage) {
		return (
			<main className="w-full min-h-screen flex items-center justify-center px-6">
				<p className="text-light text-sm sm:text-base font-semibold font-sans text-center">{loadErrorMessage}</p>
			</main>
		);
	}

	if (!puzzle) {
		return (
			<main className="w-full min-h-screen flex items-center justify-center px-6">
				<p className="text-light text-sm sm:text-base font-semibold font-sans text-center">Loading today&apos;s puzzle...</p>
			</main>
		);
	}

	return (
		<GameProviderState key={puzzle.id} puzzle={puzzle}>
			{children}
		</GameProviderState>
	);
}

function shuffle<T>(array: Array<T>) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

function isRackTileArray(arr: RackTile[]): arr is [RackTile, RackTile, RackTile, RackTile, RackTile, RackTile, RackTile] {
	return arr.length === 7;
}

function GameProviderState({ children, puzzle }: GameProviderStateProps) {
	const [savedProgress, setSavedProgress] = useState<StoredProgress>(() => readStoredProgressForPuzzle(puzzle));
	const [streakStorage, setStreakStorage] = useState<StreakStorage>(() => readStreakStorageForPuzzle(puzzle.id));
	const [rackTiles, setRackTiles] = useState<RackTiles | []>([]);

	const onShuffleRackTiles = useCallback(() => {
		setRackTiles(prev => {
			const arr = shuffle([...prev]);
			if (isRackTileArray(arr)) return arr;
			return prev;
		});
	}, []);

	useEffect(() => {
		if (rackTiles.length) return;
		(() => {
			setRackTiles(puzzle.rackTiles);
		})();
	}, [rackTiles, puzzle.rackTiles]);

	useEffect(() => {
		persistStoredProgress(savedProgress);
	}, [savedProgress]);

	useEffect(() => {
		persistStreakStorage(streakStorage);
	}, [streakStorage]);

	const {
		placedTiles,
		selectedRackTileId,
		activeDragLetter,
		getPlacedTileByCellId,
		isRackTileInUse,
		onRackTileClick,
		onBoardCellClick,
		onDragStart,
		onDragEnd,
		resetInteractionState,
	} = useRackBoardInteractions({
		board: puzzle.board,
		rackTiles: puzzle.rackTiles,
	});

	const placementValidation = useMemo(() => getPlacementValidation(placedTiles, puzzle.board), [placedTiles, puzzle.board]);
	const shouldApplySlamBonus = placementValidation.isSubmittable && placementValidation.orderedTiles.length === puzzle.rackTiles.length;
	const currentAttemptScore = useMemo(
		() =>
			calculateDraftScore(placedTiles, puzzle.board, {
				applySlamBonus: shouldApplySlamBonus,
			}),
		[placedTiles, puzzle.board, shouldApplySlamBonus],
	);

	const { onSubmitCurrentAttempt, onGiveUpPuzzle, onStartPuzzle, recallRackTiles } = useGameProgressActions({
		savedProgress,
		setSavedProgress,
		setStreakStorage,
		placementValidation,
		currentAttemptScore,
		resetInteractionState,
	});

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
			currentStreak: streakStorage.currentStreak,
			onStartPuzzle,
			onGiveUpPuzzle,
			isClickPlacementEnabled: ENABLE_CLICK_PLACEMENT,
			selectedRackTileId,
			placementValidation,
			activeDragLetter,
			isRackTileInUse,
			getPlacedTileByCellId,
			onRackTileClick,
			onBoardCellClick,
			onDragStart,
			onDragEnd,
			onSubmitCurrentAttempt,
			rackTiles,
			onShuffleRackTiles,
			recallRackTiles,
		}),
		[
			activeDragLetter,
			streakStorage.currentStreak,
			getPlacedTileByCellId,
			isRackTileInUse,
			onBoardCellClick,
			onDragEnd,
			onDragStart,
			onRackTileClick,
			onGiveUpPuzzle,
			onStartPuzzle,
			onSubmitCurrentAttempt,
			placementValidation,
			progress,
			puzzle,
			selectedRackTileId,
			rackTiles,
			onShuffleRackTiles,
			recallRackTiles,
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
