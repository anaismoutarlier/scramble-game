import { handleSchedule } from "@vercel/schedules";
import { generatePuzzle } from "../src/lib/generatePuzzle";

export const POST = handleSchedule(async () => {
	generatePuzzle();
});
