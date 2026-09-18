import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'en' | 'hi' | 'gu';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: 'arogyaai-language-storage',
    }
  )
);
