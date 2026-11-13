"use client";

import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MoveLeft } from "lucide-react";
import { useGameContext } from "@/context/GameContext";
import { ReviewBoard } from "./components/ReviewBoard";
import { calculateTopScoringWords } from "@/lib/bestPossibleWords";
import { mockPuzzleValidWords } from "@/data/mockPuzzleValidWords";

type ReviewProps = {
	toggleView: (v: "results" | "review") => void;
};

export function Review({ toggleView }: ReviewProps) {
	const { puzzle, progress } = useGameContext();
	const attemptsScrollContainerRef = useRef<HTMLDivElement | null>(null);
	const bestWordsScrollContainerRef = useRef<HTMLDivElement | null>(null);
	const [selectedPlacementIndexByWord, setSelectedPlacementIndexByWord] = useState<Record<string, number>>({});
	const [attemptsCanScrollPrev, setAttemptsCanScrollPrev] = useState(false);
	const [attemptsCanScrollNext, setAttemptsCanScrollNext] = useState(false);
	const [bestWordsCanScrollPrev, setBestWordsCanScrollPrev] = useState(false);
	const [bestWordsCanScrollNext, setBestWordsCanScrollNext] = useState(false);

	const attempts = useMemo(
		() =>
			[...progress.attempts]
				.sort((a, b) => a.attemptNumber - b.attemptNumber)
				.filter(attempt => Boolean(attempt.word?.trim().length)),
		[progress.attempts],
	);

	const bestWords = useMemo(() => calculateTopScoringWords(puzzle, mockPuzzleValidWords, { limit: 10 }), [puzzle]);

	const updateScrollButtons = useCallback(
		(
			containerRef: RefObject<HTMLDivElement | null>,
			setCanScrollPrev: (value: boolean) => void,
			setCanScrollNext: (value: boolean) => void,
		) => {
			const container = containerRef.current;
			if (!container) {
				setCanScrollPrev(false);
				setCanScrollNext(false);
				return;
			}

			const { scrollLeft, clientWidth, scrollWidth } = container;
			const atStart = scrollLeft <= 1;
			const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;

			setCanScrollPrev(!atStart);
			setCanScrollNext(!atEnd);
		},
		[],
	);

	useEffect(() => {
		const attemptsContainer = attemptsScrollContainerRef.current;
		const bestWordsContainer = bestWordsScrollContainerRef.current;

		const syncAttemptScrollState = () =>
			updateScrollButtons(attemptsScrollContainerRef, setAttemptsCanScrollPrev, setAttemptsCanScrollNext);
		const syncBestWordsScrollState = () =>
			updateScrollButtons(bestWordsScrollContainerRef, setBestWordsCanScrollPrev, setBestWordsCanScrollNext);

		syncAttemptScrollState();
		syncBestWordsScrollState();

		attemptsContainer?.addEventListener("scroll", syncAttemptScrollState, { passive: true });
		bestWordsContainer?.addEventListener("scroll", syncBestWordsScrollState, { passive: true });
		window.addEventListener("resize", syncAttemptScrollState);
		window.addEventListener("resize", syncBestWordsScrollState);

		return () => {
			attemptsContainer?.removeEventListener("scroll", syncAttemptScrollState);
			bestWordsContainer?.removeEventListener("scroll", syncBestWordsScrollState);
			window.removeEventListener("resize", syncAttemptScrollState);
			window.removeEventListener("resize", syncBestWordsScrollState);
		};
	}, [attempts.length, bestWords.length, selectedPlacementIndexByWord, updateScrollButtons]);

	const scrollByCard = (containerRef: RefObject<HTMLDivElement | null>, direction: "left" | "right", cardSelector: string) => {
		const container = containerRef.current;
		if (!container) return;

		const card = container.querySelector<HTMLElement>(cardSelector);
		const gapValue = window.getComputedStyle(container).columnGap || window.getComputedStyle(container).gap;
		const gap = Number.parseFloat(gapValue) || 0;
		const cardWidth = card?.offsetWidth ?? container.clientWidth;
		const delta = cardWidth + gap;

		container.scrollBy({
			left: direction === "left" ? -delta : delta,
			behavior: "smooth",
		});

		window.requestAnimationFrame(() => {
			if (containerRef === attemptsScrollContainerRef) {
				updateScrollButtons(attemptsScrollContainerRef, setAttemptsCanScrollPrev, setAttemptsCanScrollNext);
				return;
			}

			updateScrollButtons(bestWordsScrollContainerRef, setBestWordsCanScrollPrev, setBestWordsCanScrollNext);
		});
	};

	return (
		<main className="w-full min-h-[calc(100vh-100px)] px-2 sm:px-6 lg:px-10 py-12 sm:py-16 md:py-20">
			<section className="w-full max-w-[980px] mx-auto flex flex-col gap-8 sm:gap-10">
				<button
					type="button"
					onClick={() => toggleView("results")}
					aria-label="Return to your results"
					className="absolute top-3 left-3 sm:top-6 sm:left-6 w-fit inline-flex cursor-pointer items-center gap-2.5 pb-0.5 border-b border-light text-light"
				>
					<MoveLeft className="size-4" strokeWidth={1.4} aria-hidden="true" />
					<span className="text-base leading-none font-sans">Go back</span>
				</button>

				<div className="w-full flex flex-col gap-3 items-center">
					<div className="w-full flex justify-center">
						<h2 className="text-light text-xl font-bold font-sans">Your words</h2>
					</div>
					<div className="w-full max-w-4xl h-px bg-primary/50" />
					<p className="text-center text-light text-xs max-w-3xl">
						Here are your attempts today, in order of how many points you got. Take a look at the highest scoring words of the
						day below. How close did you get today?
					</p>

					<div className="w-full relative">
						<button
							type="button"
							aria-label="Previous attempt"
							disabled={!attemptsCanScrollPrev}
							onClick={() => scrollByCard(attemptsScrollContainerRef, "left", "[data-review-board-card]")}
							className={`cursor-pointer inline-flex absolute -left-2 sm:left-2 top-1/2 z-10 transition-opacity ${attemptsCanScrollPrev ? "text-light/85 hover:text-light opacity-100" : "opacity-0 pointer-events-none"}`}
						>
							<ChevronLeft className="size-4 sm:size-8" strokeWidth={1.5} />
						</button>

						<div
							ref={attemptsScrollContainerRef}
							className="w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar flex items-start gap-2.5 p-2.5"
						>
							{attempts
								.sort((a, b) => b.score.total - a.score.total)
								.map(attempt => (
									<div
										key={`${attempt.attemptNumber}-${attempt.word}`}
										data-review-board-card
										className="w-full min-w-full snap-center"
									>
										<ReviewBoard
											puzzle={puzzle}
											word={attempt.word}
											score={attempt.score.total}
											placementCellIds={attempt.placement.placementCells}
											isSlam={attempt.score.slamBonusApplied || attempt.rackTileIdsUsed.length === 7}
										/>
									</div>
								))}
						</div>

						<button
							type="button"
							aria-label="Next attempt"
							disabled={!attemptsCanScrollNext}
							onClick={() => scrollByCard(attemptsScrollContainerRef, "right", "[data-review-board-card]")}
							className={`cursor-pointer inline-flex absolute -right-2 sm:right-2 top-1/2 z-10 transition-opacity ${attemptsCanScrollNext ? "text-light/85 hover:text-light opacity-100" : "opacity-0 pointer-events-none"}`}
						>
							<ChevronRight className="size-4 sm:size-8" strokeWidth={1.5} />
						</button>
					</div>
				</div>

				<div className="w-full bg-light rounded-xl px-2 md:px-4 pt-6 pb-3.5 sm:px-10 sm:pt-8 sm:pb-5.5 flex items-center flex-col gap-3">
					<div className="mx-2 md:mx-0 w-full flex justify-center">
						<h2 className="text-dark text-base text-center md:text-xl leading-none font-bold font-sans">
							Today&apos;s highest scores
						</h2>
					</div>
					<div className="w-full h-px max-w-4xl bg-primary/70" />
					<p className="text-center text-xs max-w-3xl">
						Discover the highest scoring words for today&apos;s puzzle. Some words can be played in multiple locations on the
						board. As you scroll through, think about how to best place your words in the future. Did you find the best
						placement?
					</p>

					<div className="w-full relative">
						<button
							type="button"
							aria-label="Previous best word"
							disabled={!bestWordsCanScrollPrev}
							onClick={() => scrollByCard(bestWordsScrollContainerRef, "left", "[data-best-word-board-card]")}
							className={`cursor-pointer inline-flex absolute -left-2 sm:left-2 top-1/2 z-10 transition-opacity ${bestWordsCanScrollPrev ? "text-dark/80 hover:text-dark opacity-100" : "opacity-0 pointer-events-none"}`}
						>
							<ChevronLeft className="size-4 sm:size-8" strokeWidth={1.5} />
						</button>

						<div
							ref={bestWordsScrollContainerRef}
							className="w-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory no-scrollbar flex items-start gap-6 p-2.5"
						>
							{bestWords.map(bestWord => {
								const selectedPlacementIndex = selectedPlacementIndexByWord[bestWord.word] ?? 0;
								const placement = bestWord.placements[selectedPlacementIndex % bestWord.placements.length];
								const placementCounterLabel =
									bestWord.placements.length > 1
										? `${(selectedPlacementIndex % bestWord.placements.length) + 1}/${bestWord.placements.length}`
										: undefined;

								return (
									<div key={bestWord.word} data-best-word-board-card className="w-full min-w-full snap-center">
										<ReviewBoard
											puzzle={puzzle}
											word={bestWord.word}
											score={placement.score}
											placementCellIds={placement.placementCellIds}
											isSlam={bestWord.word.length === puzzle.rackTiles.length}
											colorScheme="light"
											placementCounterLabel={placementCounterLabel}
											onShowOtherPlacements={
												bestWord.placements.length > 1
													? () => {
															setSelectedPlacementIndexByWord(current => ({
																...current,
																[bestWord.word]: (selectedPlacementIndex + 1) % bestWord.placements.length,
															}));
														}
													: undefined
											}
										/>
									</div>
								);
							})}
						</div>

						<button
							type="button"
							aria-label="Next best word"
							disabled={!bestWordsCanScrollNext}
							onClick={() => scrollByCard(bestWordsScrollContainerRef, "right", "[data-best-word-board-card]")}
							className={`cursor-pointer inline-flex absolute -right-2 sm:right-2 top-1/2 z-10 transition-opacity ${bestWordsCanScrollNext ? "text-dark/80 hover:text-dark opacity-100" : "opacity-0 pointer-events-none"}`}
						>
							<ChevronRight className="size-4 sm:size-8" strokeWidth={1.5} />
						</button>
					</div>
				</div>
			</section>
		</main>
	);
}
