"use client";
import { Header } from "@/components/header";
import { useGameState } from "@/hooks/useGameState";
import { GameLayout } from "@/components/layouts/Game";
import { Footer } from "@/components/footer";

export default function Home() {
	const { puzzle, progress } = useGameState();

	return (
		<>
			<Header />
			<GameLayout puzzle={puzzle} progress={progress} />
			<Footer />
		</>
	);
}
