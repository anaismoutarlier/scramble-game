"use client";

import { useEffect, useState } from "react";
import { Info, Menu, X } from "lucide-react";
import { CurrentStreakCard } from "../current-streak-card";
import { Wordmark } from "../wordmark";
import { cn } from "@/lib/cn";
import { HowToPlay } from "../how-to-play";
import Image from "next/image";

export function MobileHeader({
	date,
	currentStreak,
	puzzleNo,
	wordmarkRef,
}: {
	date: string;
	currentStreak?: string | number;
	puzzleNo: string | number;
	wordmarkRef?: (element: HTMLDivElement | null) => void;
}) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsMenuOpen(false);
			}
		};

		window.addEventListener("keydown", handleEscape);
		return () => window.removeEventListener("keydown", handleEscape);
	}, []);

	return (
		<header
			className={
				"overflow-hidden md:hidden fixed top-0 inset-x-0 z-40 flex flex-col items-center w-full h-[100px] justify-end bg-dark"
			}
		>
			<div className={"w-full h-full self-stretch py-4 flex justify-between items-center gap-3 px-4 sm:px-8"}>
				<div className="inline-flex flex-col gap-1 min-w-0">
					<div ref={wordmarkRef}>
						<Wordmark size="compact" />
					</div>
					<div className="text-light text-xs font-normal font-sans">A daily word puzzle</div>
				</div>
				<div className="inline-flex items-center gap-2 shrink-0">
					<button
						type="button"
						onClick={() => setIsMenuOpen(current => !current)}
						aria-label={isMenuOpen ? "Close menu" : "Open menu"}
						aria-expanded={isMenuOpen}
						className="size-10 inline-flex items-center justify-center text-primary"
					>
						{isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
					</button>
				</div>
			</div>
			<span
				className={cn(
					"h-px bg-primary transition-width duration-300",
					isMenuOpen ? "w-full" : "w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)]",
				)}
			/>

			<div
				className={`fixed inset-0 z-30 m:hidden ${isMenuOpen ? "pointer-events-auto" : "pointer-events-none"}`}
				aria-hidden={!isMenuOpen}
			>
				<button type="button" aria-label="Close menu" onClick={() => setIsMenuOpen(false)} className={`absolute inset-0`} />
				<aside
					className={`absolute top-[100px] right-0 w-[220px] h-[calc(100dvh-89px)] bg-dark/90 px-5 py-10 flex justify-between flex-col items-end gap-4 transition-transform duration-300 ease-out ${
						isMenuOpen ? "translate-x-0" : "translate-x-full"
					}`}
				>
					<div className="flex flex-col gap-3">
						<div className="inline-flex flex-col items-end gap-0.5 text-right pr-2">
							<div className="text-primary text-[8px] font-semibold font-sans uppercase tracking-widest">{date}</div>
							<div className="text-light text-base font-bold font-sans">Day #{puzzleNo}</div>
						</div>
						{currentStreak ? <CurrentStreakCard currentStreak={currentStreak} size="compact" /> : null}
					</div>

					<div className="flex flex-col items-end gap-2">
						<HowToPlay buttonProps={{ variant: "outlined", icon: Info }} onTriggerClick={() => setIsMenuOpen(false)} />
						<a
							className="rounded-3xl items-center flex bg-tile-tw-surface px-6 py-2.5 gap-3 hover:bg-[color-mix(in_oklab,var(--tile-tw-surface)_70%,var(--light))]"
							target="_blank"
							rel="noopener noreferrer"
							href={`https://ko-fi.com/anaismoutarlier`}
						>
							<Image height={21} width={29} src={"/kofi-logomarkLogo.webp"} alt="kofi-logo" />
							<span className="font-sans text-nowrap text-sm font-semibold">Support Us</span>
						</a>
					</div>
				</aside>
			</div>
		</header>
	);
}
