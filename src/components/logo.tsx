import Link from 'next/link';

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
       <div className="font-headline text-3xl font-extrabold tracking-tight text-primary">
        Your Shop
      </div>
    </Link>
  );
}
