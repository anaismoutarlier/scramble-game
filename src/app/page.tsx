"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Loader2Icon } from "lucide-react";
import { Header } from "@/components/header";
import { GameLayout } from "@/components/layouts/Game";
import { ResultsLayout } from "@/components/layouts/results";
import { Start } from "@/components/layouts/Start";
import { Footer } from "@/components/footer";
import { GameProvider, useGameContext } from "@/context/GameContext";
import { Toaster } from "@/components/ui/toast";
import { Wordmark } from "@/components/wordmark";
import { cn } from "@/lib/cn";

const START_GAME_STAGE_DURATION_MS = 800;
const GAME_INTERFACE_ENTER_DURATION_MS = 450;
const HEADER_CONTENT_REVEAL_DELAY_MS = 600;
const START_GAME_STAGE_EASING = "cubic-bezier(0.22, 1, 0.36, 1)";

type RectSnapshot = {
	left: number;
	top: number;
	width: number;
	height: number;
};

function GameDataLoadingScreen() {
	return (
		<main className="w-full min-h-screen flex justify-center items-center px-6 lg:px-10 py-8 sm:py-10 md:py-12">
			<div className="inline-flex flex-col items-center gap-3 text-center">
				<Loader2Icon className="size-10 text-primary animate-spin" aria-hidden="true" />
				<p className="text-light text-sm sm:text-base font-semibold font-sans">Syncing your puzzle data…</p>
			</div>
		</main>
	);
}

function ActiveLayout({
	onPlay,
	onStartWordmarkReady,
}: {
	onPlay: () => void;
	onStartWordmarkReady: (element: HTMLDivElement | null) => void;
}) {
	const { progress } = useGameContext();

	if (progress.status === "unstarted") {
		return <Start onPlay={onPlay} onWordmarkReady={onStartWordmarkReady} />;
	}

	return progress.status === "completed" ? <ResultsLayout /> : <GameLayout />;
}

function AppShell() {
	const { currentStreak, progress, onStartPuzzle } = useGameContext();
	const [isTransitionRunning, setIsTransitionRunning] = useState(false);
	const [isGameEntering, setIsGameEntering] = useState(false);
	const [isHeaderContentReady, setIsHeaderContentReady] = useState(true);
	const [hasAnimationStarted, setHasAnimationStarted] = useState(false);
	const [fromRect, setFromRect] = useState<RectSnapshot | null>(null);
	const [toRect, setToRect] = useState<RectSnapshot | null>(null);

	const startWordmarkRef = useRef<HTMLDivElement | null>(null);
	const desktopWordmarkRef = useRef<HTMLDivElement | null>(null);
	const mobileWordmarkRef = useRef<HTMLDivElement | null>(null);
	const transitionTimerRef = useRef<number | null>(null);
	const gameEnterTimerRef = useRef<number | null>(null);
	const headerRevealTimerRef = useRef<number | null>(null);
	const transitionAnimationFrameRef = useRef<number | null>(null);
	const hasPlaySequenceStartedRef = useRef(false);

	const setStartWordmarkRef = useCallback((element: HTMLDivElement | null) => {
		startWordmarkRef.current = element;
	}, []);

	const setDesktopWordmarkRef = useCallback((element: HTMLDivElement | null) => {
		desktopWordmarkRef.current = element;
	}, []);

	const setMobileWordmarkRef = useCallback((element: HTMLDivElement | null) => {
		mobileWordmarkRef.current = element;
	}, []);

	const getRectSnapshot = useCallback((element: HTMLDivElement | null): RectSnapshot | null => {
		if (!element) return null;
		const rect = element.getBoundingClientRect();
		if (rect.width <= 0 || rect.height <= 0) return null;
		return {
			left: rect.left,
			top: rect.top,
			width: rect.width,
			height: rect.height,
		};
	}, []);

	const getHeaderWordmarkTargetRect = useCallback((): RectSnapshot | null => {
		const mobileRect = getRectSnapshot(mobileWordmarkRef.current);
		if (mobileRect && window.matchMedia("(max-width: 767px)").matches) {
			return mobileRect;
		}
		return getRectSnapshot(desktopWordmarkRef.current) ?? mobileRect;
	}, [getRectSnapshot]);

	const completeStartTransition = useCallback(() => {
		setIsTransitionRunning(false);
		setHasAnimationStarted(false);
		setFromRect(null);
		setToRect(null);
	}, []);

	const onPlay = useCallback(() => {
		if (hasPlaySequenceStartedRef.current) return;
		hasPlaySequenceStartedRef.current = true;

		const sourceRect = getRectSnapshot(startWordmarkRef.current);
		const targetRect = getHeaderWordmarkTargetRect();

		if (!sourceRect || !targetRect) {
			onStartPuzzle();
			setIsHeaderContentReady(false);
			setIsGameEntering(true);
			headerRevealTimerRef.current = window.setTimeout(() => {
				setIsHeaderContentReady(true);
				headerRevealTimerRef.current = null;
			}, GAME_INTERFACE_ENTER_DURATION_MS);
			gameEnterTimerRef.current = window.setTimeout(() => {
				setIsGameEntering(false);
				gameEnterTimerRef.current = null;
				hasPlaySequenceStartedRef.current = false;
			}, GAME_INTERFACE_ENTER_DURATION_MS);
			return;
		}

		setFromRect(sourceRect);
		setToRect(targetRect);
		setIsTransitionRunning(true);
		setIsGameEntering(true);
		setIsHeaderContentReady(false);
		setHasAnimationStarted(false);
		onStartPuzzle();

		if (transitionAnimationFrameRef.current !== null) {
			window.cancelAnimationFrame(transitionAnimationFrameRef.current);
		}
		transitionAnimationFrameRef.current = window.requestAnimationFrame(() => {
			setHasAnimationStarted(true);
		});

		if (transitionTimerRef.current !== null) {
			window.clearTimeout(transitionTimerRef.current);
		}
		transitionTimerRef.current = window.setTimeout(() => {
			completeStartTransition();
			transitionTimerRef.current = null;
		}, START_GAME_STAGE_DURATION_MS);

		if (headerRevealTimerRef.current !== null) {
			window.clearTimeout(headerRevealTimerRef.current);
		}
		headerRevealTimerRef.current = window.setTimeout(() => {
			setIsHeaderContentReady(true);
			headerRevealTimerRef.current = null;
		}, HEADER_CONTENT_REVEAL_DELAY_MS);

		if (gameEnterTimerRef.current !== null) {
			window.clearTimeout(gameEnterTimerRef.current);
		}
		gameEnterTimerRef.current = window.setTimeout(() => {
			setIsGameEntering(false);
			gameEnterTimerRef.current = null;
			hasPlaySequenceStartedRef.current = false;
		}, GAME_INTERFACE_ENTER_DURATION_MS);
	}, [completeStartTransition, getHeaderWordmarkTargetRect, getRectSnapshot, onStartPuzzle]);

	useEffect(() => {
		return () => {
			if (transitionAnimationFrameRef.current !== null) {
				window.cancelAnimationFrame(transitionAnimationFrameRef.current);
			}
			if (transitionTimerRef.current !== null) {
				window.clearTimeout(transitionTimerRef.current);
			}
			if (gameEnterTimerRef.current !== null) {
				window.clearTimeout(gameEnterTimerRef.current);
			}
			if (headerRevealTimerRef.current !== null) {
				window.clearTimeout(headerRevealTimerRef.current);
			}
		};
	}, []);

	const shouldShowStartScreen = progress.status === "unstarted";
	const headerStage: "start" | "start-game" | "game" =
		progress.status === "unstarted" ? "start" : isGameEntering || !isHeaderContentReady ? "start-game" : "game";

	const flipStyle = useMemo(() => {
		if (!fromRect || !toRect) return undefined;

		const translateX = toRect.left - fromRect.left;
		const translateY = toRect.top - fromRect.top;
		const uniformScale = toRect.width / fromRect.width;

		return {
			width: `${fromRect.width}px`,
			height: `${fromRect.height}px`,
			left: `${fromRect.left}px`,
			top: `${fromRect.top}px`,
			transformOrigin: "top left",
			transform: hasAnimationStarted
				? `translate(${translateX}px, ${translateY}px) scale(${uniformScale})`
				: "translate(0px, 0px) scale(1)",
			transition: `transform ${START_GAME_STAGE_DURATION_MS}ms ${START_GAME_STAGE_EASING}, opacity 180ms ease`,
		};
	}, [fromRect, hasAnimationStarted, toRect]);

	const isClientReady = useSyncExternalStore(
		() => () => {
			/* no-op: this store has no updates */
		},
		() => true,
		() => false,
	);

	if (!isClientReady) {
		return <GameDataLoadingScreen />;
	}

	return (
		<>
			<Header
				currentStreak={currentStreak}
				stage={headerStage}
				onDesktopWordmarkReady={setDesktopWordmarkRef}
				onMobileWordmarkReady={setMobileWordmarkRef}
			/>
			{shouldShowStartScreen ? (
				<Start onPlay={onPlay} onWordmarkReady={setStartWordmarkRef} />
			) : (
				<div
					className={cn(
						"transition-all will-change-transform",
						isGameEntering
							? "duration-[450ms] opacity-0 translate-y-10 sm:translate-y-14"
							: "duration-300 opacity-100 translate-y-0",
					)}
					style={{
						transitionTimingFunction: START_GAME_STAGE_EASING,
					}}
				>
					<ActiveLayout onPlay={onPlay} onStartWordmarkReady={setStartWordmarkRef} />
				</div>
			)}
			<Footer />

			{isTransitionRunning && fromRect && toRect && (
				<div className="fixed inset-0 pointer-events-none z-50" aria-hidden>
					<div className={cn("absolute", hasAnimationStarted && "opacity-95")} style={flipStyle}>
						<Wordmark size="hero" />
					</div>
				</div>
			)}
		</>
	);
}

export default function Home() {
	return (
		<GameProvider>
			<AppShell />
			<Toaster />
		</GameProvider>
	);
}
