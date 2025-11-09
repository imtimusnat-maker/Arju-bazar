'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/context/language-context';
import { useDebounce } from './use-debounce';

// Simple in-memory cache
const translationCache: Record<string, string> = {};

async function fetchTranslation(text: string, targetLang: 'bn'): Promise<string> {
  if (!text) return '';

  const cacheKey = `${targetLang}:${text}`;
  if (translationCache[cacheKey]) {
    return translationCache[cacheKey];
  }

  try {
    const response = await fetch(`/api/translate?text=${encodeURIComponent(text)}&targetLang=${targetLang}`);
    if (!response.ok) {
      // Don't log to console on simple non-200 responses, as this can happen with rate limits.
      // Let the fallback handle it gracefully.
      return text; // Fallback to original text on error
    }
    const data = await response.json();
    if (!data.translation) {
      return text; // Fallback if translation is empty
    }
    const translated = data.translation;
    
    translationCache[cacheKey] = translated; // Store in cache
    return translated;

  } catch (error) {
    console.error('Translation network error:', error);
    return text; // Fallback to original text on error
  }
}

export function useTranslation(originalText: string | undefined | null) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(originalText || '');

  // Debounce the original text to prevent rapid API calls
  const debouncedOriginalText = useDebounce(originalText, 300);

  const translate = useCallback(async () => {
    if (language === 'bn' && debouncedOriginalText) {
      const translation = await fetchTranslation(debouncedOriginalText, 'bn');
      setTranslatedText(translation);
    } else {
      setTranslatedText(debouncedOriginalText || '');
    }
  }, [language, debouncedOriginalText]);

  useEffect(() => {
    // When the language changes, immediately try to translate the current (non-debounced) text
    if (language === 'bn' && originalText) {
        (async () => {
            const translation = await fetchTranslation(originalText, 'bn');
            setTranslatedText(translation);
        })();
    } else {
         setTranslatedText(originalText || '');
    }
  }, [language, originalText]);

  useEffect(() => {
    // Effect for handling debounced text changes for auto-translation as user types
    translate();
  }, [translate]);

  return translatedText;
}
