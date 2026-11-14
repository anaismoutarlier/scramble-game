"use client";

import { useCallback, useEffect, useRef } from "react";
import { useDraggable } from "@dnd-kit/react";
import { alphabet } from "../../../api/_lib/alphabet";
import { RackTile } from "@/context/types";
import { cn } from "@/lib/cn";
import { gameDndIds } from "@/context/GameContext";

export function LetterTileDraggable({
	letter,
	isInUse,
	isSelected,
	onSelect,
}: {
	letter: RackTile;
	isInUse: boolean;
	isSelected: boolean;
	onSelect?: (rackTileId: string) => void;
}) {
	const { ref, handleRef } = useDraggable({
		id: `${gameDndIds.tileDragPrefix}${letter.id}`,
		type: gameDndIds.rackTileType,
		disabled: isInUse,
		data: { rackTileId: letter.id, source: "tray" },
	});
	const tileNodeRef = useRef<HTMLDivElement | null>(null);
	const setTileRef = useCallback(
		(element: HTMLDivElement | null) => {
			const previousElement = tileNodeRef.current;
			if (previousElement === element) {
				if (element) {
					ref(element);
					handleRef(element);
				}
				return;
			}

			if (previousElement) {
				ref(null);
				handleRef(null);
			}

			tileNodeRef.current = element;
			if (element) {
				ref(element);
				handleRef(element);
			}
		},
		[handleRef, ref],
	);
	useEffect(() => {
		return () => {
			tileNodeRef.current = null;
			ref(null);
			handleRef(null);
		};
	}, [handleRef, ref]);
	const letterValue = alphabet[letter.letter];
	return (
		<div
			ref={setTileRef}
			role={onSelect ? "button" : undefined}
			tabIndex={onSelect ? 0 : undefined}
			onClick={onSelect ? () => onSelect(letter.id) : undefined}
			onKeyDown={event => {
				if (!onSelect) return;
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					onSelect(letter.id);
				}
			}}
			className={cn(
				"size-10 md:size-12 bg-tile-letter-surface rounded-md sm:rounded-lg border-b-[1.5px] sm:border-b-[3px] border-neutral-900/60 inline-flex flex-col justify-center items-center font-sans text-dark focus:outline-none focus:ring-2 focus:ring-primary/70 select-none touch-none",
				isInUse ? "opacity-50 cursor-not-allowed" : "opacity-100 cursor-grab active:cursor-grabbing",
				isSelected && "ring-2 ring-primary",
			)}
			aria-pressed={onSelect ? isSelected : undefined}
		>
			<div className="text-xs sm:text-base md:text-xl font-bold leading-tight uppercase pointer-events-none">{letter.letter}</div>
			<div className="text-[7px] sm:text-[9px] leading-none pointer-events-none">{letterValue}</div>
		</div>
	);
}

export const LetterTileInert = ({ letter, letterValue }: { letter: string; letterValue: number }) => {
	return (
		<div
			className={cn(
				"size-10 md:size-12 bg-tile-letter-surface rounded-md sm:rounded-lg border-b-[1.5px] sm:border-b-[3px] border-neutral-900/60 inline-flex flex-col justify-center items-center font-sans text-dark focus:outline-none focus:ring-2 focus:ring-primary/70 select-none touch-none",
				"opacity-50 cursor-not-allowed",
			)}
		>
			<div className="text-xs sm:text-base md:text-xl font-bold leading-tight uppercase pointer-events-none">{letter}</div>
			<div className="text-[7px] sm:text-[9px] leading-none pointer-events-none">{letterValue}</div>
		</div>
	);
};

export const LetterTile = ({
	letter,
	isInUse,
	isSelected,
	onSelect,
}: {
	letter: RackTile;
	isInUse: boolean;
	isSelected: boolean;
	onSelect?: (rackTileId: string) => void;
}) => {
	const letterValue = alphabet[letter.letter];
	if (isInUse) return <LetterTileInert letter={letter.letter} letterValue={letterValue} />;
	else return <LetterTileDraggable letter={letter} isInUse={isInUse} isSelected={isSelected} onSelect={onSelect} />;
};
