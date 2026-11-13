"use client";
import moment from "moment";
import { cn } from "@/lib/cn";
import { DesktopHeader } from "./DesktopHeader";
import { MobileHeader } from "./MobileHeader";
import { useGameContext } from "@/context/GameContext";

export const Header = ({
	stage = "game",
	currentStreak = 7,
	onDesktopWordmarkReady,
	onMobileWordmarkReady,
}: {
	stage?: "start" | "start-game" | "game";
	currentStreak?: string | number;
	onDesktopWordmarkReady?: (element: HTMLDivElement | null) => void;
	onMobileWordmarkReady?: (element: HTMLDivElement | null) => void;
}) => {
	const { puzzle } = useGameContext();
	const displayDate = moment(puzzle.date).format("MMMM DD[th], YYYY");
	const shouldShowHeaderContent = stage === "game";

	return (
		<div className="relative">
			<div className="h-[100px] md:hidden" aria-hidden />
			<div className={cn("transition-opacity duration-300", shouldShowHeaderContent ? "opacity-100" : "opacity-0 pointer-events-none")}>
				<DesktopHeader
					currentStreak={currentStreak}
					date={displayDate}
					puzzleNo={puzzle.id}
					wordmarkRef={onDesktopWordmarkReady}
				/>
				<MobileHeader
					currentStreak={currentStreak}
					date={displayDate}
					puzzleNo={puzzle.id}
					wordmarkRef={onMobileWordmarkReady}
				/>
			</div>
		</div>
	);
};
