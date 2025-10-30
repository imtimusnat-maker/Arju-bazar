import Link from 'next/link';
import { Store } from 'lucide-react';

const YourShopIcon = () => (
    <Store className="h-8 w-8 text-primary" strokeWidth={2.5} />
)


export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
       <YourShopIcon />
       <div className="font-headline text-2xl font-bold tracking-tight text-foreground">
        YOUR SHOP
      </div>
    </Link>
  );
}
