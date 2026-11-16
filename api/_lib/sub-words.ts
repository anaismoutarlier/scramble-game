export function findSubWords(letters: string, dictionary: string[], minLen = 2) {
	if (!dictionary || !dictionary.length) throw new Error("Invalid word list.");
	const isUppercase = dictionary[0].toUpperCase() === dictionary[0];
	const cleanLetters = isUppercase ? letters.toUpperCase().replace(/[^A-Z]/g, "") : letters.toLowerCase().replace(/[^a-z]/g, "");
	console.log(`Compiling dictionary for ${cleanLetters}.`);
	const charCodeOffset = isUppercase ? 65 : 97;
	const maxLen = cleanLetters.length;

	const charCounts = new Uint8Array(26);
	for (let i = 0; i < maxLen; i++) {
		charCounts[cleanLetters.charCodeAt(i) - charCodeOffset]++;
	}

	const results = [];
	const wordCount = new Uint8Array(26);

	for (const word of dictionary) {
		const len = word.length;
		if (len < minLen || len > maxLen) continue;

		wordCount.fill(0);
		let isValid = true;

		for (let i = 0; i < len; i++) {
			const charCode = word.charCodeAt(i) - charCodeOffset;

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
