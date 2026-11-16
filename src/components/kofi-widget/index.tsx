"use client";

import { useEffect, useCallback } from "react";
import Script from "next/script";

declare global {
	interface Window {
		kofiWidgetOverlay?: {
			draw: (username: string, options: Record<string, string>) => void;
		};
	}
}

export function KofiWidget() {
	const initKofi = useCallback(() => {
		if (typeof window !== "undefined" && window.kofiWidgetOverlay) {
			if (document.querySelector(".floatingchat-container-wrap")) return;

			window.kofiWidgetOverlay.draw("anaismoutarlier", {
				type: "floating-chat",
				"floating-chat.donateButton.background-color": "#c5fcca",
				"floating-chat.donateButton.text-color": "#684756",
			});
		}
	}, []);

	useEffect(() => {
		initKofi();
	}, [initKofi]);

	return <Script id="kofi-overlay-script" src="https://ko-fi.com" strategy="afterInteractive" onReady={initKofi} />;
}
