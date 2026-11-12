import type { BoardTemplate, OngoingAttempt } from "@/hooks/types";
import { BoardTile } from "./BoardTile";

export function Board({ board, currentAttempt }: { board: BoardTemplate; currentAttempt: OngoingAttempt }) {
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
	const placedLettersByCellId = new Map(currentAttempt.placedTiles.map(tile => [tile.cellId, tile.letter]));
	const getPlacedLetterAt = (row: number, column: number) => {
		const neighborCell = cellsByCoordinate.get(`${row}:${column}`);
		return neighborCell ? placedLettersByCellId.get(neighborCell.id) : undefined;
	};

	return (
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
	);
}
