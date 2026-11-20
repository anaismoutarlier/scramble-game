import { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { type LucideIcon } from "lucide-react";

export function Button({
	children,
	variant = "filled",
	theme = "primary",
	className,
	icon,
	iconProps,
	...props
}: ComponentProps<"button"> & {
	icon?: LucideIcon;
	variant?: "filled" | "outlined";
	theme?: "light" | "dark" | "primary";
	iconProps?: { size?: number; strokeWidth?: number };
}) {
	const isOutlined = variant === "outlined";
	let bgColor =
		theme === "dark"
			? "bg-dark hover:bg-[color-mix(in_oklab,var(--dark)_90%,var(--light))]"
			: theme === "light"
				? "bg-light/90 hover:bg-light"
				: "bg-primary hover:bg-[color-mix(in_oklab,var(--primary)_65%,var(--light))]";
	let textColor = theme === "dark" ? "text-light" : theme === "light" ? "text-dark" : "text-dark";
	const borderColor = theme === "dark" ? "border-dark" : theme === "light" ? "border-light" : "border-primary";
	if (isOutlined) {
		bgColor =
			theme === "dark" ? "bg-transparent hover:bg-dark" : theme === "light" ? "bg-transparent" : "bg-transparent hover:bg-primary";
		textColor =
			theme === "dark"
				? "hover:text-light text-dark"
				: theme === "light"
					? "text-dark hover:text-light"
					: "text-primary hover:text-dark";
	}

	const Icon = icon;
	return (
		<button
			{...props}
			className={cn(
				"group/button disabled:cursor-auto text-dark cursor-pointer inline-flex items-center justify-center gap-2 rounded-[20px] px-5 py-2 border text-nowrap font-semibold font-sans text-sm lg:text-base align-middle",
				bgColor,
				textColor,
				borderColor,
				className,
				isOutlined
					? "disabled:border-disabled-surface disabled:text-disabled-surface disabled:bg-transparent"
					: "disabled:bg-disabled-surface",
			)}
		>
			{Icon && <Icon {...(iconProps ?? {})} />}
			<span>{children}</span>
		</button>
	);
}
