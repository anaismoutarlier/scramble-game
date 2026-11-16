import type { Metadata } from "next";
import { DM_Sans, Oi } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import { KofiFloatingButton } from "kofi-react-widget";

const babyGemoy = localFont({
	src: "../fonts/Baby Gemoy.ttf",
	variable: "--font-baby-gemoy",
});

const dmSans = DM_Sans({
	variable: "--font-dm-sans",
});

const oi = Oi({
	variable: "--font-oi",
	weight: "400",
});

export const metadata: Metadata = {
	title: "Scramble",
	description:
		"Seven letters. Five chances. One daily challenge. Put your vocabulary and strategy to the test! Build words across the board, make every letter count, and see how close you can get to the day's perfect score. A new puzzle awaits every day. How high can you score?",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className={`${babyGemoy.variable} ${dmSans.variable} ${oi.variable} h-full antialiased bg-background`}>
			<body className="min-h-full w-full flex flex-col relative">
				<KofiFloatingButton username="anaismoutarlier" background="#dccdf4" textColor="#684756" />
				{children}
			</body>
		</html>
	);
}
