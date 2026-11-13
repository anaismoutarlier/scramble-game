"use client";

import { type ReactNode } from "react";
import { BoardTile } from "../../../board/BoardTile";
import { PuzzleDefinition } from "@/context/types";
import { cn } from "@/lib/cn";

type BoardCellSlotProps = { colStart: number; children: ReactNode };

const BoardCellSlot = ({ colStart, children }: BoardCellSlotProps) => <div style={{ gridColumnStart: colStart }}>{children}</div>;

type ReviewBoardProps = {
	puzzle: PuzzleDefinition;
	word: string;
	score: number;
	placementCellIds: string[];
	isSlam: boolean;
	colorScheme?: "dark" | "light";
	onShowOtherPlacements?: () => void;
	placementCounterLabel?: string;
};

export function ReviewBoard({
	puzzle,
	word,
	score,
	placementCellIds,
	isSlam,
	colorScheme = "dark",
	onShowOtherPlacements,
	placementCounterLabel,
}: ReviewBoardProps) {
	const board = puzzle.board;
	const letters = word.toUpperCase().split("");
	const placedLettersByCellId = new Map(placementCellIds.map((cellId, index) => [cellId, letters[index] ?? ""] as const));

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

	const getPlacedLetterAt = (row: number, column: number) => {
		const neighborCell = cellsByCoordinate.get(`${row}:${column}`);
		return neighborCell ? placedLettersByCellId.get(neighborCell.id) : undefined;
	};

	const isLightScheme = colorScheme === "light";

	return (
		<article className="w-full min-w-full md:min-w-[42rem] shrink-0 snap-center flex flex-col items-center gap-4">
			<h3
				className={cn(
					"text-xl leading-none font-bold font-sans uppercase tracking-[0.01em]",
					isLightScheme ? "text-dark" : "text-light",
				)}
			>
				{word.toUpperCase()}
			</h3>

			<div
				className={cn(
					"relative border border-[0.5px] rounded-3xl p-3 sm:p-4 md:p-[18px] [--tile-size:clamp(26px,calc(72vw/7),63px)]",
					isLightScheme ? "border-dark/20" : "border-light/60",
				)}
			>
				{placementCounterLabel && (
					<div className="absolute top-2 left-2 sm:top-5 sm:left-5 px-3 py-2 inline-flex items-center z-10">
						<span className="text-dark text-xs sm:text-sm leading-none font-sans tabular-nums">{placementCounterLabel}</span>
					</div>
				)}

				<div className="absolute top-2 right-2 sm:top-5 sm:right-5 origin-top-right scale-70 sm:scale-100 bg-primary rounded-3xl px-4 py-2.5 sm:py-3 inline-flex items-center gap-2 z-10">
					<span className="text-dark text-xs sm:text-sm leading-none font-bold font-sans">
						{isSlam && `⭐ `}
						{score} points
					</span>
				</div>

				<div className="w-full flex flex-col items-center">
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
									const hasLeftNeighbor = Boolean(getPlacedLetterAt(cell.coordinate.row, cell.coordinate.column - 1));
									const hasRightNeighbor = Boolean(getPlacedLetterAt(cell.coordinate.row, cell.coordinate.column + 1));
									const hasTopNeighbor = Boolean(getPlacedLetterAt(cell.coordinate.row - 1, cell.coordinate.column));
									const hasBottomNeighbor = Boolean(getPlacedLetterAt(cell.coordinate.row + 1, cell.coordinate.column));

									return (
										<BoardCellSlot key={cell.id} colStart={colStart}>
											<BoardTile
												{...cell}
												placedLetter={placedLetter}
												hasLeftNeighbor={hasLeftNeighbor}
												hasRightNeighbor={hasRightNeighbor}
												hasTopNeighbor={hasTopNeighbor}
												hasBottomNeighbor={hasBottomNeighbor}
												colorScheme={colorScheme}
											/>
										</BoardCellSlot>
									);
								})}
							</div>
						);
					})}
				</div>
			</div>

			{onShowOtherPlacements && (
				<button
					type="button"
					onClick={onShowOtherPlacements}
					className="text-xs sm:text-sm leading-tight font-normal font-sans cursor-pointer underline text-dark"
				>
					Show next placement for {word.toUpperCase()}
				</button>
			)}
		</article>
	);
}
