import type { Metadata } from "next";
import { DM_Sans, Port_Lligat_Slab } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";
import { KofiWidget } from "@/components/kofi-widget";
import { Analytics } from "@vercel/analytics/next";

const babyGemoy = localFont({
	src: "../fonts/Baby Gemoy.ttf",
	variable: "--font-baby-gemoy",
});

const dmSans = DM_Sans({
	variable: "--font-dm-sans",
});

const portLligatSlab = Port_Lligat_Slab({
	variable: "--font-port-lligat-slab",
	weight: "400",
});

export const metadata: Metadata = {
	title: "Scramble",
	description:
		"Seven letters. Five chances. One daily challenge. Put your vocabulary and strategy to the test! Build words across the board, make every letter count, and see how close you can get to the day's perfect score. A new puzzle awaits every day. How high can you score?",
	openGraph: {
		images: [{ url: "/icon.svg" }],
	},
	metadataBase: "https://www.scrambleworld.com",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html lang="en" className={`${babyGemoy.variable} ${dmSans.variable} ${portLligatSlab.variable} h-full antialiased bg-background`}>
			<body className="min-h-full w-full flex flex-col relative">
				{process.env.NEXT_PUBLIC_VERCEL_ENV === "production" && <Analytics />}
				<KofiWidget />
				{children}
			</body>
		</html>
	);
}
