import { useState, useCallback } from "react";
import { useGameContext } from "@/context/GameContext";
import { Review } from "./ReviewView";
import { ResultsMainContent } from "./ResultsView";

export function ResultsLayout() {
	const { puzzle, progress } = useGameContext();
	const [view, setView] = useState<"results" | "review">("results");

	const toggleView = useCallback((v: "results" | "review") => {
		setView(v);
	}, []);

	return view === "results" ? (
		<ResultsMainContent puzzle={puzzle} progress={progress} toggleView={toggleView} />
	) : (
		<Review toggleView={toggleView} />
	);
}
