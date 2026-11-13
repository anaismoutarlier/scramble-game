"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Loader2Icon } from "lucide-react";
import { Header } from "@/components/header";
import { GameLayout } from "@/components/layouts/Game";
import { ResultsLayout } from "@/components/layouts/Results";
import { Start } from "@/components/layouts/Start";
import { Footer } from "@/components/footer";
import { GameProvider, useGameContext } from "@/context/GameContext";
import { Toaster } from "@/components/ui/toast";
import { Wordmark } from "@/components/wordmark";
import { cn } from "@/lib/cn";

const START_GAME_STAGE_DURATION_MS = 800;
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
	isTransitionRunning,
	onStartWordmarkReady,
}: {
	onPlay: () => void;
	isTransitionRunning: boolean;
	onStartWordmarkReady: (element: HTMLDivElement | null) => void;
}) {
	const { progress } = useGameContext();

	if (progress.status === "unstarted") {
		return <Start onPlay={onPlay} isTransitionRunning={isTransitionRunning} onWordmarkReady={onStartWordmarkReady} />;
	}

	return progress.status === "completed" ? <ResultsLayout /> : <GameLayout />;
}

function AppShell() {
	const { currentStreak, progress, onStartPuzzle } = useGameContext();
	const [isTransitionRunning, setIsTransitionRunning] = useState(false);
	const [hasAnimationStarted, setHasAnimationStarted] = useState(false);
	const [fromRect, setFromRect] = useState<RectSnapshot | null>(null);
	const [toRect, setToRect] = useState<RectSnapshot | null>(null);

	const startWordmarkRef = useRef<HTMLDivElement | null>(null);
	const desktopWordmarkRef = useRef<HTMLDivElement | null>(null);
	const mobileWordmarkRef = useRef<HTMLDivElement | null>(null);
	const transitionTimerRef = useRef<number | null>(null);
	const transitionAnimationFrameRef = useRef<number | null>(null);

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
		onStartPuzzle();
	}, [onStartPuzzle]);

	const onPlay = useCallback(() => {
		const sourceRect = getRectSnapshot(startWordmarkRef.current);
		const targetRect = getHeaderWordmarkTargetRect();

		if (!sourceRect || !targetRect) {
			onStartPuzzle();
			return;
		}

		setFromRect(sourceRect);
		setToRect(targetRect);
		setIsTransitionRunning(true);
		setHasAnimationStarted(false);

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
	}, [completeStartTransition, getHeaderWordmarkTargetRect, getRectSnapshot, onStartPuzzle]);

	useEffect(() => {
		return () => {
			if (transitionAnimationFrameRef.current !== null) {
				window.cancelAnimationFrame(transitionAnimationFrameRef.current);
			}
			if (transitionTimerRef.current !== null) {
				window.clearTimeout(transitionTimerRef.current);
			}
		};
	}, []);

	const isShowingStartScreen = progress.status === "unstarted" || isTransitionRunning;
	const headerStage: "start" | "start-game" | "game" = isShowingStartScreen
		? isTransitionRunning
			? "start-game"
			: "start"
		: "game";

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
			{isShowingStartScreen ? (
				<Start onPlay={onPlay} isTransitionRunning={isTransitionRunning} onWordmarkReady={setStartWordmarkRef} />
			) : (
				<ActiveLayout
					onPlay={onPlay}
					isTransitionRunning={isTransitionRunning}
					onStartWordmarkReady={setStartWordmarkRef}
				/>
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
