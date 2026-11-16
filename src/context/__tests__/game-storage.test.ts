import {
	createDefaultStoredProgress,
	createDefaultStreakStorage,
	normalizeStoredProgress,
	normalizeStreakStorage,
	persistStoredProgress,
	persistStreakStorage,
	readStoredProgressForPuzzle,
	readStreakStorageForPuzzle,
} from "@/context/game-storage";
import { PROGRESS_STORAGE_KEY, STREAK_STORAGE_KEY } from "@/game-config/constants";
import { createPuzzle } from "@/context/__tests__/fixtures";

describe("game-storage", () => {
	const puzzle = createPuzzle();

	beforeEach(() => {
		window.localStorage.clear();
	});

	it("creates default stored progress with seeded timestamps", () => {
		const result = createDefaultStoredProgress(42, "2026-11-16");
		expect(result.status).toBe("unstarted");
		expect(result.startedAt).toBe("2026-11-16T00:00:00.000Z");
		expect(result.updatedAt).toBe("2026-11-16T00:00:00.000Z");
	});

	it("normalizes streak storage and guards invalid values", () => {
		expect(normalizeStreakStorage({ currentStreak: 3, lastCompletedPuzzleId: 40 })).toEqual({
			currentStreak: 3,
			lastCompletedPuzzleId: 40,
		});
		expect(normalizeStreakStorage({ currentStreak: -1, lastCompletedPuzzleId: "nope" as never })).toEqual({
			currentStreak: 0,
			lastCompletedPuzzleId: undefined,
		});
	});

	it("derives in_progress status when attempts exist", () => {
		const fallback = createDefaultStoredProgress(puzzle.id, puzzle.date);
		const normalized = normalizeStoredProgress(
			{
				attemptsUsed: 1,
				attempts: [],
			},
			fallback,
		);
		expect(normalized.status).toBe("in_progress");
	});

	it("reads fallback progress when storage is empty", () => {
		const result = readStoredProgressForPuzzle(puzzle);
		expect(result).toEqual(createDefaultStoredProgress(puzzle.id, puzzle.date));
	});

	it("removes malformed progress JSON and falls back", () => {
		window.localStorage.setItem(PROGRESS_STORAGE_KEY, "{bad-json");
		const result = readStoredProgressForPuzzle(puzzle);
		expect(result).toEqual(createDefaultStoredProgress(puzzle.id, puzzle.date));
		expect(window.localStorage.getItem(PROGRESS_STORAGE_KEY)).toBeNull();
	});

	it("ignores saved progress from a different puzzle day", () => {
		window.localStorage.setItem(
			PROGRESS_STORAGE_KEY,
			JSON.stringify({
				puzzleId: 1,
				startedAt: "2026-11-15T00:00:00.000Z",
			}),
		);
		const result = readStoredProgressForPuzzle(puzzle);
		expect(result).toEqual(createDefaultStoredProgress(puzzle.id, puzzle.date));
	});

	it("restores and normalizes valid saved progress", () => {
		window.localStorage.setItem(
			PROGRESS_STORAGE_KEY,
			JSON.stringify({
				puzzleId: puzzle.id,
				status: "in_progress",
				attemptsUsed: 2,
				totalScore: 12,
				attempts: [],
				startedAt: `${puzzle.date}T09:00:00.000Z`,
				updatedAt: `${puzzle.date}T10:00:00.000Z`,
			}),
		);
		const result = readStoredProgressForPuzzle(puzzle);
		expect(result.attemptsUsed).toBe(2);
		expect(result.totalScore).toBe(12);
		expect(result.status).toBe("in_progress");
	});

	it("restores streak storage and resets non-continuous streaks", () => {
		window.localStorage.setItem(
			STREAK_STORAGE_KEY,
			JSON.stringify({ currentStreak: 5, lastCompletedPuzzleId: puzzle.id - 2 }),
		);
		const result = readStreakStorageForPuzzle(puzzle.id);
		expect(result.currentStreak).toBe(0);
		expect(result.lastCompletedPuzzleId).toBe(puzzle.id - 2);
	});

	it("falls back for malformed streak JSON", () => {
		window.localStorage.setItem(STREAK_STORAGE_KEY, "{bad-json");
		const result = readStreakStorageForPuzzle(puzzle.id);
		expect(result).toEqual(createDefaultStreakStorage());
		expect(window.localStorage.getItem(STREAK_STORAGE_KEY)).toBeNull();
	});

	it("persists progress and streak values", () => {
		const progress = createDefaultStoredProgress(puzzle.id, puzzle.date);
		persistStoredProgress(progress);
		persistStreakStorage({ currentStreak: 3, lastCompletedPuzzleId: puzzle.id });

		expect(window.localStorage.getItem(PROGRESS_STORAGE_KEY)).toBe(JSON.stringify(progress));
		expect(window.localStorage.getItem(STREAK_STORAGE_KEY)).toBe(
			JSON.stringify({ currentStreak: 3, lastCompletedPuzzleId: puzzle.id }),
		);
	});
});
