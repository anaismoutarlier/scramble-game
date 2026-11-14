import { useState, useCallback, useEffect } from "react";
import { useGameContext } from "@/context/GameContext";
import { Review } from "./ReviewView";
import { ResultsMainContent } from "./ResultsView";
import type { TopScoringWord } from "@/context/types";
import { getResults } from "@/actions/getResults";

export function ResultsLayout() {
	const { puzzle, progress } = useGameContext();
	const [view, setView] = useState<"results" | "review">("results");
	const [bestScores, setBestScores] = useState<{ topScoringWords?: TopScoringWord[]; totalScore: number } | null>(null);

	const bestPossibleWords = bestScores?.topScoringWords;
	const bestPossibleScore = bestScores?.totalScore || 0;

	useEffect(() => {
		if (progress.status !== "completed" || !puzzle.id) return;
		(async () => {
			const puzzleResults = await getResults(puzzle.id);
			setBestScores(puzzleResults ?? null);
		})();
	}, [puzzle.id, progress.status]);

	const toggleView = useCallback((v: "results" | "review") => {
		setView(v);
	}, []);

	return view === "results" ? (
		<ResultsMainContent
			puzzle={puzzle}
			progress={progress}
			toggleView={toggleView}
			bestPossibleScore={bestPossibleScore}
			bestPossibleWords={bestPossibleWords}
		/>
	) : (
		<Review toggleView={toggleView} bestPossibleWords={bestPossibleWords ?? []} />
	);
}
