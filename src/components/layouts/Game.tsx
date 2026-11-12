import { Board } from "../board";
import type { OngoingAttempt, PuzzleDefinition } from "@/hooks/types";

export const GameLayout = ({ puzzle, currentAttempt }: { puzzle: PuzzleDefinition; currentAttempt: OngoingAttempt }) => {
	return (
		<main className="w-full flex justify-center h-screen items-center py-20 px-10">
			<div>
				<Board board={puzzle.board} currentAttempt={currentAttempt} />
			</div>
		</main>
	);
};
