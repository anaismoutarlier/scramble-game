import { alphabet } from "@/data/alphabet";
import { cn } from "@/lib/cn";

export default function LetterTile({ letter, isInUse }: { letter: string[1]; isInUse: boolean }) {
	const letterValue = alphabet[letter];
	return (
		<div
			className={cn(
				"size-12 bg-tile-letter-surface rounded-lg border-b-[3px] border-neutral-900/60 inline-flex flex-col justify-center items-center font-sans text-dark",
				isInUse ? "opacity-50" : "opacity-100",
			)}
		>
			<div className="text-xl font-bold">{letter}</div>
			<div className="text-[9px]">{letterValue}</div>
		</div>
	);
}
