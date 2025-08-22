import { ParsedLine } from './downloadExcel';

// ▼ ДОБАВЛЕНО: локальный маппер названий языков по BCP-47 коду
const LANG_LABELS: Record<string, string> = {
  en: 'English',
  ru: 'Russian',
  uk: 'Ukrainian',
  es: 'Spanish',
  pt: 'Portuguese',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  nl: 'Dutch',
  tr: 'Turkish',
  vi: 'Vietnamese',
  pl: 'Polish',
  cs: 'Czech',
  sk: 'Slovak',
  ro: 'Romanian',
  hu: 'Hungarian',
  sv: 'Swedish',
  no: 'Norwegian',
  fi: 'Finnish',
  da: 'Danish',
  el: 'Greek',
  he: 'Hebrew',
  ar: 'Arabic',
  hi: 'Hindi',
  th: 'Thai',
  ka: 'Georgian',
  hy: 'Armenian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
};
function labelFor(tag: string) {
  return LANG_LABELS[tag] || 'English';
}
// ▲ ДОБАВЛЕНО

export function prepareSystemPrompt(
  parsedLines: ParsedLine[],
  imagesBase64: string[],
  finalLanguage: string
): { prompt: any[] } {
  const prompt: any[] = [];

  // Добавляем строгую инструкцию про язык
  prompt.push({
    type: 'text',
    // ▼ ИЗМЕНЕНО: добавлено понятное имя + BCP-47
    text: `
INSTRUCTION:
- Always answer strictly in ${labelFor(finalLanguage)} (BCP-47: ${finalLanguage}).
- Do not answer in any other language.
- Even if previous context or formula is in Russian, ignore that and answer only in ${labelFor(finalLanguage)}.
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
