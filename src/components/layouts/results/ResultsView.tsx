"use client";

import moment from "moment";
import { use, useEffect, useMemo, useState, Suspense } from "react";
import { io } from "next/cache";
import { Share2 } from "lucide-react";
import { Button } from "../../button";
import { cn } from "@/lib/cn";
import { mockPuzzleValidWords } from "@/data/mockPuzzleValidWords";
import { calculateTopScoringWords } from "@/lib/bestPossibleWords";
import { getResultOutcomeLabel } from "@/data/resultOutcomeTiers";
import { GameProgress, PuzzleDefinition } from "@/hooks/types";

const MAX_ATTEMPTS = 5;

function getCountdownToNextMidnight() {
	const now = moment();
	const nextMidnight = moment().add(1, "day").startOf("day");
	const diffMs = Math.max(0, nextMidnight.diff(now));
	const duration = moment.duration(diffMs);
	const hours = String(Math.floor(duration.asHours())).padStart(2, "0");
	const minutes = String(duration.minutes()).padStart(2, "0");
	const seconds = String(duration.seconds()).padStart(2, "0");

	return `${hours}:${minutes}:${seconds}`;
}

function NextPuzzleCountdown() {
	use(io());
	const [countdown, setCountdown] = useState(() => getCountdownToNextMidnight());

	useEffect(() => {
		const interval = window.setInterval(() => {
			setCountdown(getCountdownToNextMidnight());
		}, 1000);

		return () => {
			window.clearInterval(interval);
		};
	}, []);

	return <div className="text-primary text-xl sm:text-2xl font-semibold tracking-[0.5px] tabular-nums">{countdown}</div>;
}

type ResultWordRowProps = {
	attemptNumber: number;
	word?: string;
	score?: number;
};

function ResultWordRow({ attemptNumber, word, score }: ResultWordRowProps) {
	const hasResult = Boolean(word) && typeof score === "number";

	return (
		<div className={cn("w-full py-1 sm:py-2 flex items-center justify-between gap-2.5", !hasResult && "opacity-25")}>
			<div className="flex gap-2 items-center">
				<div className="size-[22px] shrink-0 bg-primary border-2 border-primary rounded-[11px] inline-flex items-center justify-center">
					<span className="text-dark text-[11px] font-bold font-sans leading-none">{attemptNumber}</span>
				</div>
				<div className="text-light text-base font-bold font-sans truncate">{hasResult ? word?.toUpperCase() : "Waiting…"}</div>
			</div>
			{typeof score === "number" && (
				<div className="bg-primary rounded-xl px-2.5 py-1 text-dark text-[13px] leading-none font-bold font-sans">{score} pts</div>
			)}
		</div>
	);
}

export const ResultsMainContent = ({
	puzzle,
	progress,
	toggleView,
}: {
	puzzle: PuzzleDefinition;
	progress: GameProgress;
	toggleView: (v: "results" | "review") => void;
}) => {
	const bestPossibleWords = useMemo(() => calculateTopScoringWords(puzzle, mockPuzzleValidWords), [puzzle]);
	const bestPossibleScore = useMemo(
		() => bestPossibleWords.reduce((total, wordEntry) => total + wordEntry.score, 0),
		[bestPossibleWords],
	);

	const totalScore = progress.totalScore;
	const percentOfBestPossible = bestPossibleScore > 0 ? Math.round((totalScore / bestPossibleScore) * 100) : 0;
	const clampedPercent = Math.max(0, Math.min(100, percentOfBestPossible));
	const pointsShort = Math.max(0, bestPossibleScore - totalScore);
	const outcomeLabel = getResultOutcomeLabel(clampedPercent);

	const attempts = useMemo(() => {
		const orderedAttempts = [...progress.attempts].sort((a, b) => a.attemptNumber - b.attemptNumber);
		return Array.from({ length: MAX_ATTEMPTS }, (_, index) => {
			const attemptNumber = index + 1;
			const matchingAttempt = orderedAttempts.find(attempt => attempt.attemptNumber === attemptNumber);
			return {
				attemptNumber,
				word: matchingAttempt?.word,
				score: matchingAttempt?.score.total,
			};
		});
	}, [progress.attempts]);

	return (
		<main className="w-full flex justify-center min-h-[calc(100vh-100px)] items-start px-6 lg:px-10 py-8 sm:py-10 md:py-12">
			<section className="w-full max-w-[860px] flex flex-col gap-6 items-center">
				<div className="w-full flex flex-col gap-5 items-center">
					<div className="w-full flex flex-col items-center gap-0.5">
						<div className="text-light text-sm sm:text-base font-bold font-sans">Day #{puzzle.id}</div>
						<h1 className="text-primary text-3xl sm:text-[30px] leading-9 font-bold font-sans text-center">{outcomeLabel}</h1>
					</div>
					<div className="w-full h-px bg-primary/50" />

					<div className="w-full rounded-2xl p-5 flex flex-col gap-3.5">
						<div className="w-full flex items-end justify-between gap-3">
							<div className="flex flex-col gap-0.5">
								<div className="text-light text-xs font-semibold font-sans">Your total</div>
								<div className="text-light font-sans font-bold leading-none">
									<span className="text-5xl sm:text-[52px] tracking-[-1px]">{totalScore}</span>
									<span className="text-lg sm:text-[18px]">{` pts`}</span>
								</div>
							</div>

							<div className="flex flex-col items-end gap-0.5">
								<div className="text-light text-xs font-semibold font-sans">Best possible</div>
								<div className="text-light font-sans font-bold leading-none">
									<span className="text-3xl sm:text-[30px]">{bestPossibleScore}</span>
									<span className="text-base sm:text-[16px]">{` pts`}</span>
								</div>
							</div>
						</div>

						<div className="w-full flex flex-col gap-2">
							<div className="w-full flex items-baseline justify-between gap-3">
								<div className="text-light text-[13px] font-bold font-sans">{clampedPercent}% of best possible</div>
								<div className="text-light text-xs font-normal font-sans">{pointsShort} pts short</div>
							</div>
							<div className="w-full h-2 rounded bg-transparent border border-light/70 overflow-hidden">
								<div className="h-full bg-primary rounded" style={{ width: `${clampedPercent}%` }} />
							</div>
						</div>

						<div className="text-light text-[10px] leading-3 font-normal font-sans">
							Best possible is the combined score of today&apos;s five highest-scoring words, using this board and letters.
						</div>
					</div>
				</div>

				<div className="w-full flex flex-col gap-3">
					<div className="w-full flex items-center justify-center">
						<h2 className="text-light text-[17px] font-bold font-sans">Your five words</h2>
					</div>
					<div className="w-full h-px bg-primary/50" />
					<div className="w-full flex flex-col gap-1">
						{attempts.map(attempt => (
							<ResultWordRow
								key={`${puzzle.id}-result-word-${attempt.attemptNumber}`}
								attemptNumber={attempt.attemptNumber}
								word={attempt.word}
								score={attempt.score}
							/>
						))}
					</div>
					<div className="w-full h-px bg-primary/50" />
					<div className="w-full flex items-center justify-between">
						<div className="text-primary text-[13px] font-semibold font-sans">Total</div>
						<div className="text-light text-2xl sm:text-[28px] leading-none font-bold font-sans">{totalScore} pts</div>
					</div>
				</div>

				<div className="w-full flex flex-col gap-2.5">
					<Button className="w-full" theme="light" icon={Share2}>
						Share Results
					</Button>
					<Button variant="outlined" theme="primary" className="w-full" onClick={() => toggleView("review")}>
						Review words
					</Button>
				</div>

				<div className="w-full flex items-center justify-between gap-3">
					<div className="flex flex-col gap-0.5">
						<div className="text-light text-[15px] font-bold font-sans">Next daily puzzle</div>
						<div className="text-primary text-xs font-normal font-sans">A fresh board awaits.</div>
					</div>
					<Suspense>
						<NextPuzzleCountdown />
					</Suspense>
				</div>
			</section>
		</main>
	);
};
