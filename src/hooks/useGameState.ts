import { useGameContext } from "@/context/GameContext";
import type { BoardCell, BoardTemplate, PuzzleDefinition } from "./types";

export { type PuzzleDefinition, type BoardCell, type BoardTemplate };

export const useGameState = () => {
	const { puzzle, progress } = useGameContext();
	return { puzzle, progress };
};
