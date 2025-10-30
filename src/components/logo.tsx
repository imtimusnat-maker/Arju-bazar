import Link from 'next/link';

const GhorerBazarIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.66699 14.6667L16.0003 4L29.3337 14.6667V28H18.667V20H13.3337V28H2.66699V14.6667Z" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 9.33333C20 11.864 18.2317 14 16 14C13.7683 14 12 11.864 12 9.33333C12 6.80267 14.2392 4.46973 16 6.66667C17.7608 4.46973 20 6.80267 20 9.33333Z" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)


export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
       <GhorerBazarIcon />
       <div className="font-headline text-2xl font-bold tracking-tight text-foreground">
        GHORER BAZAR
      </div>
    </Link>
  );
}
