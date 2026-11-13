import { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { type LucideIcon } from "lucide-react";

export function Button({
	children,
	variant = "filled",
	theme = "primary",
	className,
	icon,
	...props
}: ComponentProps<"button"> & { icon?: LucideIcon; variant?: "filled" | "outlined"; theme?: "light" | "dark" | "primary" }) {
	const isOutlined = variant === "outlined";
	let bgColor =
		theme === "dark"
			? "disabled:bg-disabled-surface bg-dark hover:bg-[color-mix(in_oklab,var(--dark)_90%,var(--light))]"
			: theme === "light"
				? "disabled:bg-disabled-surface bg-light hover:bg-dark"
				: "disabled:bg-disabled-surface bg-primary hover:bg-[color-mix(in_oklab,var(--primary)_65%,var(--light))]";
	let textColor = theme === "dark" ? "text-light" : theme === "light" ? "text-dark hover:text-light" : "text-dark";
	const borderColor =
		theme === "dark"
			? "disabled:border-disabled-surface border-dark"
			: theme === "light"
				? "disabled:border-disabled-surface border-light"
				: "disabled:border-disabled-surface border-primary";
	if (isOutlined) {
		bgColor =
			theme === "dark"
				? "bg-transparent hover:bg-dark"
				: theme === "light"
					? "bg-transparent hover:bg-dark"
					: "bg-transparent hover:bg-primary";
		textColor =
			theme === "dark"
				? "hover:text-light text-dark"
				: theme === "light"
					? "text-dark hover:text-dark"
					: "text-primary hover:text-dark";
	}

	const Icon = icon;
	return (
		<button
			{...props}
			className={cn(
				"group/button disabled:cursor-auto text-dark cursor-pointer inline-flex items-center justify-center gap-2 rounded-[20px] px-5 py-2 border",
				bgColor,
				textColor,
				borderColor,
				className,
			)}
		>
			{Icon && <Icon />}
			<span className="text-nowrap font-semibold font-sans text-sm lg:text-base align-middle">{children}</span>
		</button>
	);
}
