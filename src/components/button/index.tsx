import { ComponentProps } from "react";
import { cn } from "@/lib/cn";
import { type LucideIcon } from "lucide-react";

export function Button({
	children,
	variant = "filled",
	theme = "dark",
	className,
	icon,
	...props
}: ComponentProps<"button"> & { icon?: LucideIcon; variant?: "filled" | "outlined"; theme?: "light" | "dark" }) {
	const bgColor = theme === "light" ? "bg-dark" : "bg-primary";
	const textColor = theme === "light" ? "text-dark" : "text-primary";
	const borderColor = theme === "light" ? "border-dark" : "border-primary";

	const Icon = icon;
	return (
		<button
			{...props}
			className={cn(
				"text-dark cursor-pointer inline-flex gap-2 rounded-[20px] px-5 py-2 border",
				variant === "filled" ? `${bgColor} text-dark` : textColor,
				borderColor,
				className,
			)}
		>
			{Icon && <Icon />}
			<span className="text-nowrap font-semibold font-sans text-sm lg:text-base align-middle">{children}</span>
		</button>
	);
}
