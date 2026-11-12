"use client";
import moment from "moment";
import { useEffect, useState } from "react";
import { DesktopHeader } from "./DesktopHeader";
import { MobileHeader } from "./MobileHeader";

export const Header = () => {
	const [date, setDate] = useState("");

	useEffect(() => {
		(() => {
			setDate(moment().format("MMMM DD[th], YYYY"));
		})();
	}, []);

	return (
		<>
			<DesktopHeader currentStreak={7} date={date} puzzleNo={142} />
			<MobileHeader currentStreak={7} date={date} puzzleNo={142} />
		</>
	);
};
