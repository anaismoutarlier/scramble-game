"use client";

import {
	PROGRESS_STORAGE_KEY,
	STREAK_STORAGE_KEY,
} from "@/game-config/constants";
import type { GameProgress, PuzzleDefinition } from "@/context/types";
import { isStreakContinuous } from "@/context/game-domain";

export type StoredProgress = Omit<GameProgress, "currentAttempt">;

export type StreakStorage = {
	currentStreak: number;
	lastCompletedPuzzleId?: number;
};

export const createDefaultStoredProgress = (puzzleId: number, puzzleDate: string): StoredProgress => {
	const seededTimestamp = `${puzzleDate}T00:00:00.000Z`;
	return {
		puzzleId,
		status: "unstarted",
		attemptsUsed: 0,
		totalScore: 0,
		attempts: [],
		startedAt: seededTimestamp,
		updatedAt: seededTimestamp,
	};
};

export const createDefaultStreakStorage = (): StreakStorage => ({
	currentStreak: 0,
	lastCompletedPuzzleId: undefined,
});

export const normalizeStreakStorage = (parsed: Partial<StreakStorage>): StreakStorage => ({
	currentStreak: typeof parsed.currentStreak === "number" && parsed.currentStreak >= 0 ? parsed.currentStreak : 0,
	lastCompletedPuzzleId: typeof parsed.lastCompletedPuzzleId === "number" ? parsed.lastCompletedPuzzleId : undefined,
});

export const isProgressForCurrentPuzzleDay = (parsed: Partial<StoredProgress>, puzzle: PuzzleDefinition): boolean => {
	if (parsed.puzzleId !== puzzle.id) return false;
	if (typeof parsed.startedAt !== "string") return false;
	return parsed.startedAt.startsWith(`${puzzle.date}T`);
};

export const normalizeStoredProgress = (parsed: Partial<StoredProgress>, fallback: StoredProgress): StoredProgress => ({
	...fallback,
	...parsed,
	attempts: Array.isArray(parsed.attempts) ? parsed.attempts : fallback.attempts,
	attemptsUsed: typeof parsed.attemptsUsed === "number" ? parsed.attemptsUsed : fallback.attemptsUsed,
	totalScore: typeof parsed.totalScore === "number" ? parsed.totalScore : fallback.totalScore,
	status:
		parsed.status === "completed"
			? "completed"
			: parsed.status === "unstarted"
				? "unstarted"
				: (typeof parsed.attemptsUsed === "number" && parsed.attemptsUsed > 0) ||
					  (Array.isArray(parsed.attempts) && parsed.attempts.length > 0)
					? "in_progress"
					: "unstarted",
	startedAt: typeof parsed.startedAt === "string" ? parsed.startedAt : fallback.startedAt,
	updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : fallback.updatedAt,
	completedAt: typeof parsed.completedAt === "string" ? parsed.completedAt : undefined,
});

export const readStoredProgressForPuzzle = (puzzle: PuzzleDefinition): StoredProgress => {
	const fallback = createDefaultStoredProgress(puzzle.id, puzzle.date);
	if (typeof window === "undefined") return fallback;

	const rawProgress = window.localStorage.getItem(PROGRESS_STORAGE_KEY);
	if (!rawProgress) return fallback;

	try {
		const parsedProgress = JSON.parse(rawProgress) as Partial<StoredProgress>;
		return isProgressForCurrentPuzzleDay(parsedProgress, puzzle) ? normalizeStoredProgress(parsedProgress, fallback) : fallback;
	} catch {
		window.localStorage.removeItem(PROGRESS_STORAGE_KEY);
		return fallback;
	}
};

export const readStreakStorageForPuzzle = (puzzleId: number): StreakStorage => {
	const fallback = createDefaultStreakStorage();
	if (typeof window === "undefined") return fallback;

	const rawStreak = window.localStorage.getItem(STREAK_STORAGE_KEY);
	if (!rawStreak) return fallback;

	let parsedStreak = fallback;
	try {
		parsedStreak = normalizeStreakStorage(JSON.parse(rawStreak) as Partial<StreakStorage>);
	} catch {
		window.localStorage.removeItem(STREAK_STORAGE_KEY);
		return fallback;
	}

	if (!isStreakContinuous(puzzleId, parsedStreak.lastCompletedPuzzleId)) {
		return { ...parsedStreak, currentStreak: 0 };
	}

	return parsedStreak;
};

export const persistStoredProgress = (storedProgress: StoredProgress): void => {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(storedProgress));
};

export const persistStreakStorage = (streakStorage: StreakStorage): void => {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(streakStorage));
};
