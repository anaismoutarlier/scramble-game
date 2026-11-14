import { Button } from "../button";
import { cn } from "@/lib/cn";
import { useGameContext } from "@/context/GameContext";
import { MAX_ATTEMPTS } from "@/game-config/constants";

type AttemptsPanelProps = {
	onGiveUp?: () => void;
	isBusy?: boolean;
	className?: string;
};

export default function AttemptsPanel({ onGiveUp, isBusy = false, className }: AttemptsPanelProps) {
	const { puzzle, progress } = useGameContext();
	const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - progress.attemptsUsed);
	const canGiveUp = progress.status === "in_progress" && progress.attemptsUsed > 0;
	const attemptSlots = Array.from({ length: MAX_ATTEMPTS }, (_, index) => {
		const attemptNumber = index + 1;
		const attempt = progress.attempts.find(item => item.attemptNumber === attemptNumber);
		return { attemptNumber, attempt };
	});

	return (
		<aside className={cn("w-full rounded-2xl py-5 flex flex-col gap-3 items-end justify-end", className)}>
			<header className="w-full flex items-center justify-between">
				<div className="text-light text-[17px] font-bold font-sans">Attempts</div>
				<div className="bg-primary rounded-xl px-2.5 py-1 text-dark text-xs font-bold font-sans">{attemptsRemaining} left</div>
			</header>

			<div className="w-full h-px bg-primary" />

			<div className="w-full flex flex-col gap-2">
				{attemptSlots.map(({ attemptNumber, attempt }) => (
					<AttemptRow
						key={`${puzzle.id}-attempt-${attemptNumber}`}
						attemptNumber={attemptNumber}
						word={attempt?.word}
						score={attempt?.score.total}
					/>
				))}
			</div>

			<div className="w-full h-px bg-primary" />

			<div className="w-full flex items-center justify-between">
				<div className="text-primary text-[13px] font-semibold font-sans">Total</div>
				<div className="text-light text-sm sm:text-base md:text-lg leading-none font-bold font-sans">{progress.totalScore} pts</div>
			</div>

			{progress.status === "in_progress" && canGiveUp && (
				<Button variant="outlined" onClick={onGiveUp} disabled={isBusy || !canGiveUp}>
					Give Up
				</Button>
			)}
		</aside>
	);
}

function AttemptRow({ attemptNumber, word, score }: { attemptNumber: number; word?: string; score?: number }) {
	const hasResult = Boolean(word);
	return (
		<div className={cn("w-full py-1 sm:py-2 flex items-center justify-between gap-2.5", !hasResult && "opacity-25")}>
			<div className="flex gap-1 items-center">
				<div className="size-[22px] shrink-0 bg-primary border-2 border-primary rounded-[11px] inline-flex items-center justify-center">
					<span className="text-dark text-[11px] font-bold font-sans leading-none">{attemptNumber}</span>
				</div>
				<div className="text-light text-sm font-normal font-sans truncate">{hasResult ? `${word?.toUpperCase()}` : "Waiting…"}</div>
			</div>
			{typeof score === "number" && (
				<div className="bg-primary rounded-xl px-2.5 py-1 text-dark text-[10px] leading-none font-bold font-sans">{score} pts</div>
			)}
		</div>
	);
}
