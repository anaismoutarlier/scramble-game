import { readFile, writeFile } from "fs/promises";

function findSubWords(letters, dictionary, minLen = 2) {
	console.log(`Checking ${letters}.`);
	const cleanLetters = letters.toLowerCase().replace(/[^a-z]/g, "");
	const maxLen = cleanLetters.length;

	const charCounts = new Uint8Array(26);
	for (let i = 0; i < maxLen; i++) {
		charCounts[cleanLetters.charCodeAt(i) - 97]++;
	}

	const results = [];
	const wordCount = new Uint8Array(26);

	for (const word of dictionary) {
		const len = word.length;
		if (len < minLen || len > maxLen) continue;

		wordCount.fill(0);
		let isValid = true;

		for (let i = 0; i < len; i++) {
			const charCode = word.charCodeAt(i) - 97;

			if (charCode < 0 || charCode > 25) {
				isValid = false;
				break;
			}

			wordCount[charCode]++;

			if (wordCount[charCode] > charCounts[charCode]) {
				isValid = false;
				break;
			}
		}

		if (isValid) results.push(word);
	}

	// 3. Sort longest words first, then alphabetically
	return results.sort((a, b) => b.length - a.length || a.localeCompare(b));
}

async function compareLists() {
	const fullEnableList = (await readFile("./enable1.txt", { encoding: "utf8" })).split(`\n`);
	const sevenLetterWordList = fullEnableList.filter(el => el.length === 7);

	const valid7LetterWords = sevenLetterWordList.filter(l => {
		console.time(l);
		const subWords = findSubWords(l, fullEnableList);
		const slams = subWords.filter(w => w.length === l.length);
		console.timeEnd(l);
		if (slams.length > 3) return false;
		return subWords.length >= 5;
	});
	console.log(valid7LetterWords.length);
	await writeFile("./word-list.txt", valid7LetterWords.join("\n"));
}

compareLists();
