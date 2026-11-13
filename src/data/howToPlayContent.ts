import type { BonusTile } from "@/context/types";

type RuleSegment = {
	text: string;
	emphasis?: boolean;
};

export type HowToPlayRule = {
	order: number;
	segments: RuleSegment[];
};

export type BonusTileDescription = {
	bonus: BonusTile;
	title: string;
	description: string;
};

export const HOW_TO_PLAY_TITLE = "How to Play";
export const BONUS_TILES_TITLE = "Bonus Tiles";

export const HOW_TO_PLAY_RULES: HowToPlayRule[] = [
	{
		order: 1,
		segments: [
			{
				text: "A fresh board and set of 7 tiles awaits you every day. The board will feature a number of random bonus tiles to boost your score.",
			},
		],
	},
	{
		order: 2,
		segments: [{ text: "Every word must pass through the center tile and extend horizontally or vertically." }],
	},
	{
		order: 3,
		segments: [
			{
				text: "Use your 7 tiles to spell a word and earn points. Each tile can only be used once per word. Careful, each word may only be played once, even if there are multiple valid placements for it on the board.",
			},
		],
	},
	{
		order: 4,
		segments: [
			{
				text: "Use all 7 tiles in a single word to earn a SLAM and an extra 45 points!",
			},
		],
	},
	{
		order: 5,
		segments: [
			{ text: "You have " },
			{ text: "5 attempts", emphasis: true },
			{ text: ". Each attempt adds to your cumulative score. See how high you can get with all five words!" },
		],
	},
	{
		order: 6,
		segments: [
			{ text: "Your total score is compared to the " },
			{ text: "best possible score", emphasis: true },
			{ text: " — the cumulative score of the top 5 highest-scoring words achievable with today's tiles and board." },
		],
	},
];

export const BONUS_TILE_DESCRIPTIONS: BonusTileDescription[] = [
	{
		bonus: "dl",
		title: "Double Letter",
		description: "Tile’s value ×2",
	},
	{
		bonus: "tl",
		title: "Triple Letter",
		description: "Tile’s value ×3",
	},
	{
		bonus: "dw",
		title: "Double Word",
		description: "Entire word score ×2",
	},
	{
		bonus: "tw",
		title: "Triple Word",
		description: "Entire word score ×3",
	},
];
