import { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { type LucideIcon } from "lucide-react";

export function Button({
	children,
	variant = "filled",
	theme = "light",
	className,
	icon,
	...props
}: ComponentProps<"button"> & { icon?: LucideIcon; variant?: "filled" | "outlined"; theme?: "light" | "dark" }) {
	const isOutlined = variant === "outlined";
	let bgColor =
		theme === "dark"
			? "bg-dark hover:bg-[color-mix(in_oklab,var(--dark)_90%,var(--light))]"
			: "bg-primary hover:bg-[color-mix(in_oklab,var(--primary)_65%,var(--light))]";
	let textColor = theme === "dark" ? "text-light" : "text-dark";
	const borderColor = theme === "dark" ? "border-dark" : "border-primary";
	if (isOutlined) {
		bgColor = theme === "dark" ? "bg-transparent hover:bg-dark" : "bg-transparent hover:bg-primary";
		textColor = theme === "dark" ? "hover:text-light text-dark" : "text-primary hover:text-dark";
	}

	const Icon = icon;
	return (
		<button
			{...props}
			className={cn(
				"group/button text-dark cursor-pointer inline-flex items-center justify-center gap-2 rounded-[20px] px-5 py-2 border",
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
