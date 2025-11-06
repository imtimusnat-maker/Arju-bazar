import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const targetLang = searchParams.get('targetLang') || 'bn';

  if (!text) {
    return NextResponse.json({ error: 'Text query parameter is required' }, { status: 400 });
  }

  // Using the MyMemory free translation API.
  // It's a simple, public API that doesn't require keys.
  const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`;

  try {
    const apiResponse = await fetch(apiUrl);
    if (!apiResponse.ok) {
      throw new Error(`API call failed with status: ${apiResponse.status}`);
    }
    const data = await apiResponse.json();

    if (data.responseStatus !== 200) {
      throw new Error(data.responseDetails);
    }
    
    // Extract the translated text.
    const translatedText = data.responseData.translatedText;

    return NextResponse.json({ translation: translatedText });

  } catch (error: any) {
    console.error('Translation service error:', error.message);
    return NextResponse.json({ error: 'Failed to translate text', details: error.message }, { status: 500 });
  }
}
