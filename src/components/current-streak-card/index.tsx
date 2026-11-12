import { cn } from "@/lib/cn";

export function CurrentStreakCard({
	currentStreak,
	className,
	size = "default",
}: {
	currentStreak: string | number;
	className?: string;
	size?: "default" | "compact";
}) {
	return (
		<div
			className={cn(
				"bg-primary flex flex-col text-dark font-sans justify-center items-center overflow-hidden text-center",
				size === "compact" ? "px-4 py-1.5 rounded-[30px]" : "px-4 lg:px-6 py-2 rounded-[30px]",
				className,
			)}
		>
			<div
				className={cn(
					"font-semibold uppercase leading-none text-nowrap",
					size === "compact" ? "text-[7px] tracking-wider" : "text-xs lg:text-sm tracking-wide",
				)}
			>
				Current Streak
			</div>
			<div
				className={cn(
					"inline-flex font-sans leading-none items-end",
					size === "compact" ? "text-xs gap-0.5" : "text-sm lg:text-base gap-1",
				)}
			>
				<div className="font-black">{currentStreak}</div>
				<div className="font-bold">days</div>
			</div>
		</div>
	);
}
