"use client";

import type { BoardCell } from "@/context/types";
import { cn } from "@/lib/cn";
import { alphabet } from "@/data/alphabet";

const bgColors = {
	dw: "bg-tile-dw-surface",
	dl: "bg-tile-dl-surface",
	tw: "bg-tile-tw-surface",
	tl: "bg-tile-tl-surface",
	center: "bg-tile-center-surface",
};

const textColors = {
	dw: "text-tile-dw-text",
	dl: "text-tile-dl-text",
	tw: "text-tile-tw-text",
	tl: "text-tile-tl-text",
	center: "text-dark",
};

const outlineColors = {
	dw: "outline-[color-mix(in_oklab,var(--tile-dw-surface)_70%,var(--dark))]",
	dl: "outline-[color-mix(in_oklab,var(--tile-dl-surface)_70%,var(--dark))]",
	tw: "outline-[color-mix(in_oklab,var(--tile-tw-surface)_70%,var(--dark))]",
	tl: "outline-[color-mix(in_oklab,var(--tile-tl-surface)_80%,var(--dark))]",
};

export function BoardTile({
	bonus,
	isCenter,
	colStart,
	placedLetter,
	hasLeftNeighbor,
	hasRightNeighbor,
	hasTopNeighbor,
	hasBottomNeighbor,
	onClick,
	isInteractive = false,
	colorScheme = "dark",
}: BoardCell & {
	colStart?: number;
	placedLetter?: string;
	hasLeftNeighbor?: boolean;
	hasRightNeighbor?: boolean;
	hasTopNeighbor?: boolean;
	hasBottomNeighbor?: boolean;
	onClick?: () => void;
	isInteractive?: boolean;
	colorScheme?: "dark" | "light";
}) {
	const textColor = isCenter ? textColors.center : bonus ? textColors[bonus] : "";
	const bgColor = isCenter ? bgColors.center : bonus ? bgColors[bonus] : colorScheme === "light" ? "bg-dark/20" : "bg-light/60";
	const outlineColor = bonus ? outlineColors[bonus] : "outline-transparent";

	const tileValue = placedLetter ? alphabet[placedLetter.toLowerCase()] : null;
	const hasAnyNeighbor = Boolean(hasLeftNeighbor || hasRightNeighbor || hasTopNeighbor || hasBottomNeighbor);
	const isIsolatedPlacement = placedLetter && !hasAnyNeighbor;
	const connectedRadiusClass =
		!placedLetter || !hasAnyNeighbor
			? "rounded-sm"
			: cn(
					"rounded-none",
					!hasTopNeighbor && !hasLeftNeighbor ? "rounded-tl-sm" : "rounded-tl-none",
					!hasTopNeighbor && !hasRightNeighbor ? "rounded-tr-sm" : "rounded-tr-none",
					!hasBottomNeighbor && !hasLeftNeighbor ? "rounded-bl-sm" : "rounded-bl-none",
					!hasBottomNeighbor && !hasRightNeighbor ? "rounded-br-sm" : "rounded-br-none",
				);

	return (
		<div
			role={isInteractive ? "button" : undefined}
			tabIndex={isInteractive ? 0 : undefined}
			onClick={onClick}
			onKeyDown={event => {
				if (!isInteractive || !onClick) return;
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					onClick();
				}
			}}
			className={cn(
				"h-[var(--tile-size)] w-[var(--tile-size)] flex justify-center items-center max-[400px]:p-[1.5px] p-[3px] select-none",
				isInteractive && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/70",
				connectedRadiusClass,
				placedLetter && !isIsolatedPlacement ? "bg-tile-letter-surface" : "",
			)}
			style={{ gridColumnStart: colStart }}
		>
			<div
				className={cn(
					"w-full h-full relative flex justify-center items-center uppercase pointer-events-none",
					placedLetter
						? `max-[400px]:outline-[0.5px] max-[400px]:-outline-offset-[0.5px] -outline-offset-1 outline-1 md:outline-[1.5px] md:-outline-offset-[1.5px] ${outlineColor} bg-tile-letter-surface`
						: bgColor,
					placedLetter ? "text-dark" : textColor,
					placedLetter ? "rounded-lg" : "rounded-sm",
				)}
			>
				{placedLetter && (
					<>
						<span className="text-dark absolute top-0 sm:top-1 left-1 font-semibold text-[6px] sm:text-[10px]">
							{tileValue}
						</span>
						<span
							className={cn("uppercase absolute top-0 sm:top-1 font-semibold right-1 text-[6px] sm:text-[10px]", textColor)}
						>
							{bonus}
						</span>
						{isCenter && (
							<div className="absolute bottom-0 sm:bottom-1 left-0 w-full flex justify-center">
								<span className="text-[6px] md:text-[9px]">★</span>
							</div>
						)}
					</>
				)}
				{placedLetter ? (
					<span className="font-semibold text-xs sm:text-sm md:text-base lg:text-xl">{placedLetter}</span>
				) : (
					<span className="font-oi max-[300px]:text-[6px] text-[9px] md:text-xs xl:text-sm">{isCenter ? "★" : bonus}</span>
				)}
			</div>
		</div>
	);
}
