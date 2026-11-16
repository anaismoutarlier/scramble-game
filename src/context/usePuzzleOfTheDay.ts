"use client";

import { useEffect, useState } from "react";
import { getPuzzleByDate } from "@/actions/getPuzzle";
import type { PuzzleDefinition } from "@/context/types";

const formatLocalDateForPuzzle = (date: Date): string => {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
};

export const usePuzzleOfTheDay = () => {
	const [puzzle, setPuzzle] = useState<PuzzleDefinition | null>(null);
	const [loadErrorMessage, setLoadErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		let isCancelled = false;

		const syncPuzzleOfTheDay = async () => {
			const localDate = formatLocalDateForPuzzle(new Date());
			const puzzleForToday = await getPuzzleByDate({ date: localDate });
			if (!puzzleForToday) {
				throw new Error(`Puzzle not found for ${localDate}`);
			}

			if (!isCancelled) {
				setPuzzle(puzzleForToday);
				setLoadErrorMessage(null);
			}
		};

		void syncPuzzleOfTheDay().catch(error => {
			console.error("Failed to fetch puzzle of the day", error);
			if (!isCancelled) {
				setLoadErrorMessage("No puzzle is available for today. Please check back later.");
			}
		});

		return () => {
			isCancelled = true;
		};
	}, []);

	return {
		puzzle,
		loadErrorMessage,
	};
};
