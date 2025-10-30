import Link from 'next/link';
import { Logo } from '@/components/logo';
import { Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="bg-card text-card-foreground border-t">
      <div className="container mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Your one-stop shop for fashion and home goods. Quality products curated just for you.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Youtube /></Link>
            </div>
          </div>
          <div>
            <h3 className="font-headline text-lg font-semibold">Categories</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/collections/men" className="text-muted-foreground hover:text-primary">Men Collections</Link></li>
              <li><Link href="/collections/women" className="text-muted-foreground hover:text-primary">Women Collection</Link></li>
              <li><Link href="/collections/kids" className="text-muted-foreground hover:text-primary">Kids Collections</Link></li>
              <li><Link href="/collections/bedsheets" className="text-muted-foreground hover:text-primary">3D Bedsheets</Link></li>
              <li><Link href="/collections/furniture" className="text-muted-foreground hover:text-primary">Furniture</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-lg font-semibold">Help & Support</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Contact Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">About Us</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">FAQs</Link></li>
              <li><Link href="#" className="text-muted-foreground hover:text-primary">Shipping & Returns</Link></li>
              <li><Link href="/admin" className="text-muted-foreground hover:text-primary">Admin Panel</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-headline text-lg font-semibold">Newsletter</h3>
            <p className="mt-4 text-sm text-muted-foreground">Subscribe to get the latest deals and updates.</p>
            <form className="mt-4 flex gap-2">
              <Input type="email" placeholder="Your email" className="bg-background" />
              <Button type="submit" variant="default">Subscribe</Button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Your Shop. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-muted-foreground">We accept all major credit cards.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
