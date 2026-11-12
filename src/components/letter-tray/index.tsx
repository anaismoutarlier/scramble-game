import { LetterTile } from "./LetterTile";
import type { OngoingAttempt, RackTiles } from "@/hooks/types";

export function LetterTray({ rackTiles, currentAttempt }: { rackTiles: RackTiles; currentAttempt?: OngoingAttempt }) {
	const inUseRackTileIds = new Set(currentAttempt?.placedTiles.map(tile => tile.rackTileId) ?? []);

	return (
		<section className="w-full max-w-full rounded-2xl pb-5 flex flex-col items-center justify-center gap-1 sm:gap-3">
			<header className="w-full flex items-center justify-center">
				<h2 className="text-center text-light text-xs sm:text-sm md:text-base font-bold font-sans">Your Letters</h2>
			</header>

			<div className="w-full h-px bg-primary" />

			<p className="w-full text-light pb-4 text-[10px] sm:text-xs leading-snug font-normal text-center">
				Drag and drop tiles to fill the board. Each word must include the center tile ★ and use only your 7 letters.
			</p>

			<div className="w-full flex flex-wrap items-start justify-center gap-1">
				{rackTiles.map(rackTile => (
					<LetterTile key={rackTile.id} letter={rackTile} isInUse={inUseRackTileIds.has(rackTile.id)} />
				))}
			</div>
		</section>
	);
}
