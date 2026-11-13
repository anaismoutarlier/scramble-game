import { Button } from "../button";
import { Info } from "lucide-react";
import { useGameContext } from "@/context/GameContext";
import moment from "moment";
import { cn } from "@/lib/cn";
import { Wordmark } from "../wordmark";

type StartProps = {
	onPlay: () => void;
	onWordmarkReady?: (element: HTMLDivElement | null) => void;
};

export function Start({ onPlay, onWordmarkReady }: StartProps) {
	const { puzzle } = useGameContext();
	const prettyDate = moment(puzzle.date).format("MMMM Do, YYYY").toUpperCase();

	return (
		<main className="w-full flex justify-center min-h-[calc(100vh-100px)] items-start px-6 lg:px-10 pb-8 sm:pb-10 md:pb-12">
			<section className="w-full max-w-3xl flex flex-col items-center gap-6 sm:gap-8 text-center mt-24 sm:mt-28 md:mt-32">
				<div className="inline-flex flex-col items-center gap-0.5">
					<div ref={onWordmarkReady} className={cn("transition-opacity duration-150")}>
						<Wordmark size="hero" />
					</div>
					<div className={cn("text-light text-[11px] font-normal font-sans transition-opacity duration-150")}>
						A daily word puzzle
					</div>
				</div>

				<div className="w-full flex flex-col items-center gap-2.5">
					<h1 className="text-light text-3xl sm:text-4xl leading-tight font-normal font-sans max-w-[20ch]">
						Seven letters. Five chances. One daily challenge.
					</h1>
					<p className="text-light text-sm sm:text-base leading-relaxed font-normal font-sans max-w-[64ch]">
						Put your vocabulary and strategy to the test! Build words across the board, make every letter count, and see how
						close you can get to the day&apos;s perfect score. A new puzzle awaits every day. How high can you score?
					</p>
				</div>

				<div className="inline-flex flex-wrap justify-center items-center gap-2.5">
					<Button variant="outlined" icon={Info}>
						How to Play
					</Button>
					<Button onClick={onPlay}>Play</Button>
				</div>

				<div className="flex flex-col items-center gap-0.5">
					<div className="text-primary text-[10px] tracking-[1.5px] uppercase font-semibold font-sans">{prettyDate}</div>
					<div className="text-light text-base font-bold font-sans">#{puzzle.id}</div>
				</div>
			</section>
		</main>
	);
}
