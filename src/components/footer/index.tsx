"use client";

import moment from "moment";
import { useEffect, useState, use, Suspense, useRef } from "react";
import { io } from "next/cache";

function diffNowToMidnight() {
	const now = moment();
	const nextMidnight = moment().add(1, "day").startOf("day");
	const diffMs = Math.max(0, nextMidnight.diff(now));
	return diffMs;
}

function getCountdownToNextMidnight() {
	const diffMs = diffNowToMidnight();
	const duration = moment.duration(diffMs);
	// if (diffMs <= 0) window.location.reload();
	const hours = String(Math.floor(duration.asHours())).padStart(2, "0");
	const minutes = String(duration.minutes()).padStart(2, "0");
	const seconds = String(duration.seconds()).padStart(2, "0");

	return `${hours}:${minutes}:${seconds}`;
}

const Countdown = () => {
	use(io());
	const [countdown, setCountdown] = useState(() => getCountdownToNextMidnight());
	const loadDate = useRef(moment().format("YYYY-MM-DD"));
	useEffect(() => {
		const interval = window.setInterval(() => {
			setCountdown(getCountdownToNextMidnight());
		}, 1000);

		return () => {
			window.clearInterval(interval);
		};
	}, []);

	const checkMidnight = () => {
		if (moment().format("YYYY-MM-DD") !== loadDate.current) window.location.reload();
	};

	useEffect(() => {
		const interval = window.setInterval(
			() => {
				checkMidnight();
			},
			60 * 60 * 1,
		);

		return () => {
			window.clearInterval(interval);
		};
	}, []);

	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				checkMidnight();
			}
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	});

	return <div className="justify-start text-dark text-right text-xs tabular-nums">New puzzle in {countdown}</div>;
};

export function Footer() {
	return (
		<div className="w-full px-3 sm:px-6 py-4 bg-primary flex justify-between items-center gap-2">
			<div className="flex flex-col sm:flex-row items-start justify-start sm:items-center sm:gap-3">
				<div className="justify-start text-dark text-base font-normal font-baby-gemoy">SCRAMBLE</div>
				<div className="text-dark text-xs">© 2026 Anaïs Moutarlier &amp; Kesh Gor</div>
			</div>
			<Suspense>
				<Countdown />
			</Suspense>
		</div>
	);
}
