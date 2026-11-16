import { renderHook, waitFor } from "@testing-library/react";
import { usePuzzleOfTheDay } from "@/context/usePuzzleOfTheDay";
import { createPuzzle } from "@/context/__tests__/fixtures";

const getPuzzleByDateMock = vi.fn();

vi.mock("@/actions/getPuzzle", () => ({
	getPuzzleByDate: (args: unknown) => getPuzzleByDateMock(args),
}));

describe("usePuzzleOfTheDay", () => {
	beforeEach(() => {
		getPuzzleByDateMock.mockReset();
	});

	it("loads puzzle of the day successfully", async () => {
		const puzzle = createPuzzle();
		getPuzzleByDateMock.mockResolvedValueOnce(puzzle);

		const { result } = renderHook(() => usePuzzleOfTheDay());

		await waitFor(() => {
			expect(result.current.puzzle).toEqual(puzzle);
		});
		expect(result.current.loadErrorMessage).toBeNull();
		expect(getPuzzleByDateMock).toHaveBeenCalledWith({
			date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
		});
	});

	it("exposes an error message when puzzle is unavailable", async () => {
		getPuzzleByDateMock.mockResolvedValueOnce(null);
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const { result } = renderHook(() => usePuzzleOfTheDay());

		await waitFor(() => {
			expect(result.current.loadErrorMessage).toBe("No puzzle is available for today. Please check back later.");
		});
		expect(result.current.puzzle).toBeNull();
		expect(consoleSpy).toHaveBeenCalled();

		consoleSpy.mockRestore();
	});

	it("exposes an error message when fetching throws", async () => {
		getPuzzleByDateMock.mockRejectedValueOnce(new Error("network issue"));
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const { result } = renderHook(() => usePuzzleOfTheDay());

		await waitFor(() => {
			expect(result.current.loadErrorMessage).toBe("No puzzle is available for today. Please check back later.");
		});
		expect(result.current.puzzle).toBeNull();

		consoleSpy.mockRestore();
	});
});
