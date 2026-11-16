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
		segments: [{ text: "Every word must pass through the center tile ⭐ and extend horizontally or vertically." }],
	},
	{
		order: 3,
		segments: [
			{
				text: "Use your 7 tiles to create 5 words and earn points. Each word must be at least 2 letters long and each tile can only be used once per word.",
			},
		],
	},
	{
		order: 4,
		segments: [{ text: "Careful, each unique word may only be played once, even if there are multiple ways to play it on the board." }],
	},
	{
		order: 5,
		segments: [
			{
				text: "Use all 7 tiles in a single word to earn a ",
			},
			{
				text: "SLAM",
				emphasis: true,
			},
			{
				text: " and an extra 45 points!",
			},
		],
	},
	{
		order: 6,
		segments: [
			{ text: "You have " },
			{ text: "5 chances", emphasis: true },
			{
				text: " to create a word. Each word is added to your cumulative score. You can give up after your first submission, but any remaining attempts are forfeited and your current streak resets to 0.",
			},
		],
	},
	{
		order: 7,
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
