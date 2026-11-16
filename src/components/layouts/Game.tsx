"use client";

import { KeyboardSensor, PointerSensor, DragDropProvider, DragOverlay } from "@dnd-kit/react";
import { PointerActivationConstraints } from "@dnd-kit/dom";
import { useMemo, useState } from "react";
import { Board } from "../board";
import { LetterTray } from "../letter-tray";
import AttemptsPanel from "../attempts-panel";
import { GiveUpDialog } from "./GiveUpDialog";
import { useGameContext } from "@/context/GameContext";
import { MAX_ATTEMPTS } from "@/game-config/constants";

export const GameLayout = () => {
	const { onDragStart, onDragEnd, activeDragLetter, onGiveUpPuzzle, progress } = useGameContext();
	const [isGiveUpDialogOpen, setIsGiveUpDialogOpen] = useState(false);
	const [isGivingUp, setIsGivingUp] = useState(false);
	const attemptsForfeited = Math.max(0, MAX_ATTEMPTS - progress.attemptsUsed);
	const canGiveUp = progress.status === "in_progress" && progress.attemptsUsed > 0;

	const handleOpenGiveUpDialog = () => {
		if (!canGiveUp) return;
		setIsGiveUpDialogOpen(true);
	};

	const handleConfirmGiveUp = () => {
		setIsGivingUp(true);
		onGiveUpPuzzle();
		setIsGiveUpDialogOpen(false);
		setIsGivingUp(false);
	};

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
				<div className="w-full flex flex-col items-center md:items-start md:flex-row md:justify-center gap-4 md:gap-8 xl:gap-12">
					<div className="w-full max-w-100 flex flex-col order-1">
						<LetterTray />
						<div className="hidden md:block">
							<AttemptsPanel onGiveUp={handleOpenGiveUpDialog} isBusy={isGivingUp} />
						</div>
					</div>
					<div className="order-2">
						<Board />
					</div>
					<div className="w-full max-w-lg order-3 md:hidden">
						<AttemptsPanel onGiveUp={handleOpenGiveUpDialog} isBusy={isGivingUp} />
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
			<GiveUpDialog
				open={isGiveUpDialogOpen}
				isGivingUp={isGivingUp}
				attemptsForfeited={attemptsForfeited}
				onOpenChange={setIsGiveUpDialogOpen}
				onCancel={() => setIsGiveUpDialogOpen(false)}
				onConfirm={handleConfirmGiveUp}
			/>
		</DragDropProvider>
	);
};
