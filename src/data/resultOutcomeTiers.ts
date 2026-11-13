export type ResultOutcomeTier = {
	minPercent: number;
	maxPercent: number;
	label: string;
};

export const resultOutcomeTiers: ResultOutcomeTier[] = [
	{ minPercent: 100, maxPercent: 100, label: "Grand Slammer! 💯" },
	{ minPercent: 90, maxPercent: 99, label: "Word Wizard 🧙" },
	{ minPercent: 70, maxPercent: 89, label: "Letter Lover ✨" },
	{ minPercent: 50, maxPercent: 69, label: "Tile Tinkerer 🔡" },
	{ minPercent: 0, maxPercent: 49, label: "Keep Scrambling 🍳" },
];

export function getResultOutcomeLabel(percent: number): string {
	const normalizedPercent = Math.max(0, Math.min(100, Math.round(percent)));
	const tier = resultOutcomeTiers.find(item => normalizedPercent >= item.minPercent && normalizedPercent <= item.maxPercent);
	return tier?.label ?? resultOutcomeTiers[resultOutcomeTiers.length - 1].label;
}
