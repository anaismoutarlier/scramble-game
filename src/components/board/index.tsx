"use client";

import { useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/react";
import { BoardTile } from "./BoardTile";
import { Button } from "../button";
import { gameDndIds, useGameContext } from "@/context/GameContext";
import { cn } from "@/lib/cn";
import { ChevronsDown } from "lucide-react";
import { toast } from "../ui/toast";

const hintMessages = {
	too_short: "Nice try! A word needs at least 2 letters to score.",
	no_center: "Every word starts at the center—anchor your letters there!",
	not_contiguous: "Your tiles need to stay touching like a proper word chain.",
	mixed_axis: "One straight line only—keep it tidy and connected!",
};

const SubmitTray = () => {
	const { progress, placementValidation, onSubmitCurrentAttempt, recallRackTiles } = useGameContext();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const handleSubmit = async () => {
		try {
			setIsSubmitting(true);
			await onSubmitCurrentAttempt();
		} catch {
		} finally {
			setIsSubmitting(false);
		}
	};

	const hasPlacedTiles = progress.currentAttempt?.placedTiles && progress.currentAttempt.placedTiles.length > 0;
	const placementInvalidReason = !placementValidation.isSubmittable ? placementValidation.reason : null;
	const submitButtonDisabled = !placementValidation.isSubmittable || isSubmitting;

	const handleHintMessage = () => {
		if (!placementInvalidReason) return;
		const hintMessage = hintMessages[placementInvalidReason];
		toast.add({ description: hintMessage, type: "warning" });
	};

	return (
		<div className="inline-flex flex-col px-4 justify-start items-center gap-3 sm:gap-5">
			<div className="inline-flex justify-center items-center gap-3">
				<div className="text-light text-xs sm:text-sm md:text-base font-bold font-sans">Current Score</div>
				<div className="w-px h-5 sm:h-7 md:h-9 bg-primary" />
				<div className="px-4 py-2 bg-primary rounded-3xl flex justify-start items-start gap-1 text-center text-dark text-xs sm:text-sm md:text-base leading-tight font-bold font-sans">
					{progress.currentAttempt?.score.total ?? 0} points
				</div>
			</div>
			<div className="w-full flex gap-1">
				<div className="w-full sm:max-w-sm relative">
					{placementInvalidReason && submitButtonDisabled && (
						<button className="opacity-0 absolute inset-0 w-full h-full" aria-hidden onClick={handleHintMessage} />
					)}
					<Button className="w-full" disabled={submitButtonDisabled} onClick={handleSubmit}>
						Play
					</Button>
				</div>
				{hasPlacedTiles && (
					<Button
						aria-label="Recall all played tiles"
						icon={ChevronsDown}
						variant="outlined"
						className="px-4 !font-normal [&_span]:hidden sm:[&_span]:block px-2.5 sm:px-4"
						onClick={recallRackTiles}
						iconProps={{ size: 16, strokeWidth: 1.4 }}
						disabled={isSubmitting || !hasPlacedTiles}
					>
						Recall
					</Button>
				)}
			</div>
		</div>
	);
};

type PlacedTileDraggableProps = {
	rackTileId: string;
	children: React.ReactNode;
};

const PlacedTileDraggable = ({ rackTileId, children }: PlacedTileDraggableProps) => {
	const { ref, isDragging } = useDraggable({
		id: `${gameDndIds.tileDragPrefix}${rackTileId}`,
		type: gameDndIds.rackTileType,
		data: { rackTileId, source: "board" },
	});
	return (
		<div ref={ref} className={cn("select-none touch-none", isDragging && "opacity-80")}>
			{children}
		</div>
	);
};

type BoardCellSlotProps = {
	cellId: string;
	colStart: number;
	children: React.ReactNode;
};

const BoardCellSlot = ({ cellId, colStart, children }: BoardCellSlotProps) => {
	const { ref } = useDroppable({
		id: `${gameDndIds.cellDropPrefix}${cellId}`,
		accept: gameDndIds.rackTileType,
		data: { dropType: "cell", cellId },
	});
	return (
		<div ref={ref} style={{ gridColumnStart: colStart }}>
			{children}
		</div>
	);
};

export function Board() {
	const { puzzle, progress, getPlacedTileByCellId, onBoardCellClick, isClickPlacementEnabled } = useGameContext();
	const board = puzzle.board;
	const currentAttempt = progress.currentAttempt;

	const rowIndices = [
		...new Set(
			board.verticalAxis.map(cellId => board.cellsById[cellId]?.coordinate.row).filter((row): row is number => row !== undefined),
		),
	].sort((a, b) => a - b);
	const colIndices = [
		...new Set(
			board.horizontalAxis
				.map(cellId => board.cellsById[cellId]?.coordinate.column)
				.filter((column): column is number => column !== undefined),
		),
	].sort((a, b) => a - b);

	const cellsByCoordinate = new Map<string, (typeof board.cellsById)[string]>();
	Object.values(board.cellsById).forEach(cell => {
		cellsByCoordinate.set(`${cell.coordinate.row}:${cell.coordinate.column}`, cell);
	});
	const placedLettersByCellId = new Map((currentAttempt?.placedTiles ?? []).map(tile => [tile.cellId, tile.letter]));
	const getPlacedLetterAt = (row: number, column: number) => {
		const neighborCell = cellsByCoordinate.get(`${row}:${column}`);
		return neighborCell ? placedLettersByCellId.get(neighborCell.id) : undefined;
	};

	const hasOngoingAttempt = currentAttempt?.placedTiles && currentAttempt.placedTiles.length > 0;

	return (
		<div className="flex flex-col gap-6 xl:gap-10">
			<div className="flex flex-col w-fit">
				{rowIndices.map(row => {
					const rowCells = colIndices
						.map(column => cellsByCoordinate.get(`${row}:${column}`))
						.filter((cell): cell is NonNullable<typeof cell> => Boolean(cell))
						.sort((a, b) => a.coordinate.column - b.coordinate.column);

					return (
						<div className="grid grid-cols-[repeat(7,var(--tile-size))]" key={`r${row}`}>
							{rowCells.map(cell => {
								const colStart = colIndices.indexOf(cell.coordinate.column) + 1;
								const placedLetter = placedLettersByCellId.get(cell.id);
								const placedTile = getPlacedTileByCellId(cell.id);
								const hasLeftNeighbor = Boolean(getPlacedLetterAt(cell.coordinate.row, cell.coordinate.column - 1));
								const hasRightNeighbor = Boolean(getPlacedLetterAt(cell.coordinate.row, cell.coordinate.column + 1));
								const hasTopNeighbor = Boolean(getPlacedLetterAt(cell.coordinate.row - 1, cell.coordinate.column));
								const hasBottomNeighbor = Boolean(getPlacedLetterAt(cell.coordinate.row + 1, cell.coordinate.column));

								const tileMarkup = (
									<BoardTile
										{...cell}
										placedLetter={placedLetter}
										hasLeftNeighbor={hasLeftNeighbor}
										hasRightNeighbor={hasRightNeighbor}
										hasTopNeighbor={hasTopNeighbor}
										hasBottomNeighbor={hasBottomNeighbor}
										onClick={isClickPlacementEnabled ? () => onBoardCellClick(cell.id) : undefined}
										isInteractive={isClickPlacementEnabled}
									/>
								);

								return (
									<BoardCellSlot key={cell.id} cellId={cell.id} colStart={colStart}>
										{placedTile ? (
											<PlacedTileDraggable rackTileId={placedTile.rackTileId}>{tileMarkup}</PlacedTileDraggable>
										) : (
											tileMarkup
										)}
									</BoardCellSlot>
								);
							})}
						</div>
					);
				})}
			</div>
			{hasOngoingAttempt && <SubmitTray />}
		</div>
	);
}
