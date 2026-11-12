import type { BoardTemplate, OngoingAttempt } from "@/hooks/types";
import { BoardTile } from "./BoardTile";
import { Button } from "../button";

export const SubmitTray = () => {
	return (
		<div className="size- inline-flex flex-col px-4 justify-start items-center gap-3 sm:gap-5">
			<div className="inline-flex justify-center items-center gap-3">
				<div className="text-light text-xs sm:text-sm md:text-base font-bold font-sans">Current Score</div>
				<div className="w-px h-5 sm:h-7 md:h-9 bg-primary" />
				<div className="px-4 py-2 bg-primary rounded-3xl flex justify-start items-start gap-1 text-center text-dark text-xs sm:text-sm md:text-base leading-tight font-bold font-sans">
					6 points
				</div>
			</div>
			<Button className="w-full sm:max-w-sm">Submit</Button>
		</div>
	);
};

export function Board({ board, currentAttempt }: { board: BoardTemplate; currentAttempt?: OngoingAttempt }) {
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
								const hasLeftNeighbor = Boolean(getPlacedLetterAt(cell.coordinate.row, cell.coordinate.column - 1));
								const hasRightNeighbor = Boolean(getPlacedLetterAt(cell.coordinate.row, cell.coordinate.column + 1));
								const hasTopNeighbor = Boolean(getPlacedLetterAt(cell.coordinate.row - 1, cell.coordinate.column));
								const hasBottomNeighbor = Boolean(getPlacedLetterAt(cell.coordinate.row + 1, cell.coordinate.column));
								return (
									<BoardTile
										key={cell.id}
										colStart={colStart}
										placedLetter={placedLettersByCellId.get(cell.id)}
										hasLeftNeighbor={hasLeftNeighbor}
										hasRightNeighbor={hasRightNeighbor}
										hasTopNeighbor={hasTopNeighbor}
										hasBottomNeighbor={hasBottomNeighbor}
										{...cell}
									/>
								);
							})}
						</div>
					);
				})}
			</div>
			{currentAttempt && <SubmitTray />}
		</div>
	);
}
