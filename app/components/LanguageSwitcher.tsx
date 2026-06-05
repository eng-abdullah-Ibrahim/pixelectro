"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "./TranslationProvider";
import s from "./LanguageSwitcher.module.css";

const LANGUAGES = [
  { code: "en", flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/4.1.5/flags/4x3/us.svg", name: "English" },
  { code: "ar", flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/4.1.5/flags/4x3/sa.svg", name: "العربية" },
  { code: "zh", flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/4.1.5/flags/4x3/cn.svg", name: "中文" },
  { code: "hi", flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/4.1.5/flags/4x3/in.svg", name: "हिन्दी" },
  { code: "es", flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/4.1.5/flags/4x3/es.svg", name: "Español" },
  { code: "fr", flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/4.1.5/flags/4x3/fr.svg", name: "Français" },
  { code: "it", flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/4.1.5/flags/4x3/it.svg", name: "Italiano" },
  { code: "ru", flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/4.1.5/flags/4x3/ru.svg", name: "Русский" },
  { code: "pt", flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/4.1.5/flags/4x3/pt.svg", name: "Português" },
  { code: "de", flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/4.1.5/flags/4x3/de.svg", name: "Deutsch" },
  { code: "ja", flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/4.1.5/flags/4x3/jp.svg", name: "日本語" },
  { code: "tr", flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/4.1.5/flags/4x3/tr.svg", name: "Türkçe" },
  { code: "ko", flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/4.1.5/flags/4x3/kr.svg", name: "한국어" },
  { code: "id", flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/4.1.5/flags/4x3/id.svg", name: "Bahasa" },
  { code: "ur", flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/4.1.5/flags/4x3/pk.svg", name: "اردو" },
  { code: "bn", flag: "https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/4.1.5/flags/4x3/bd.svg", name: "বাংলা" },
];

export const availableLanguages = LANGUAGES.map(l => l.code);

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const changeLanguage = (code: string) => {
    setLocale(code);
    setIsOpen(false);
    // Refresh server components to catch the new NEXT_LOCALE cookie
    router.refresh();
  };

  const active = LANGUAGES.find(l => l.code === locale) || LANGUAGES[0];

  return (
    <div className={s.wrapper} ref={wrapperRef}>
      <button
        className={`${s.trigger} ${isOpen ? s.triggerOpen : ""}`}
        onClick={() => setIsOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Change language"
      >
        <img src={active.flag} alt={active.name} className={s.flagImage} width="18" height="13" />
        <span className={s.code}>{active.code.toUpperCase()}</span>
        <svg
          className={`${s.chevron} ${isOpen ? s.chevronOpen : ""}`}
          width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {isOpen && (
        <div className={s.dropdown} role="listbox" aria-label="Language options">
          <div className={s.dropdownHeader}>Select Language</div>
          <div className={s.dropdownGrid}>
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                className={`${s.option} ${locale === lang.code ? s.optionActive : ""}`}
                onClick={() => changeLanguage(lang.code)}
                role="option"
                aria-selected={locale === lang.code}
              >
                <img src={lang.flag} alt={lang.name} className={s.optionFlagImage} width="20" height="15" />
                <span className={s.optionName}>{lang.name}</span>
                {locale === lang.code && (
                  <svg className={s.check} width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                    <path d="M2 7l3.5 3.5L12 3" stroke="#4a86e8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
