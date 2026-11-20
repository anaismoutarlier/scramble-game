import { act, renderHook } from "@testing-library/react";
import { MAX_ATTEMPTS } from "@/game-config/constants";
import { useGameProgressActions } from "@/context/useGameProgressActions";
import type { StreakStorage, StoredProgress } from "@/context/game-storage";
import type { OngoingAttemptTile, ScoreBreakdown } from "@/context/types";

const checkWordMock = vi.fn();
const toastAddMock = vi.fn();

vi.mock("@/actions/checkWord", () => ({
	checkWord: (...args: unknown[]) => checkWordMock(...args),
}));

vi.mock("@/components/ui/toast", () => ({
	toast: {
		add: (...args: unknown[]) => toastAddMock(...args),
	},
}));

vi.mock("uuid", () => ({
	v4: () => "attempt-id-123",
}));

const baseProgress: StoredProgress = {
	puzzleId: 42,
	status: "in_progress",
	attemptsUsed: 1,
	totalScore: 10,
	attempts: [
		{
			attemptNumber: 1,
			word: "dog",
			rackTileIdsUsed: ["t1", "t2", "t3"],
			placement: {
				direction: "horizontal",
				startCellId: "r0c0",
				placementCells: ["r0c0", "r0c1", "r0c2"],
				rackTileIdsInPlacementOrder: ["t1", "t2", "t3"],
			},
			score: {
				baseLetterScore: 3,
				letterMultiplierHits: [],
				wordMultiplierHits: [],
				wordMultiplierTotal: 1,
				slamBonusApplied: false,
				slamBonusPoints: 0,
				total: 3,
			},
		},
	],
	startedAt: "2026-11-16T00:00:00.000Z",
	updatedAt: "2026-11-16T00:00:00.000Z",
};

const baseScore: ScoreBreakdown = {
	baseLetterScore: 9,
	letterMultiplierHits: [],
	wordMultiplierHits: [],
	wordMultiplierTotal: 1,
	slamBonusApplied: false,
	slamBonusPoints: 0,
	total: 9,
};

const basePlacedTiles: OngoingAttemptTile[] = [
	{ rackTileId: "t1", cellId: "r0c0", letter: "c" },
	{ rackTileId: "t2", cellId: "r0c1", letter: "a" },
	{ rackTileId: "t3", cellId: "r0c2", letter: "t" },
];

const successfulValidation = {
	isSubmittable: true as const,
	axis: "horizontal" as const,
	candidateWord: "cat",
	orderedTiles: basePlacedTiles,
	score: baseScore,
};

const setup = (
	overrides?: Partial<{
		savedProgress: StoredProgress;
		placedTiles: OngoingAttemptTile[];
	}>,
) => {
	const setSavedProgress = vi.fn();
	const setStreakStorage = vi.fn();
	const resetInteractionState = vi.fn();

	const { result } = renderHook(() =>
		useGameProgressActions({
			savedProgress: overrides?.savedProgress ?? baseProgress,
			setSavedProgress,
			setStreakStorage,
			resetInteractionState,
			placedTiles: overrides?.placedTiles ?? basePlacedTiles,
		}),
	);

	return {
		result,
		setSavedProgress,
		setStreakStorage,
		resetInteractionState,
	};
};

describe("useGameProgressActions", () => {
	beforeEach(() => {
		checkWordMock.mockReset();
		toastAddMock.mockReset();
	});

	it("does not submit when game is not in progress", async () => {
		const { result, setSavedProgress } = setup({
			savedProgress: { ...baseProgress, status: "completed" },
		});

		await act(async () => {
			await result.current.onSubmitCurrentAttempt();
		});

		expect(checkWordMock).not.toHaveBeenCalled();
		expect(setSavedProgress).not.toHaveBeenCalled();
	});

	it("warns for duplicate words and skips progress update", async () => {
		checkWordMock.mockResolvedValueOnce(successfulValidation);
		const { result, setSavedProgress } = setup({
			savedProgress: {
				...baseProgress,
				attempts: [...baseProgress.attempts, { ...baseProgress.attempts[0], word: "cat" }],
			},
		});

		await act(async () => {
			await result.current.onSubmitCurrentAttempt();
		});

		expect(checkWordMock).toHaveBeenCalledTimes(1);
		expect(setSavedProgress).not.toHaveBeenCalled();
		expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({ type: "warning" }));
	});

	it("shows error toast when dictionary validation fails", async () => {
		checkWordMock.mockResolvedValueOnce({
			isSubmittable: false,
			reason: "invalid_word",
			axis: "horizontal",
			candidateWord: "cat",
			orderedTiles: basePlacedTiles,
		});
		const { result, setSavedProgress } = setup();

		await act(async () => {
			await result.current.onSubmitCurrentAttempt();
		});

		expect(checkWordMock).toHaveBeenCalledWith({ puzzleId: baseProgress.puzzleId, placedTiles: basePlacedTiles });
		expect(setSavedProgress).not.toHaveBeenCalled();
		expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({ type: "error" }));
	});

	it("shows error toast when rack tile validation fails", async () => {
		checkWordMock.mockResolvedValueOnce({
			isSubmittable: false,
			reason: "invalid_rack_tiles",
			axis: null,
			candidateWord: "",
			orderedTiles: [],
		});
		const { result, setSavedProgress } = setup();

		await act(async () => {
			await result.current.onSubmitCurrentAttempt();
		});

		expect(setSavedProgress).not.toHaveBeenCalled();
		expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({ title: "Invalid tile placement" }));
	});

	it("records a successful attempt and notifies success", async () => {
		checkWordMock.mockResolvedValueOnce(successfulValidation);
		const { result, setSavedProgress, resetInteractionState } = setup();

		await act(async () => {
			await result.current.onSubmitCurrentAttempt();
		});

		expect(setSavedProgress).toHaveBeenCalledTimes(1);
		const updater = setSavedProgress.mock.calls[0][0] as (prev: StoredProgress) => StoredProgress;
		const next = updater(baseProgress);
		expect(next.attemptsUsed).toBe(2);
		expect(next.totalScore).toBe(baseProgress.totalScore + baseScore.total);
		expect(next.attempts.at(-1)?.id).toBe("attempt-id-123");
		expect(next.attempts.at(-1)?.word).toBe("cat");
		expect(resetInteractionState).toHaveBeenCalledTimes(1);
		expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({ type: "success" }));
	});

	it("updates streak when the final attempt completes the puzzle", async () => {
		checkWordMock.mockResolvedValueOnce(successfulValidation);
		const savedProgress = {
			...baseProgress,
			attemptsUsed: MAX_ATTEMPTS - 1,
		};
		const { result, setStreakStorage } = setup({ savedProgress });

		await act(async () => {
			await result.current.onSubmitCurrentAttempt();
		});

		expect(setStreakStorage).toHaveBeenCalledTimes(1);
		const streakUpdater = setStreakStorage.mock.calls[0][0] as (prev: StreakStorage) => StreakStorage;
		const nextStreak = streakUpdater({ currentStreak: 2, lastCompletedPuzzleId: savedProgress.puzzleId - 1 });
		expect(nextStreak).toEqual({
			currentStreak: 3,
			lastCompletedPuzzleId: savedProgress.puzzleId,
		});
	});

	it("resets streak and marks completed when giving up after at least one attempt", () => {
		const { result, setSavedProgress, setStreakStorage, resetInteractionState } = setup();

		act(() => {
			result.current.onGiveUpPuzzle();
		});

		expect(setSavedProgress).toHaveBeenCalledTimes(1);
		const progressUpdater = setSavedProgress.mock.calls[0][0] as (prev: StoredProgress) => StoredProgress;
		const nextProgress = progressUpdater(baseProgress);
		expect(nextProgress.status).toBe("completed");
		expect(nextProgress.completedAt).toBeTruthy();

		expect(setStreakStorage).toHaveBeenCalledTimes(1);
		const streakUpdater = setStreakStorage.mock.calls[0][0] as (prev: StreakStorage) => StreakStorage;
		expect(streakUpdater({ currentStreak: 3, lastCompletedPuzzleId: 41 })).toEqual({
			currentStreak: 0,
			lastCompletedPuzzleId: 41,
		});
		expect(resetInteractionState).toHaveBeenCalled();
		expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({ type: "warning" }));
	});

	it("requires at least one attempt before giving up", () => {
		const { result, setSavedProgress } = setup({
			savedProgress: {
				...baseProgress,
				attemptsUsed: 0,
			},
		});

		act(() => {
			result.current.onGiveUpPuzzle();
		});

		expect(setSavedProgress).not.toHaveBeenCalled();
		expect(toastAddMock).toHaveBeenCalledWith(expect.objectContaining({ title: "Play at least one word first" }));
	});

	it("starts puzzle only from unstarted state", () => {
		const { result, setSavedProgress } = setup({
			savedProgress: { ...baseProgress, status: "unstarted" },
		});

		act(() => {
			result.current.onStartPuzzle();
		});

		expect(setSavedProgress).toHaveBeenCalledTimes(1);
		const updater = setSavedProgress.mock.calls[0][0] as (prev: StoredProgress) => StoredProgress;
		const next = updater({ ...baseProgress, status: "unstarted" });
		expect(next.status).toBe("in_progress");
		expect(next.updatedAt).toBeTruthy();
	});

	it("recalls rack tiles by resetting interaction state", () => {
		const { result, resetInteractionState } = setup();

		act(() => {
			result.current.recallRackTiles();
		});

		expect(resetInteractionState).toHaveBeenCalledTimes(1);
	});
});
