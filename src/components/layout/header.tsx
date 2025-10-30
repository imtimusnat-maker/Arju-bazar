import Link from 'next/link';
import { Search, ShoppingCart, User, Heart, Menu, Phone, Mail } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';

const categories = [
  { name: 'Men Collections', href: '/collections/men' },
  { name: 'Women Collection', href: '/collections/women' },
  { name: 'Kids Collections', href: '/collections/kids' },
  { name: '3D Waterproof Bedsheet', href: '/collections/bedsheets' },
  { name: 'Furniture Collection', href: '/collections/furniture' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto flex h-10 max-w-screen-2xl items-center justify-between px-4 text-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>+880 123 456 789</span>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>support@yourshop.com</span>
            </div>
          </div>
          <div>
            <Link href="/track-order" className="hover:underline">Track Your Order</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto flex h-20 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center">
          <div className="md:hidden mr-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 sm:w-80">
                <nav className="flex flex-col space-y-6 pt-8">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      {category.name}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <div className="hidden md:block">
            <Logo />
          </div>
        </div>
        
        <div className="md:hidden">
          <Logo />
        </div>

        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <div className="hidden sm:block w-full max-w-md">
            <form>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search for products..."
                  className="h-12 w-full rounded-full border-2 border-primary/50 bg-background pl-12 pr-4 text-base focus:border-primary"
                />
              </div>
            </form>
          </div>
          
          <nav className="flex items-center space-x-1 md:space-x-2">
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <Heart className="h-6 w-6" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">3</Badge>
              <span className="sr-only">Wishlist</span>
            </Button>
            <Button variant="ghost" size="icon" className="relative rounded-full">
              <ShoppingCart className="h-6 w-6" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center p-0">2</Badge>
              <span className="sr-only">Cart</span>
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <User className="h-6 w-6" />
              <span className="sr-only">Account</span>
            </Button>
          </nav>
        </div>
      </div>
      
      {/* Search bar for small screens */}
      <div className="sm:hidden border-t px-4 pb-4">
        <form>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search for products..."
              className="h-12 w-full rounded-full border-2 border-primary/50 bg-background pl-12 pr-4 text-base focus:border-primary"
            />
          </div>
        </form>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex h-14 items-center justify-center border-t bg-card shadow-sm">
        <nav className="container max-w-screen-xl">
          <ul className="flex items-center justify-center space-x-8">
            {categories.map((category) => (
              <li key={category.name}>
                <Link href={category.href} className="font-semibold text-lg text-foreground hover:text-primary transition-colors duration-300">
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
