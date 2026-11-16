"use client";

import { useState, type ComponentProps, type MouseEvent } from "react";
import { Info, type LucideIcon } from "lucide-react";
import { Button } from "@/components/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { HowToPlayDialogPanel } from "./HowToPlayDialogPanel";

type TriggerButtonProps = Omit<ComponentProps<typeof Button>, "children" | "icon"> & {
	icon?: LucideIcon;
};

type HowToPlayProps = {
	buttonProps?: TriggerButtonProps;
	onTriggerClick?: () => void;
};

export function HowToPlay({ buttonProps, onTriggerClick }: HowToPlayProps) {
	const [open, setOpen] = useState(false);
	const { icon = Info, onClick, ...restButtonProps } = buttonProps ?? {};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger
				render={<Button icon={icon} {...restButtonProps} />}
				onClick={(event: MouseEvent<HTMLButtonElement>) => {
					onTriggerClick?.();
					onClick?.(event);
				}}
			>
				How to Play
			</DialogTrigger>
			<DialogContent
				showCloseButton={false}
				animation="none"
				className="how-to-play-panel top-4 right-2 left-auto translate-x-0 translate-y-0 w-[calc(100vw-1rem)] sm:w-[calc(100vw-2rem)] max-w-4xl rounded-2xl bg-light p-6 sm:p-8 md:px-6 md:py-8 text-dark ring-0 gap-0 max-h-[calc(100vh-24px)] overflow-y-scroll"
			>
				<HowToPlayDialogPanel />
			</DialogContent>
		</Dialog>
	);
}
