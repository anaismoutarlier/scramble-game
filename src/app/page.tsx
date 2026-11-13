"use client";
import { Header } from "@/components/header";
import { GameLayout } from "@/components/layouts/Game";
import { ResultsLayout } from "@/components/layouts/Results";
import { Footer } from "@/components/footer";
import { GameProvider, useGameContext } from "@/context/GameContext";
import { Toaster } from "@/components/ui/toast";
import { Loader2Icon } from "lucide-react";
import { useSyncExternalStore } from "react";

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

function ActiveLayout() {
	const { progress } = useGameContext();
	return progress.status === "completed" ? <ResultsLayout /> : <GameLayout />;
}

function AppShell() {
	const { currentStreak } = useGameContext();
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
			<Header currentStreak={currentStreak} />
			<ActiveLayout />
			<Footer />
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
