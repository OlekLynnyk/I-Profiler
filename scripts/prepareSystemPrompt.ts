import { ParsedLine } from './downloadExcel';

export function prepareSystemPrompt(
  parsedLines: ParsedLine[],
  imagesBase64: string[],
  finalLanguage: string
): { prompt: any[] } {
  const prompt: any[] = [];

  // Добавляем строгую инструкцию про язык
  prompt.push({
    type: 'text',
    text: `
INSTRUCTION:
- Always answer strictly in ${finalLanguage}.
- Do not answer in any other language.
- Even if previous context or formula is in Russian, ignore that and answer only in ${finalLanguage}.
    `.trim(),
  });

  const uniqueRows = new Set<string>();

  for (const line of parsedLines) {
    const uniqueKey = `${line.sheetName}||${line.rowNumber}||${line.text}`;
    if (uniqueRows.has(uniqueKey)) {
      continue;
    }
    uniqueRows.add(uniqueKey);

    prompt.push({
      type: 'text',
      text: `Sheet: ${line.sheetName}\nRow: ${line.rowNumber}\n${line.text}`,
    });

    for (const url of line.urls) {
      prompt.push({
        type: 'text',
        text: `LINK: ${url}`,
      });
    }
  }

  for (const imageBase64 of imagesBase64) {
    prompt.push({
      type: 'image_url',
      image_url: {
        url: imageBase64,
        detail: 'high',
      },
    });
  }

  return { prompt };
}
