import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';

const YourShopIcon = () => (
    <ShoppingBag className="h-8 w-8 text-primary" strokeWidth={2.5} />
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
