"use client";

import moment from "moment";
import { useEffect, useState } from "react";

function getCountdownToNextMidnight() {
	const now = moment();
	const nextMidnight = moment().add(1, "day").startOf("day");
	const diffMs = Math.max(0, nextMidnight.diff(now));
	const duration = moment.duration(diffMs);
	const hours = String(Math.floor(duration.asHours())).padStart(2, "0");
	const minutes = String(duration.minutes()).padStart(2, "0");
	const seconds = String(duration.seconds()).padStart(2, "0");

	return `${hours}:${minutes}:${seconds}`;
}

export function Footer() {
	const [countdown, setCountdown] = useState(() => getCountdownToNextMidnight());

	useEffect(() => {
		const interval = window.setInterval(() => {
			setCountdown(getCountdownToNextMidnight());
		}, 1000);

		return () => {
			window.clearInterval(interval);
		};
	}, []);

	return (
		<div className="w-full px-3 sm:px-6 py-4 bg-primary flex justify-between items-center gap-2">
			<div className="flex flex-col sm:flex-row items-start justify-start sm:items-center sm:gap-3">
				<div className="justify-start text-dark text-base font-normal font-baby-gemoy">SCRAMBLE</div>
				<div className="text-dark text-xs">© 2026 Anaïs Moutarlier &amp; Kesh Gor</div>
			</div>
			<div className="justify-start text-dark text-right text-xs tabular-nums">New puzzle in {countdown}</div>
		</div>
	);
}
