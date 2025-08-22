export function detectUserLanguage(userPrompt: string | null, fallback: string = 'en'): string {
  if (!userPrompt) return fallback;

  const text = userPrompt.trim();
  if (!text) return fallback;

  // Если только символы/эмодзи/пробелы → считаем как "нет текста"
  if (/^[\p{P}\p{S}\s]+$/u.test(text)) return fallback;

  // Если начинается с URL → считаем как "нет текста"
  if (/^(https?:\/\/|www\.)/i.test(text)) return fallback;

  // --- Детект по Unicode-скриптам ---
  if (/\p{Script=Hiragana}|\p{Script=Katakana}/u.test(text)) return 'ja'; // японская кана
  if (/\p{Script=Hangul}/u.test(text)) return 'ko'; // корейский
  if (/\p{Script=Han}/u.test(text)) return 'zh'; // китайский (хань)
  if (/\p{Script=Arabic}/u.test(text)) return 'ar';
  if (/\p{Script=Hebrew}/u.test(text)) return 'he';
  if (/\p{Script=Greek}/u.test(text)) return 'el';
  if (/\p{Script=Devanagari}/u.test(text)) return 'hi';
  if (/\p{Script=Thai}/u.test(text)) return 'th';
  if (/\p{Script=Georgian}/u.test(text)) return 'ka';
  if (/\p{Script=Armenian}/u.test(text)) return 'hy';

  // --- Кириллица: ru vs uk (по специфике букв)
  if (/[а-яёіїєґ]/i.test(text)) {
    return /[іїєґ]/i.test(text) ? 'uk' : 'ru';
  }

  // --- Латиница с диакритиками/спецсимволами ---
  if (/[őű]/i.test(text)) return 'hu'; // Hungarian
  if (/[çğıİöşü]/i.test(text)) return 'tr'; // Turkish
  // Vietnamese (расширенный набор диакритик)
  if (
    /[ăâêôơưđ]/i.test(text) ||
    /[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựíìỉĩịýỳỷỹỵđ]/i.test(text)
  ) {
    return 'vi';
  }
  if (/[ñáéíóúü]/i.test(text)) return 'es'; // Spanish
  if (/[ãõáâàéêíóôúç]/i.test(text)) return 'pt'; // Portuguese (добавлен à)
  if (/[éèêëàâîïôöùûüç]/i.test(text)) return 'fr'; // French
  if (/[äöüß]/i.test(text)) return 'de'; // German
  if (/[àèéìòù]/i.test(text)) return 'it'; // Italian
  if (/[ąćęńóśźżł]/i.test(text)) return 'pl'; // Polish
  if (/[ěščřžýáíéůú]/i.test(text)) return 'cs'; // Czech
  if (/[ľščťžýáíéôŕ]/i.test(text)) return 'sk'; // Slovak
  if (/[șţțşâîă]/i.test(text)) return 'ro'; // Romanian
  if (/[åäö]/i.test(text)) return 'sv'; // Swedish
  if (/[åøæ]/i.test(text)) return 'no'; // Norwegian
  if (/[äöå]/i.test(text)) return 'fi'; // Finnish
  if (/[æøå]/i.test(text)) return 'da'; // Danish
  if (/[éëïöü]/i.test(text)) return 'nl'; // Dutch

  // Латиница без диакритик → безопасно считаем английским
  if (/[a-z]/i.test(text)) return 'en';

  // Иначе — fallback
  return fallback;
}
