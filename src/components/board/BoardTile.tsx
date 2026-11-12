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
}: BoardCell & {
	colStart?: number;
	placedLetter?: string;
	hasLeftNeighbor?: boolean;
	hasRightNeighbor?: boolean;
	hasTopNeighbor?: boolean;
	hasBottomNeighbor?: boolean;
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
			className={cn(
				"h-[63px] w-[63px] flex justify-center items-center p-[3px]",
				connectedRadiusClass,
				placedLetter && !isIsolatedPlacement ? "bg-tile-letter-surface" : "",
			)}
			style={{ gridColumnStart: colStart }}
		>
			<div
				className={cn(
					"w-full h-full relative outline-2 rounded-sm flex justify-center items-center uppercase",
					placedLetter ? `${outlineColor} bg-tile-letter-surface` : bgColor,
					placedLetter ? "text-dark" : textColor,
				)}
			>
				{placedLetter && (
					<>
						<span className="text-dark absolute top-1 left-1 font-semibold text-[10px]">{tileValue}</span>
						<span className={cn("uppercase absolute top-1 font-semibold right-1 text-[10px]", textColor)}>{bonus}</span>
						{isCenter && (
							<div className="absolute bottom-1 left-0 w-full flex justify-center">
								<span className="text-[9px]">★</span>
							</div>
						)}
					</>
				)}
				{placedLetter ? (
					<span className="font-semibold text-xl">{placedLetter}</span>
				) : (
					<span className="font-oi">{isCenter ? "★" : bonus}</span>
				)}
			</div>
		</div>
	);
}
