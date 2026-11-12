"use client";
import moment from "moment";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { DesktopHeader } from "./DesktopHeader";
import { MobileHeader } from "./MobileHeader";
import { Wordmark } from "../wordmark";

const LOGO_MOVE_DURATION_MS = 650;
const CONTENT_FADE_IN_DELAY_MS = 150;
const OVERLAY_EXIT_BUFFER_MS = 220;

export const Header = ({
	stage = "game",
	currentStreak = 7,
	puzzleNo = 142,
}: {
	stage?: "start" | "start-game" | "game";
	currentStreak?: string | number;
	puzzleNo?: string | number;
}) => {
	const [date, setDate] = useState("");
	const [showTransitionOverlay, setShowTransitionOverlay] = useState(stage === "start");
	const [logoInCorner, setLogoInCorner] = useState(stage === "game");
	const [showHeaderContent, setShowHeaderContent] = useState(stage === "game");

	useEffect(() => {
		(() => {
			setDate(moment().format("MMMM DD[th], YYYY"));
		})();
	}, []);

	useEffect(() => {
		if (stage !== "game") {
			return;
		}

		const instantFrame = window.requestAnimationFrame(() => {
			setShowTransitionOverlay(false);
			setLogoInCorner(true);
			setShowHeaderContent(true);
		});

		return () => {
			window.cancelAnimationFrame(instantFrame);
		};
	}, [stage]);

	useEffect(() => {
		if (stage !== "start-game" || !showTransitionOverlay || showHeaderContent) {
			return;
		}

		const moveAnimationFrame = window.requestAnimationFrame(() => {
			setLogoInCorner(true);
		});

		const revealHeaderTimeout = window.setTimeout(() => {
			setShowHeaderContent(true);
		}, LOGO_MOVE_DURATION_MS + CONTENT_FADE_IN_DELAY_MS);

		const hideOverlayTimeout = window.setTimeout(() => {
			setShowTransitionOverlay(false);
		}, LOGO_MOVE_DURATION_MS + CONTENT_FADE_IN_DELAY_MS + OVERLAY_EXIT_BUFFER_MS);

		return () => {
			window.cancelAnimationFrame(moveAnimationFrame);
			window.clearTimeout(revealHeaderTimeout);
			window.clearTimeout(hideOverlayTimeout);
		};
	}, [stage, showHeaderContent, showTransitionOverlay]);

	const isImmediateGameStage = stage === "game";
	const shouldShowHeaderContent = isImmediateGameStage || showHeaderContent;
	const shouldShowTransitionOverlay = !isImmediateGameStage && showTransitionOverlay;
	const shouldPinLogoInCorner = isImmediateGameStage || logoInCorner;

	return (
		<div className="relative">
			<div className="h-[100px] md:hidden" aria-hidden />
			<div className={cn("transition-opacity duration-500", shouldShowHeaderContent ? "opacity-100" : "opacity-0 pointer-events-none")}>
				<DesktopHeader currentStreak={currentStreak} date={date} puzzleNo={puzzleNo} />
				<MobileHeader currentStreak={currentStreak} date={date} puzzleNo={puzzleNo} />
			</div>

			{shouldShowTransitionOverlay && (
				<div className="fixed inset-0 z-50 pointer-events-none">
					<div
						className={cn(
							"absolute flex flex-col items-center gap-0.5 transition-all ease-out",
							shouldPinLogoInCorner
								? "left-4 top-6 md:left-10 md:top-6 scale-[0.48] md:scale-[0.62] opacity-100 duration-[650ms]"
								: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-100 opacity-100 duration-[650ms]",
							stage === "start" && "transition-none",
						)}
					>
						<Wordmark size="hero" />
						<div className="text-light text-[11px] font-normal font-sans">A daily word puzzle</div>
					</div>
				</div>
			)}
		</div>
	);
};
