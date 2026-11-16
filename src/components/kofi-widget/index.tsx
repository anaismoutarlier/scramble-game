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
				"floating-chat.donateButton.text": "",
				"floating-chat.donateButton.background-color": "#c5fcca",
				"floating-chat.donateButton.text-color": "#684756",
			});

			const iframe = document.querySelector<HTMLIFrameElement>("iframe.floatingchat-container");
			const iframeDoc = iframe?.contentDocument;
			if (iframeDoc) {
				const style = iframeDoc.createElement("style");
				style.textContent = `
	  	body [id^="kofi-widget-overlay"] span {
			display: none !important;
		}

		body [id^="kofi-widget-overlay"]:hover {
		background-color: color-mix(in oklab, #c5fcca 70%, #fff9f9) !important;
		}
 	`;
				iframeDoc.head.appendChild(style);
			}
		}
	}, []);

	useEffect(() => {
		initKofi();
	}, [initKofi]);

	return (
		<Script
			id="kofi-overlay-script"
			src="https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
			strategy="afterInteractive"
			onReady={initKofi}
		/>
	);
}
