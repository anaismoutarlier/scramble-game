import { handleSchedule } from "@vercel/schedules";
import { generatePuzzle } from "../src/lib/generatePuzzle";

export const POST = handleSchedule(async () => {
	try {
		generatePuzzle();
		Response.json({ ok: true });
	} catch {
		Response.json({ ok: false });
	}
});
