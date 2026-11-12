import { useDraggable } from "@dnd-kit/react";
import { alphabet } from "@/data/alphabet";
import { RackTile } from "@/hooks/types";
import { cn } from "@/lib/cn";
import { gameDndIds } from "@/context/GameContext";

export function LetterTile({
	letter,
	isInUse,
	isSelected,
	onSelect,
}: {
	letter: RackTile;
	isInUse: boolean;
	isSelected: boolean;
	onSelect: (rackTileId: string) => void;
}) {
	const { ref } = useDraggable({
		id: `${gameDndIds.tileDragPrefix}${letter.id}`,
		type: gameDndIds.rackTileType,
		disabled: isInUse,
		data: { rackTileId: letter.id, source: "tray" },
	});
	const letterValue = alphabet[letter.letter];
	return (
		<div
			ref={ref}
			role="button"
			tabIndex={0}
			onClick={() => onSelect(letter.id)}
			onKeyDown={event => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					onSelect(letter.id);
				}
			}}
			className={cn(
				"size-10 md:size-12 bg-tile-letter-surface rounded-md sm:rounded-lg border-b-[1.5px] sm:border-b-[3px] border-neutral-900/60 inline-flex flex-col justify-center items-center font-sans text-dark focus:outline-none focus:ring-2 focus:ring-primary/70",
				isInUse ? "opacity-50 cursor-not-allowed" : "opacity-100 cursor-grab active:cursor-grabbing",
				isSelected && "ring-2 ring-primary",
			)}
			aria-pressed={isSelected}
		>
			<div className="text-xs sm:text-base md:text-xl font-bold leading-tight uppercase">{letter.letter}</div>
			<div className="text-[7px] sm:text-[9px] leading-none">{letterValue}</div>
		</div>
	);
}
