import { describe, test, expect } from 'vitest';
import { detectUserLanguage } from './detectUserLanguage';

describe('detectUserLanguage', () => {
  test('returns "ru" for Russian text', () => {
    const lang = detectUserLanguage("Привет, как дела?");
    expect(lang).toBe("ru");
  });

  test('returns "fr" for French text', () => {
    const lang = detectUserLanguage("Bonjour, comment ça va ?");
    expect(lang).toBe("fr");
  });

  test('returns "es" for Spanish text', () => {
    const lang = detectUserLanguage("Hola, ¿cómo estás?");
    expect(lang).toBe("es");
  });

  test('returns "en" for English text', () => {
    const lang = detectUserLanguage("Hello, how are you?");
    expect(lang).toBe("en");
  });

  test('returns "en" for empty input', () => {
    const lang = detectUserLanguage("");
    expect(lang).toBe("en");
  });

  test('returns "en" for null input', () => {
    const lang = detectUserLanguage(null);
    expect(lang).toBe("en");
  });
});
