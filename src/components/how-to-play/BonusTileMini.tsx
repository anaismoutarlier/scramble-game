import type { BonusTile } from "@/context/types";
import { cn } from "@/lib/cn";

const bonusTileStyles: Record<BonusTile, { label: string; surfaceClass: string; textClass: string }> = {
	dl: {
		label: "DL",
		surfaceClass: "bg-tile-dl-surface/60",
		textClass: "text-tile-dl-text",
	},
	tl: {
		label: "TL",
		surfaceClass: "bg-tile-tl-surface",
		textClass: "text-tile-tl-text",
	},
	dw: {
		label: "DW",
		surfaceClass: "bg-tile-dw-surface",
		textClass: "text-tile-dw-text",
	},
	tw: {
		label: "TW",
		surfaceClass: "bg-tile-tw-surface",
		textClass: "text-tile-tw-text",
	},
};

export function BonusTileMini({ bonus }: { bonus: BonusTile }) {
	const tileStyle = bonusTileStyles[bonus];
	return (
		<div
			className={cn(
				"size-10 shrink-0 inline-flex items-center justify-center rounded-tl-lg rounded-br-lg rounded-tr-md rounded-bl-md",
				tileStyle.surfaceClass,
			)}
			aria-hidden="true"
		>
			<span className={cn("font-oi text-[9px] leading-4 opacity-80", tileStyle.textClass)}>{tileStyle.label}</span>
		</div>
	);
}
