"use client";

import { useDroppable } from "@dnd-kit/react";
import { LetterTile } from "./LetterTile";
import { gameDndIds, useGameContext } from "@/context/GameContext";
import { cn } from "@/lib/cn";

export function LetterTray() {
	const { puzzle, selectedRackTileId, isRackTileInUse, onRackTileClick, isClickPlacementEnabled } = useGameContext();
	const { ref, isDropTarget } = useDroppable({
		id: gameDndIds.trayDropId,
		accept: gameDndIds.rackTileType,
		data: { dropType: "tray" },
	});

	return (
		<section className="w-full max-w-full rounded-2xl pb-5 flex flex-col items-center justify-center gap-1 sm:gap-3">
			<header className="w-full flex items-center justify-center">
				<h2 className="text-center text-light text-xs sm:text-sm md:text-base font-bold font-sans">Your Letters</h2>
			</header>

			<div className="w-full h-px bg-primary" />

			<p className="w-full text-light pb-4 text-[10px] sm:text-xs leading-snug font-normal text-center">
				Drag and drop tiles to fill the board.
			</p>

			<div
				ref={ref}
				className={cn(
					"w-full flex flex-wrap items-start justify-center gap-1 rounded-lg transition-colors",
					isDropTarget && "bg-primary/10",
				)}
			>
				{puzzle.rackTiles.map(rackTile => (
					<LetterTile
						key={rackTile.id}
						letter={rackTile}
						isInUse={isRackTileInUse(rackTile.id)}
						isSelected={isClickPlacementEnabled && selectedRackTileId === rackTile.id}
						onSelect={
							isClickPlacementEnabled
								? tileId => {
										if (isRackTileInUse(tileId)) return;
										onRackTileClick(tileId);
									}
								: undefined
						}
					/>
				))}
			</div>
		</section>
	);
}
