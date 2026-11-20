"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { v4 as randomUUID } from "uuid";
import { checkWord } from "@/actions/checkWord";
import { toast } from "@/components/ui/toast";
import { isStreakContinuous } from "@/context/game-domain";
import type { OngoingAttemptTile } from "@/context/types";
import { MAX_ATTEMPTS } from "@/game-config/constants";
import type { StreakStorage, StoredProgress } from "@/context/game-storage";
import { hintMessages } from "@/data/hintMessages";
type UseGameProgressActionsArgs = {
	savedProgress: StoredProgress;
	setSavedProgress: Dispatch<SetStateAction<StoredProgress>>;
	setStreakStorage: Dispatch<SetStateAction<StreakStorage>>;
	resetInteractionState: () => void;
	placedTiles: OngoingAttemptTile[];
};

export const useGameProgressActions = ({
	savedProgress,
	setSavedProgress,
	setStreakStorage,
	resetInteractionState,
	placedTiles,
}: UseGameProgressActionsArgs) => {
	const onSubmitCurrentAttempt = useCallback(async () => {
		if (savedProgress.status !== "in_progress") return;
		if (savedProgress.attemptsUsed >= MAX_ATTEMPTS) return;

		const attemptsLeft = Math.max(0, MAX_ATTEMPTS - savedProgress.attemptsUsed);

		const placementValidation = await checkWord({ puzzleId: savedProgress.puzzleId, placedTiles });
		if (!placementValidation.isSubmittable) {
			if (placementValidation.reason === "invalid_word")
				toast.add({
					type: "error",
					title: "That one doesn't count",
					description: `According to my records, that isn't a word. But you still have ${attemptsLeft} attempts left! Try again.`,
				});
			else if (placementValidation.reason === "server_error") {
				toast.add({
					type: "error",
					title: "Something went wrong",
					description: `We weren't able to complete that action. Try again later.`,
				});
			} else if (placementValidation.reason === "invalid_rack_tiles") {
				toast.add({
					type: "error",
					title: "Invalid tile placement",
					description: "Some tiles in your placement are not valid for this rack. Please reset and try again.",
				});
			} else {
				const hintMessage = hintMessages[placementValidation.reason];
				toast.add({ description: hintMessage, type: "warning" });
			}
			return;
		}
		const candidateWord = placementValidation.candidateWord;
		const prettyWord = candidateWord.toUpperCase();
		const wasAlreadyPlayed = savedProgress.attempts.some(attempt => attempt.word === candidateWord);
		if (wasAlreadyPlayed) {
			toast.add({
				type: "warning",
				title: "Word already played",
				description: `You've already played ${prettyWord}. Try a new word.`,
			});
			return;
		}

		const attemptNumber = savedProgress.attemptsUsed + 1;
		const currentAttemptScore = placementValidation.score;
		const placementCells = placementValidation.orderedTiles.map(tile => tile.cellId);
		const placementAxis = placementValidation.axis;
		const rackTileIdsInPlacementOrder = placementValidation.orderedTiles.map(tile => tile.rackTileId);
		const now = new Date().toISOString();

		setSavedProgress(prev => {
			const nextAttemptsUsed = prev.attemptsUsed + 1;
			const totalScore = prev.totalScore + currentAttemptScore.total;

			return {
				...prev,
				attemptsUsed: nextAttemptsUsed,
				totalScore,
				status: nextAttemptsUsed >= MAX_ATTEMPTS ? "completed" : "in_progress",
				updatedAt: now,
				completedAt: nextAttemptsUsed >= MAX_ATTEMPTS ? now : prev.completedAt,
				attempts: [
					...prev.attempts,
					{
						id: randomUUID(),
						attemptNumber,
						submittedAt: now,
						word: candidateWord,
						rackTileIdsUsed: rackTileIdsInPlacementOrder,
						placement: {
							direction: placementAxis,
							startCellId: placementCells[0],
							placementCells,
							rackTileIdsInPlacementOrder,
						},
						score: currentAttemptScore,
					},
				],
			};
		});
		const willCompletePuzzle = savedProgress.attemptsUsed + 1 >= MAX_ATTEMPTS;
		if (willCompletePuzzle) {
			setStreakStorage(prev => {
				if (prev.lastCompletedPuzzleId === savedProgress.puzzleId) {
					return prev;
				}

				const nextStreakCount = isStreakContinuous(savedProgress.puzzleId, prev.lastCompletedPuzzleId) ? prev.currentStreak + 1 : 1;
				return {
					currentStreak: nextStreakCount,
					lastCompletedPuzzleId: savedProgress.puzzleId,
				};
			});
		}

		resetInteractionState();
		const attemptsLeftAfterSubmit = Math.max(0, MAX_ATTEMPTS - (savedProgress.attemptsUsed + 1));
		toast.add({
			type: "success",
			title: "Word accepted",
			description:
				attemptsLeftAfterSubmit > 0
					? `Great job! You got ${currentAttemptScore.total} points, and you still have ${attemptsLeftAfterSubmit} ${attemptsLeftAfterSubmit === 1 ? "attempt" : "attempts"} left!`
					: `Great job! You got ${currentAttemptScore.total} points. That was your final attempt.`,
		});
	}, [
		resetInteractionState,
		savedProgress.attempts,
		savedProgress.attemptsUsed,
		savedProgress.puzzleId,
		savedProgress.status,
		setSavedProgress,
		setStreakStorage,
		placedTiles,
	]);

	const onGiveUpPuzzle = useCallback(() => {
		if (savedProgress.status !== "in_progress") return;
		if (savedProgress.attemptsUsed < 1) {
			toast.add({
				type: "warning",
				title: "Play at least one word first",
				description: "Submit at least one word before giving up.",
			});
			return;
		}

		const now = new Date().toISOString();
		const attemptsForfeited = Math.max(0, MAX_ATTEMPTS - savedProgress.attemptsUsed);

		setSavedProgress(prev => {
			if (prev.status !== "in_progress") return prev;
			if (prev.attemptsUsed < 1) return prev;

			return {
				...prev,
				status: "completed",
				updatedAt: now,
				completedAt: now,
			};
		});
		setStreakStorage(prev => ({
			...prev,
			currentStreak: 0,
		}));

		resetInteractionState();

		toast.add({
			type: "warning",
			title: "You gave up",
			description: `You forfeited ${attemptsForfeited} remaining ${
				attemptsForfeited === 1 ? "attempt" : "attempts"
			}. Your current streak is now 0.`,
		});
	}, [resetInteractionState, savedProgress.attemptsUsed, savedProgress.status, setSavedProgress, setStreakStorage]);

	const onStartPuzzle = useCallback(() => {
		setSavedProgress(prev => {
			if (prev.status !== "unstarted") {
				return prev;
			}

			return {
				...prev,
				status: "in_progress",
				updatedAt: new Date().toISOString(),
			};
		});
	}, [setSavedProgress]);

	const recallRackTiles = useCallback(() => {
		resetInteractionState();
	}, [resetInteractionState]);

	return {
		onSubmitCurrentAttempt,
		onGiveUpPuzzle,
		onStartPuzzle,
		recallRackTiles,
	};
};
