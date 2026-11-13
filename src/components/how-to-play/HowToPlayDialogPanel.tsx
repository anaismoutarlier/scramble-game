import { BONUS_TILE_DESCRIPTIONS, BONUS_TILES_TITLE, HOW_TO_PLAY_RULES, HOW_TO_PLAY_TITLE } from "@/data/howToPlayContent";
import { cn } from "@/lib/cn";
import { BonusTileMini } from "./BonusTileMini";

function RulesSectionIcon({ label }: { label: string }) {
	return (
		<div className="size-7 shrink-0 rounded-full bg-primary inline-flex items-center justify-center">
			<span className="text-dark text-sm font-bold font-sans">{label}</span>
		</div>
	);
}

export function HowToPlayDialogPanel() {
	return (
		<section className="w-full flex flex-col gap-8">
			<div className="w-full flex flex-col gap-3">
				<div className="w-full inline-flex items-center gap-2">
					<RulesSectionIcon label="?" />
					<h2 className="text-dark text-[17px] font-bold font-sans">{HOW_TO_PLAY_TITLE}</h2>
				</div>
				<div className="w-full h-px bg-primary" aria-hidden="true" />
				<ol className="w-full flex flex-col gap-2.5">
					{HOW_TO_PLAY_RULES.map(rule => (
						<li key={rule.order} className="w-full inline-flex items-start gap-2.5">
							<div className="size-[22px] shrink-0 rounded-full bg-primary inline-flex items-center justify-center mt-0.5">
								<span className="text-dark text-[11px] font-bold font-sans">{rule.order}</span>
							</div>
							<p className="text-dark text-[13px] leading-tight font-normal font-sans flex-1 min-w-0">
								{rule.segments.map((segment, index) => (
									<span key={`${rule.order}-${index}`} className={cn(segment.emphasis && "font-bold")}>
										{segment.text}
									</span>
								))}
							</p>
						</li>
					))}
				</ol>
			</div>

			<div className="w-full flex flex-col gap-3">
				<div className="w-full inline-flex items-center gap-2">
					<RulesSectionIcon label="★" />
					<h3 className="text-dark text-[17px] font-bold font-sans">{BONUS_TILES_TITLE}</h3>
				</div>
				<div className="w-full h-px bg-primary" aria-hidden="true" />
				<ul className="w-full flex flex-col gap-2.5">
					{BONUS_TILE_DESCRIPTIONS.map(item => (
						<li key={item.bonus} className="w-full inline-flex items-center gap-3">
							<BonusTileMini bonus={item.bonus} />
							<div className="flex-1 min-w-0 flex flex-col gap-0.5">
								<p className="text-dark text-[13px] leading-tight font-bold font-sans">{item.title}</p>
								<p className="text-accent text-xs leading-tight font-normal font-sans">{item.description}</p>
							</div>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
