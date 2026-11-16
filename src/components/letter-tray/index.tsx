"use client";

import { useDroppable } from "@dnd-kit/react";
import { LetterTile } from "./LetterTile";
import { gameDndIds, useGameContext } from "@/context/GameContext";
import { cn } from "@/lib/cn";
import { Button } from "../button";
import { Shuffle } from "lucide-react";

export function LetterTray() {
	const { rackTiles, onShuffleRackTiles, selectedRackTileId, isRackTileInUse, onRackTileClick, isClickPlacementEnabled } =
		useGameContext();
	const { ref, isDropTarget } = useDroppable({
		id: gameDndIds.trayDropId,
		accept: gameDndIds.rackTileType,
		data: { dropType: "tray" },
	});

	return (
		<section className="w-full max-w-full rounded-2xl pb-5 flex flex-col items-center justify-center gap-3">
			<header className="w-full flex items-center justify-between">
				<h2 className="text-center text-light text-xs sm:text-sm md:text-base font-bold font-sans">Your Letters</h2>
				<Button
					aria-label="Shuffle letter tray"
					icon={Shuffle}
					variant="outlined"
					className="h-9 px-4 text-xs !font-normal"
					onClick={onShuffleRackTiles}
					iconProps={{ size: 14, strokeWidth: 1.4 }}
				>
					Shuffle
				</Button>
			</header>

			<div className="w-full h-px bg-primary" />

			<p className="w-full text-light pb-4 text-[10px] sm:text-xs leading-snug font-normal text-center">
				Drag and drop tiles, or click a tile and then click a board square.
			</p>

			<div
				ref={ref}
				className={cn(
					"w-full flex flex-wrap items-start justify-center gap-1 rounded-lg transition-colors",
					isDropTarget && "bg-primary/10",
				)}
			>
				{rackTiles.map(rackTile => (
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
