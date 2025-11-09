'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/language-context';

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

  useEffect(() => {
    let isCancelled = false;

    const translate = async () => {
      if (language === 'bn' && originalText) {
        const translation = await fetchTranslation(originalText, 'bn');
        if (!isCancelled) {
          setTranslatedText(translation);
        }
      } else {
        if (!isCancelled) {
          setTranslatedText(originalText || '');
        }
      }
    };

    translate();

    return () => {
      isCancelled = true;
    };
  }, [language, originalText]);

  return translatedText;
}
