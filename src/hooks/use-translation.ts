'use client';

import { useState, useEffect, useCallback } from 'react';
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
      console.error('Translation API call failed');
      return text; // Fallback to original text on error
    }
    const data = await response.json();
    const translated = data.translation;
    
    translationCache[cacheKey] = translated; // Store in cache
    return translated;

  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original text on error
  }
}

export function useTranslation(originalText: string | undefined | null) {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState(originalText || '');

  const translate = useCallback(async () => {
    if (language === 'bn' && originalText) {
      const translation = await fetchTranslation(originalText, 'bn');
      setTranslatedText(translation);
    } else {
      setTranslatedText(originalText || '');
    }
  }, [language, originalText]);

  useEffect(() => {
    translate();
  }, [translate]);

  return translatedText;
}
