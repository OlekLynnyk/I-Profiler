export function detectUserLanguage(userPrompt: string | null): string {
  if (!userPrompt || userPrompt.trim().length < 3) {
    // Если пользователь не написал ничего или слишком мало текста → fallback
    return "en";
  }

  const text = userPrompt.trim();

  const tests: { [lang: string]: RegExp } = {
    ru: /[а-яё]/i,
    uk: /[ґєії]/i,
    es: /[ñáéíóúü]/i,         // <-- перемещено выше pl
    pl: /[ąćęńóśźżł]/i,
    cs: /[ěščřžýáíé]/i,
    sk: /[ľščťžýáíé]/i,
    ro: /[șțăâî]/i,
    hu: /[őű]/i,
    bg: /[а-яё]/i,
    de: /[äöüß]/i,
    fr: /[éèçâêîôûëïü]/i,
    it: /[àèéìòù]/i,
    nl: /[éëïöü]/i,
    sv: /[åäö]/i,
    no: /[åøæ]/i,
    fi: /[äöå]/i,
    da: /[æøå]/i,
    pt: /[ãõáâéêîôúç]/i,
  };

  for (const [lang, regex] of Object.entries(tests)) {
    if (regex.test(text)) {
      return lang;
    }
  }

  if (/[a-z]/i.test(text)) {
    return "en";
  }

  return "en";
}
