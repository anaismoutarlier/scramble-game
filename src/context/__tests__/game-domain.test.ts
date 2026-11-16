import {
	calculateDraftScore,
	getPlacementValidation,
	isStreakContinuous,
	parseCellId,
	parseRackTileId,
} from "@/context/game-domain";
import { CELL_DROP_PREFIX, SLAM_BONUS_POINTS, TILE_DRAG_PREFIX } from "@/game-config/constants";
import { createBoardTemplate } from "@/context/__tests__/fixtures";

describe("game-domain", () => {
	describe("isStreakContinuous", () => {
		it("returns true when there is no last completed puzzle", () => {
			expect(isStreakContinuous(10, undefined)).toBe(true);
		});

		it("returns true for same puzzle or next puzzle", () => {
			expect(isStreakContinuous(10, 10)).toBe(true);
			expect(isStreakContinuous(11, 10)).toBe(true);
		});

		it("returns false when puzzle IDs are not consecutive", () => {
			expect(isStreakContinuous(12, 10)).toBe(false);
		});
	});

	describe("id parsing", () => {
		it("parses rack tile IDs with the configured prefix", () => {
			expect(parseRackTileId(`${TILE_DRAG_PREFIX}abc`)).toBe("abc");
		});

		it("parses cell IDs with the configured prefix", () => {
			expect(parseCellId(`${CELL_DROP_PREFIX}cell-1`)).toBe("cell-1");
		});

		it("returns null for invalid IDs", () => {
			expect(parseRackTileId("abc")).toBeNull();
			expect(parseRackTileId(12)).toBeNull();
			expect(parseCellId("cell-1")).toBeNull();
			expect(parseCellId({})).toBeNull();
		});
	});

	describe("getPlacementValidation", () => {
		const board = createBoardTemplate();

		it("rejects attempts with fewer than two tiles", () => {
			const result = getPlacementValidation([{ rackTileId: "t1", cellId: "r0c1", letter: "c" }], board);
			expect(result.isSubmittable).toBe(false);
			expect(result.axis).toBeNull();
		});

		it("rejects attempts that do not cover the center cell", () => {
			const result = getPlacementValidation(
				[
					{ rackTileId: "t1", cellId: "r0c0", letter: "c" },
					{ rackTileId: "t2", cellId: "r0c2", letter: "a" },
				],
				board,
			);
			expect(result.isSubmittable).toBe(false);
		});

		it("rejects attempts that are not in one row or one column", () => {
			const result = getPlacementValidation(
				[
					{ rackTileId: "t1", cellId: "r0c1", letter: "c" },
					{ rackTileId: "t2", cellId: "r1c1", letter: "a" },
					{ rackTileId: "t3", cellId: "r0c2", letter: "t" },
				],
				board,
			);
			expect(result.isSubmittable).toBe(false);
			expect(result.axis).toBeNull();
		});

		it("rejects non-contiguous placements", () => {
			const result = getPlacementValidation(
				[
					{ rackTileId: "t1", cellId: "r0c1", letter: "c" },
					{ rackTileId: "t2", cellId: "r2c1", letter: "t" },
				],
				board,
			);
			expect(result.isSubmittable).toBe(false);
			expect(result.axis).toBe("vertical");
		});

		it("accepts valid contiguous horizontal words and orders by coordinate", () => {
			const result = getPlacementValidation(
				[
					{ rackTileId: "t2", cellId: "r0c1", letter: "a" },
					{ rackTileId: "t1", cellId: "r0c0", letter: "c" },
					{ rackTileId: "t3", cellId: "r0c2", letter: "t" },
				],
				board,
			);
			expect(result.isSubmittable).toBe(true);
			expect(result.axis).toBe("horizontal");
			expect(result.candidateWord).toBe("cat");
			expect(result.orderedTiles.map(tile => tile.cellId)).toEqual(["r0c0", "r0c1", "r0c2"]);
		});
	});

	describe("calculateDraftScore", () => {
		const board = createBoardTemplate();

		it("applies letter and word multipliers", () => {
			const result = calculateDraftScore(
				[
					{ rackTileId: "t1", cellId: "r0c1", letter: "c" },
					{ rackTileId: "t2", cellId: "r0c2", letter: "a" },
					{ rackTileId: "t3", cellId: "r1c1", letter: "t" },
				],
				board,
			);

			expect(result.baseLetterScore).toBe(8);
			expect(result.wordMultiplierTotal).toBe(2);
			expect(result.total).toBe(16);
			expect(result.letterMultiplierHits).toHaveLength(2);
			expect(result.wordMultiplierHits).toHaveLength(1);
		});

		it("applies slam bonus when requested", () => {
			const result = calculateDraftScore([{ rackTileId: "t1", cellId: "r0c1", letter: "c" }], board, {
				applySlamBonus: true,
			});
			expect(result.slamBonusApplied).toBe(true);
			expect(result.slamBonusPoints).toBe(SLAM_BONUS_POINTS);
			expect(result.total).toBe(6 + SLAM_BONUS_POINTS);
		});
	});
});
