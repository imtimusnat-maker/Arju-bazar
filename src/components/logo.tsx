'use client';

import Link from 'next/link';
import { Store } from 'lucide-react';
import { useLanguage } from '@/context/language-context';

const YourShopIcon = () => (
    <Store className="h-8 w-8 text-primary" strokeWidth={2.5} />
)


export function Logo() {
  const { language } = useLanguage();

  return (
    <Link href="/" className="flex items-center space-x-2">
       <YourShopIcon />
       <div className="font-headline text-2xl font-bold tracking-tight">
        <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
          {language === 'bn' ? 'আরজু বাজার' : 'Arju Bazar'}
        </span>
      </div>
    </Link>
  );
}
