import { useState, useCallback, useEffect, useMemo } from "react";
import { useGameContext } from "@/context/GameContext";
import { Review } from "./ReviewView";
import { ResultsMainContent } from "./ResultsView";
import { getResults } from "@/actions/getResults";

export function ResultsLayout() {
	const { puzzle, progress } = useGameContext();
	const [view, setView] = useState<"results" | "review">("results");
	const [puzzleStats, setPuzzleStats] = useState<Awaited<ReturnType<typeof getResults>> | null>(null);

	const bestPossibleWords = puzzleStats?.topScoringWords;
	const bestPossibleScore = puzzleStats?.totalScore || 0;

	const statCards = useMemo(() => {
		const arr = [];
		if (puzzleStats?.nbDictWords) arr.push({ title: puzzleStats.nbDictWords.toString(), text: "Possible words to play today" });
		if (puzzleStats?.allSlams) {
			const userFoundSlams = new Set(progress.attempts.filter(el => el.word.length === puzzle.rack.length).map(el => el.word));
			const nbSlamsFound = puzzleStats.allSlams.reduce((a, c) => (userFoundSlams.has(c) ? a + 1 : a), 0);
			arr.push({
				title: `${nbSlamsFound} / ${puzzleStats.allSlams.length}`,
				text: "SLAMS found today",
				score: { possible: puzzleStats.allSlams.length, total: nbSlamsFound },
			});
		}
		if (puzzleStats?.topScoringWords) {
			const bestWords = puzzleStats.topScoringWords.slice(0, 5);
			const bestWordsFound = bestWords.reduce((a, c) => (progress.attempts.some(a => a.word === c.word) ? a + 1 : a), 0);
			arr.push({
				title: `${bestWordsFound} / ${bestWords.length}`,
				text: "Best-scoring words found today",
				score: {
					possible: bestWords.length,
					total: bestWordsFound,
				},
			});
		}
		const bestUserWord = progress.attempts.sort((a, b) => b.score.total - a.score.total).at(0);
		if (bestUserWord) {
			arr.push({ title: bestUserWord.word.toLocaleUpperCase(), text: "Your best-scoring word" });
		}
		return arr;
	}, [puzzleStats, puzzle.rack, progress.attempts]);

	useEffect(() => {
		if (progress.status !== "completed" || !puzzle.id) return;
		(async () => {
			const puzzleResults = await getResults(puzzle.id);
			setPuzzleStats(puzzleResults ?? null);
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
		<Review toggleView={toggleView} bestPossibleWords={bestPossibleWords ?? []} statCards={statCards} />
	);
}
