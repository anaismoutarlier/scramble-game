import Image from "next/image";
import { cn } from "@/lib/cn";

export function Wordmark({ className, size = "default" }: { className?: string; size?: "default" | "compact" }) {
	return (
		<div className={cn("inline-flex items-center gap-1", className)}>
			<span className={cn("text-light font-baby-gemoy", size === "compact" ? "text-xl" : "text-2xl lg:text-3xl")}>
				S<span className="text-tile-tl-surface">C</span>
				<span className="text-tile-dw-surface">R</span>a
			</span>
			<Image height={size === "compact" ? 14 : 20} width={size === "compact" ? 14 : 20} src="/star.svg" alt="" />
			<span className={cn("text-light font-baby-gemoy", size === "compact" ? "text-xl" : "text-2xl lg:text-3xl")}>
				<span className="text-tile-tw-surface">M</span>B<span className="text-tile-dl-surface">L</span>E
			</span>
		</div>
	);
}
