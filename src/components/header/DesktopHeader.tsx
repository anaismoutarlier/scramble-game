import { CurrentStreakCard } from "../current-streak-card";
import { Wordmark } from "../wordmark";
import { HowToPlay } from "../how-to-play";

export const DesktopHeader = ({
	date,
	currentStreak,
	puzzleNo,
	wordmarkRef,
}: {
	date: string;
	currentStreak?: string | number;
	puzzleNo: string | number;
	wordmarkRef?: (element: HTMLDivElement | null) => void;
}) => {
	return (
		<header className="hidden md:block w-full px-3 h-[100px]">
			<div className="px-6 w-full flex justify-between py-2 h-25 border-b-[0.5px] border-primary">
				<div className="inline-flex flex-col lg:flex-row gap-1 lg:gap-3 justify-center lg:justify-start lg:items-center">
					<div ref={wordmarkRef}>
						<Wordmark />
					</div>
					<div className="inline-flex gap-3 text-light text-xs font-normal font-sans items-start lg:items-center">
						<div className="hidden lg:block">•</div>
						<div>A daily word puzzle</div>
					</div>
				</div>
				<div className="inline-flex gap-5 items-center">
					{currentStreak && Number(currentStreak) > 0 && <CurrentStreakCard currentStreak={currentStreak} />}
					<div className="inline-flex flex-col justify-center items-center gap-0.5">
						<div className="text-primary text-center text-[12px] lg:text-xs font-semibold font-sans uppercase tracking-wider">
							{date}
						</div>
						<div className="text-light text-center text-sm lg:text-base font-bold font-sans">Day #{puzzleNo}</div>
					</div>
					<span className="w-px h-10 bg-primary" />
					<HowToPlay />
				</div>
			</div>
		</header>
	);
};
