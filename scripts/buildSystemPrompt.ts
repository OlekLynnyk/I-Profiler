import { STANDARD_PROMPTS } from './constants';

export function buildSystemPrompt({
  type,
  formulaPrompt,
  userLanguage,
}: {
  type: 'profiling';
  formulaPrompt: string;
  userLanguage: string;
}): string {
  const standardPrompt = STANDARD_PROMPTS[type];
  if (!standardPrompt) {
    throw new Error(`Unknown prompt type: ${type}`);
  }

  return [
    `INSTRUCTION:`,
    `- Always answer strictly in ${userLanguage}.`,
    `- Do not answer in any other language.`,
    `- Even if previous context or formula is in Russian, ignore that and answer only in ${userLanguage}.`,
    ``,
    `--- START OF FORMULA ---`,
    formulaPrompt,
    `--- END OF FORMULA ---`,
    ``,
    `--- START OF INSTRUCTIONS ---`,
    standardPrompt.trim(),
    `--- END OF INSTRUCTIONS ---`,
  ]
    .join('\n\n')
    .trim();
}
