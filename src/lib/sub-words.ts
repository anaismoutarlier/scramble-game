export function findSubWords(letters: string, dictionary: string[], minLen = 2) {
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

	return results.sort((a, b) => b.length - a.length || a.localeCompare(b));
}
