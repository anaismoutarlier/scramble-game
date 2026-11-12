import { Board } from "../board";
import type { GameProgress, PuzzleDefinition } from "@/hooks/types";
import { LetterTray } from "../letter-tray";
import AttemptsPanel from "../attempts-panel";

export const GameLayout = ({ puzzle, progress }: { puzzle: PuzzleDefinition; progress: GameProgress }) => {
	return (
		<main className="w-full flex justify-center min-h-[calc(100vh-100px)] items-start py-6 sm:py-12 px-6 lg:px-10">
			<div className="w-full gap-8 xl:gap-12 hidden md:flex justify-center">
				<div className="w-full max-w-100 flex flex-col">
					<LetterTray rackTiles={puzzle.rackTiles} currentAttempt={progress.currentAttempt} />
					<AttemptsPanel puzzle={puzzle} progress={progress} />
				</div>
				<Board board={puzzle.board} currentAttempt={progress.currentAttempt} />
			</div>
			<div className="w-full flex max-w-lg flex-col items-center md:hidden gap-8">
				<div className="flex flex-col w-full items-center gap-2">
					<LetterTray rackTiles={puzzle.rackTiles} currentAttempt={progress.currentAttempt} />
					<Board board={puzzle.board} currentAttempt={progress.currentAttempt} />
				</div>
				<AttemptsPanel puzzle={puzzle} progress={progress} />
			</div>
		</main>
	);
};
