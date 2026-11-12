"use client";

import { KeyboardSensor, PointerSensor, DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { PointerActivationConstraints } from "@dnd-kit/dom";
import { useMemo } from "react";
import { Board } from "../board";
import { LetterTray } from "../letter-tray";
import AttemptsPanel from "../attempts-panel";
import { useGameContext } from "@/context/GameContext";

export const GameLayout = () => {
	const { onDragStart, onDragEnd, activeDragLetter } = useGameContext();
	const sensors = useMemo(
		() => [
			PointerSensor.configure({
				activationConstraints: [new PointerActivationConstraints.Distance({ value: 6 })],
			}),
			KeyboardSensor,
		],
		[],
	);

	return (
		<DragDropProvider sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
			<main className="w-full flex justify-center min-h-[calc(100vh-100px)] items-start py-6 sm:py-12 px-6 lg:px-10">
				<div className="w-full flex flex-col items-center md:items-start md:flex-row md:justify-center gap-8 xl:gap-12">
					<div className="w-full max-w-100 flex flex-col order-1">
						<LetterTray />
						<div className="hidden md:block">
							<AttemptsPanel />
						</div>
					</div>
					<div className="order-2">
						<Board />
					</div>
					<div className="w-full max-w-lg order-3 md:hidden">
						<AttemptsPanel />
					</div>
				</div>
			</main>
			<DragOverlay>
				{activeDragLetter ? (
					<div className="size-10 md:size-12 bg-tile-letter-surface rounded-md sm:rounded-lg border-b-[1.5px] sm:border-b-[3px] border-neutral-900/60 inline-flex flex-col justify-center items-center font-sans text-dark select-none shadow-md">
						<div className="text-xs sm:text-base md:text-xl font-bold leading-tight uppercase">{activeDragLetter}</div>
					</div>
				) : null}
			</DragOverlay>
		</DragDropProvider>
	);
};
