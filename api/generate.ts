import { handleSchedule } from "@vercel/schedules";
import { generatePuzzle } from "./_lib/generatePuzzle.js";

export const POST = handleSchedule(async () => {
	try {
		await generatePuzzle();
		Response.json({ ok: true });
	} catch {
		Response.json({ ok: false });
	}
});
