export function StatCard({ title, text, score }: { title: string; text: string; score?: { total: number; possible: number } }) {
	return (
		<article className="size-lf-stretch px-4 py-4 bg-dark rounded-lg border border-[0.6px] border-primary inline-flex flex-col justify-between items-start gap-2 overflow-hidden">
			<div className="w-full grid grid-cols-[auto_1fr] gap-3 align-center items-center sm:flex sm:flex-col">
				<div className="justify-start text-primary text-xl sm:text-2xl lg:text-3xl font-bold font-sans">{title}</div>
				<div className="justify-start text-light text-xs md:text-sm font-normal font-sans leading-tight">{text}</div>
			</div>
			{score ? (
				<div className="self-stretch h-1 inline-flex justify-start items-start gap-1 overflow-hidden">
					{Array.from({ length: score.possible }, (_, i) => {
						return i < score.total ? (
							<div className="flex-1 h-1 bg-primary rounded-xs" />
						) : (
							<div className="flex-1 h-1 opacity-20 bg-primary rounded-xs" />
						);
					})}
				</div>
			) : (
				<span />
			)}
		</article>
	);
}
