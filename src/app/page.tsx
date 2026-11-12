"use client";
import { Header } from "@/components/header";
import { GameLayout } from "@/components/layouts/Game";
import { Footer } from "@/components/footer";
import { GameProvider } from "@/context/GameContext";

export default function Home() {
	return (
		<GameProvider>
			<Header />
			<GameLayout />
			<Footer />
		</GameProvider>
	);
}
