import { alphabet } from "@/data/alphabet";
import { RackTile } from "@/hooks/types";
import { cn } from "@/lib/cn";

export function LetterTile({ letter, isInUse }: { letter: RackTile; isInUse: boolean }) {
	const letterValue = alphabet[letter.letter];
	return (
		<div
			className={cn(
				"size-10 md:size-12 bg-tile-letter-surface rounded-md sm:rounded-lg border-b-[1.5px] sm:border-b-[3px] border-neutral-900/60 inline-flex flex-col justify-center items-center font-sans text-dark",
				isInUse ? "opacity-50" : "opacity-100",
			)}
		>
			<div className="text-xs sm:text-base md:text-xl font-bold leading-tight uppercase">{letter.letter}</div>
			<div className="text-[7px] sm:text-[9px] leading-none">{letterValue}</div>
		</div>
	);
}
