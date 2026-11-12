import Image from "next/image";
import { cn } from "@/lib/cn";

export function Wordmark({ className, size = "default" }: { className?: string; size?: "default" | "compact" | "hero" }) {
	const textSize =
		size === "hero" ? "text-5xl tracking-[-0.035em]" : size === "compact" ? "text-xl" : "text-2xl lg:text-3xl";
	const iconSize = size === "hero" ? 38 : size === "compact" ? 14 : 20;

	return (
		<div className={cn("inline-flex items-center gap-1", className)}>
			<span className={cn("text-light font-baby-gemoy", textSize)}>
				S<span className="text-tile-tl-surface">C</span>
				<span className="text-tile-dw-surface">R</span>a
			</span>
			<Image height={iconSize} width={iconSize} src="/star.svg" alt="" />
			<span className={cn("text-light font-baby-gemoy", textSize)}>
				<span className="text-tile-tw-surface">M</span>B<span className="text-tile-dl-surface">L</span>E
			</span>
		</div>
	);
}
