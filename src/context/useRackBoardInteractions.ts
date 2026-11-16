"use client";

import { useCallback, useRef, useState } from "react";
import type { DragEndEvent, DragStartEvent } from "@dnd-kit/react";
import {
	ENABLE_CLICK_PLACEMENT,
	TRAY_DROP_ID,
} from "@/game-config/constants";
import {
	parseCellId,
	parseRackTileId,
} from "@/context/game-domain";
import type {
	BoardTemplate,
	CellId,
	OngoingAttemptTile,
	RackTile,
	RackTileId,
} from "@/context/types";

type UseRackBoardInteractionsArgs = {
	board: BoardTemplate;
	rackTiles: readonly RackTile[];
};

export const useRackBoardInteractions = ({ board, rackTiles }: UseRackBoardInteractionsArgs) => {
	const [placedTiles, setPlacedTiles] = useState<OngoingAttemptTile[]>([]);
	const [selectedRackTileId, setSelectedRackTileId] = useState<RackTileId | null>(null);
	const [activeDragLetter, setActiveDragLetter] = useState<string | null>(null);
	const suppressClickRef = useRef(false);

	const placeTileOnCell = useCallback(
		(rackTileId: RackTileId, cellId: CellId) => {
			const tileFromRack = rackTiles.find(tile => tile.id === rackTileId);
			if (!tileFromRack || !board.cellsById[cellId]) return;

			setPlacedTiles(prev => {
				const withoutSource = prev.filter(tile => tile.rackTileId !== rackTileId);
				const withoutTarget = withoutSource.filter(tile => tile.cellId !== cellId);
				return [...withoutTarget, { rackTileId, cellId, letter: tileFromRack.letter }];
			});
		},
		[board.cellsById, rackTiles],
	);

	const removePlacedTile = useCallback((rackTileId: RackTileId) => {
		setPlacedTiles(prev => prev.filter(tile => tile.rackTileId !== rackTileId));
		setSelectedRackTileId(current => (current === rackTileId ? null : current));
		setActiveDragLetter(null);
		suppressClickRef.current = false;
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

	const resetDragSuppression = useCallback(() => {
		suppressClickRef.current = false;
	}, []);

	const finalizeDrag = useCallback(
		(nextSelectedRackTileId: RackTileId | null = null) => {
			setSelectedRackTileId(current => {
				if (nextSelectedRackTileId !== null) return nextSelectedRackTileId;
				return current === nextSelectedRackTileId ? current : null;
			});
			setActiveDragLetter(null);
			resetDragSuppression();
		},
		[resetDragSuppression],
	);

	const onDragStart = useCallback(
		(event: DragStartEvent) => {
			const sourceRackTileId = parseRackTileId(event.operation.source?.id);
			if (sourceRackTileId) {
				setSelectedRackTileId(current => (current === sourceRackTileId ? null : current));
				const placedTile = placedTiles.find(tile => tile.rackTileId === sourceRackTileId);
				const letterFromRack = rackTiles.find(tile => tile.id === sourceRackTileId)?.letter;
				setActiveDragLetter(placedTile?.letter ?? letterFromRack ?? null);
			}

			suppressClickRef.current = true;
		},
		[placedTiles, rackTiles],
	);

	const onDragEnd = useCallback(
		(event: DragEndEvent) => {
			const sourceRackTileId = parseRackTileId(event.operation.source?.id);
			if (event.canceled || !sourceRackTileId) {
				finalizeDrag();
				return;
			}

			const sourceOrigin = event.operation.source?.data?.source;
			const targetId = event.operation.target?.id;
			const targetCellId = parseCellId(targetId);

			if (targetCellId) {
				placeTileOnCell(sourceRackTileId, targetCellId);
				finalizeDrag(null);
				return;
			}

			if (targetId === TRAY_DROP_ID) {
				removePlacedTile(sourceRackTileId);
				finalizeDrag(null);
				return;
			}

			if (!event.operation.target && sourceOrigin === "board") {
				removePlacedTile(sourceRackTileId);
			}

			finalizeDrag();
		},
		[finalizeDrag, placeTileOnCell, removePlacedTile],
	);

	const resetInteractionState = useCallback(() => {
		setPlacedTiles([]);
		setSelectedRackTileId(null);
		setActiveDragLetter(null);
		suppressClickRef.current = false;
	}, []);

	return {
		placedTiles,
		setPlacedTiles,
		selectedRackTileId,
		setSelectedRackTileId,
		activeDragLetter,
		setActiveDragLetter,
		getPlacedTileByCellId,
		isRackTileInUse,
		onRackTileClick,
		onBoardCellClick,
		onDragStart,
		onDragEnd,
		resetInteractionState,
	};
};
