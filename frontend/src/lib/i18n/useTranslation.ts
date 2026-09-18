import { useLanguageStore } from '@/stores/languageStore';
import { translations } from './translations';

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export function useTranslation() {
  const language = useLanguageStore((state) => state.language);

  const t = (key: NestedKeyOf<typeof translations.en>): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    
    // Fallback to English if translation is missing
    let fallbackResult: any = translations['en'];

    for (const k of keys) {
      if (result) result = result[k];
      if (fallbackResult) fallbackResult = fallbackResult[k];
    }

    return result || fallbackResult || key;
  };

  return { t, language };
}
