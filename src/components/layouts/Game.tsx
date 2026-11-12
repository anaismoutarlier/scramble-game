import { DragDropProvider } from "@dnd-kit/react";
import { Board } from "../board";
import { LetterTray } from "../letter-tray";
import AttemptsPanel from "../attempts-panel";
import { useGameContext } from "@/context/GameContext";

export const GameLayout = () => {
	const { onDragStart, onDragEnd } = useGameContext();

	return (
		<DragDropProvider onDragStart={onDragStart} onDragEnd={onDragEnd}>
			<main className="w-full flex justify-center min-h-[calc(100vh-100px)] items-start py-6 sm:py-12 px-6 lg:px-10">
				<div className="w-full gap-8 xl:gap-12 hidden md:flex justify-center">
					<div className="w-full max-w-100 flex flex-col">
						<LetterTray />
						<AttemptsPanel />
					</div>
					<Board />
				</div>
				<div className="w-full flex max-w-lg flex-col items-center md:hidden gap-8">
					<div className="flex flex-col w-full items-center gap-2">
						<LetterTray />
						<Board />
					</div>
					<AttemptsPanel />
				</div>
			</main>
		</DragDropProvider>
	);
};
