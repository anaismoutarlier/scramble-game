import { act, renderHook } from "@testing-library/react";
import { useRackBoardInteractions } from "@/context/useRackBoardInteractions";
import { createBoardTemplate, createRackTiles } from "@/context/__tests__/fixtures";
import { CELL_DROP_PREFIX, TILE_DRAG_PREFIX, TRAY_DROP_ID } from "@/game-config/constants";

describe("useRackBoardInteractions", () => {
	const board = createBoardTemplate();
	const rackTiles = createRackTiles();

	it("starts with empty interaction state", () => {
		const { result } = renderHook(() => useRackBoardInteractions({ board, rackTiles }));
		expect(result.current.placedTiles).toEqual([]);
		expect(result.current.selectedRackTileId).toBeNull();
		expect(result.current.activeDragLetter).toBeNull();
	});

	it("selects and toggles a rack tile on click", () => {
		const { result } = renderHook(() => useRackBoardInteractions({ board, rackTiles }));

		act(() => result.current.onRackTileClick("t1"));
		expect(result.current.selectedRackTileId).toBe("t1");

		act(() => result.current.onRackTileClick("t1"));
		expect(result.current.selectedRackTileId).toBeNull();
	});

	it("places a selected tile when clicking a board cell", () => {
		const { result } = renderHook(() => useRackBoardInteractions({ board, rackTiles }));

		act(() => result.current.onRackTileClick("t1"));
		act(() => result.current.onBoardCellClick("r0c1"));

		expect(result.current.selectedRackTileId).toBeNull();
		expect(result.current.placedTiles).toEqual([{ rackTileId: "t1", cellId: "r0c1", letter: "c" }]);
	});

	it("removes an occupying tile when clicking an occupied cell without selection", () => {
		const { result } = renderHook(() => useRackBoardInteractions({ board, rackTiles }));

		act(() => {
			result.current.setPlacedTiles([{ rackTileId: "t1", cellId: "r0c1", letter: "c" }]);
		});

		act(() => result.current.onBoardCellClick("r0c1"));
		expect(result.current.placedTiles).toEqual([]);
	});

	it("updates active drag letter and suppresses click selection during drag", () => {
		const { result } = renderHook(() => useRackBoardInteractions({ board, rackTiles }));

		act(() => {
			result.current.onDragStart({
				operation: {
					source: { id: `${TILE_DRAG_PREFIX}t1` },
				},
			} as never);
		});

		expect(result.current.activeDragLetter).toBe("c");

		act(() => result.current.onRackTileClick("t2"));
		expect(result.current.selectedRackTileId).toBeNull();
	});

	it("places a tile when drag ends on a board cell", () => {
		const { result } = renderHook(() => useRackBoardInteractions({ board, rackTiles }));

		act(() => {
			result.current.onDragEnd({
				canceled: false,
				operation: {
					source: { id: `${TILE_DRAG_PREFIX}t2`, data: { source: "tray" } },
					target: { id: `${CELL_DROP_PREFIX}r0c1` },
				},
			} as never);
		});

		expect(result.current.placedTiles).toEqual([{ rackTileId: "t2", cellId: "r0c1", letter: "a" }]);
		expect(result.current.activeDragLetter).toBeNull();
	});

	it("removes a tile when drag ends on tray drop zone", () => {
		const { result } = renderHook(() => useRackBoardInteractions({ board, rackTiles }));

		act(() => {
			result.current.setPlacedTiles([{ rackTileId: "t1", cellId: "r0c1", letter: "c" }]);
		});

		act(() => {
			result.current.onDragEnd({
				canceled: false,
				operation: {
					source: { id: `${TILE_DRAG_PREFIX}t1`, data: { source: "board" } },
					target: { id: TRAY_DROP_ID },
				},
			} as never);
		});

		expect(result.current.placedTiles).toEqual([]);
	});

	it("removes a board tile when dropped outside any target", () => {
		const { result } = renderHook(() => useRackBoardInteractions({ board, rackTiles }));

		act(() => {
			result.current.setPlacedTiles([{ rackTileId: "t1", cellId: "r0c1", letter: "c" }]);
		});

		act(() => {
			result.current.onDragEnd({
				canceled: false,
				operation: {
					source: { id: `${TILE_DRAG_PREFIX}t1`, data: { source: "board" } },
					target: undefined,
				},
			} as never);
		});

		expect(result.current.placedTiles).toEqual([]);
	});

	it("resets transient state when drag is canceled", () => {
		const { result } = renderHook(() => useRackBoardInteractions({ board, rackTiles }));

		act(() => {
			result.current.onDragStart({ operation: { source: { id: `${TILE_DRAG_PREFIX}t1` } } } as never);
		});

		act(() => {
			result.current.onDragEnd({ canceled: true, operation: { source: { id: `${TILE_DRAG_PREFIX}t1` } } } as never);
		});

		expect(result.current.activeDragLetter).toBeNull();
	});

	it("resets all interaction state", () => {
		const { result } = renderHook(() => useRackBoardInteractions({ board, rackTiles }));

		act(() => {
			result.current.setPlacedTiles([{ rackTileId: "t1", cellId: "r0c1", letter: "c" }]);
			result.current.setSelectedRackTileId("t2");
			result.current.setActiveDragLetter("x");
		});

		act(() => result.current.resetInteractionState());

		expect(result.current.placedTiles).toEqual([]);
		expect(result.current.selectedRackTileId).toBeNull();
		expect(result.current.activeDragLetter).toBeNull();
	});
});
