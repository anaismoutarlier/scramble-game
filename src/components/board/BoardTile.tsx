import type { BoardCell } from "@/hooks/types";
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
	dw: "outline-tile-dw-text",
	dl: "outline-tile-dl-text",
	tw: "outline-tile-tw-text",
	tl: "outline-tile-tl-text",
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
}: BoardCell & {
	colStart?: number;
	placedLetter?: string;
	hasLeftNeighbor?: boolean;
	hasRightNeighbor?: boolean;
	hasTopNeighbor?: boolean;
	hasBottomNeighbor?: boolean;
	onClick?: () => void;
	isInteractive?: boolean;
}) {
	const textColor = isCenter ? textColors.center : bonus ? textColors[bonus] : "";
	const bgColor = isCenter ? bgColors.center : bonus ? bgColors[bonus] : "bg-light/60";
	const outlineColor = bonus ? outlineColors[bonus] : "outline-transparent";

	const tileValue = placedLetter ? alphabet[placedLetter] : null;
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
				"h-[var(--tile-size)] w-[var(--tile-size)] flex justify-center items-center max-[400px]:p-[1.5px] p-[3px]",
				isInteractive && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/70",
				connectedRadiusClass,
				placedLetter && !isIsolatedPlacement ? "bg-tile-letter-surface" : "",
			)}
			style={{ gridColumnStart: colStart }}
		>
			<div
				className={cn(
					"w-full h-full relative rounded-sm flex justify-center items-center uppercase",
					placedLetter ? `max-[400px]:outline-[0.5px] outline-1 md:outline-2 ${outlineColor} bg-tile-letter-surface` : bgColor,
					placedLetter ? "text-dark" : textColor,
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
					<span className="font-oi text-[9px] md:text-xs xl:text-sm">{isCenter ? "★" : bonus}</span>
				)}
			</div>
		</div>
	);
}
