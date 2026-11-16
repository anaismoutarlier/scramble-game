"use client";

import { Button } from "../button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/cn";

type GiveUpDialogProps = {
	open: boolean;
	isGivingUp: boolean;
	attemptsForfeited: number;
	onOpenChange: (open: boolean) => void;
	onCancel: () => void;
	onConfirm: () => void;
	currentStreak: number;
};

export function GiveUpDialog({ open, isGivingUp, attemptsForfeited, onOpenChange, onCancel, onConfirm, currentStreak }: GiveUpDialogProps) {
	let desc = (
		<span>
			If you give up now, your remaining{" "}
			<strong className={cn("font-bold", attemptsForfeited > 0 ? "text-dark" : "text-accent")}>
				{attemptsForfeited} {attemptsForfeited === 1 ? "attempt" : "attempts"}
			</strong>{" "}
			will be forfeited.
		</span>
	);
	if (currentStreak > 0)
		desc = (
			<span>
				If you give up now, your remaining{" "}
				<strong className={cn("font-bold", attemptsForfeited > 0 ? "text-dark" : "text-accent")}>
					{attemptsForfeited} {attemptsForfeited === 1 ? "attempt" : "attempts"}
				</strong>{" "}
				will be forfeited and you will lose your current streak of <strong className="font-bold text-dark">{currentStreak}</strong>.
			</span>
		);
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent showCloseButton={false} className="w-[calc(100vw-1.5rem)] sm:w-full rounded-2xl bg-light p-6 text-dark ring-0">
				<DialogHeader className="gap-3">
					<DialogTitle className="text-dark text-xl font-bold font-sans">Give up?</DialogTitle>
					<DialogDescription className="text-accent text-sm leading-5 font-normal font-sans">{desc}</DialogDescription>
				</DialogHeader>
				<DialogFooter className="pt-2 sm:justify-end">
					<Button variant="outlined" theme="dark" onClick={onCancel} disabled={isGivingUp}>
						Cancel
					</Button>
					<Button onClick={onConfirm} disabled={isGivingUp}>
						Yes, give up
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
