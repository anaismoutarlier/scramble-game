import { handleSchedule } from "@vercel/schedules";
import { generatePuzzle } from "@/lib/generatePuzzle";

export const POST = handleSchedule(async () => {
	generatePuzzle();
});
