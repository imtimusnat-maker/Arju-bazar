import { Home, LayoutGrid, ShoppingCart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <div className="container mx-auto max-w-screen-xl px-4">
        <div className="flex justify-around items-center h-16">
          <Button variant="ghost" className="flex flex-col h-auto items-center gap-1">
            <Home className="h-6 w-6" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" className="flex flex-col h-auto items-center gap-1">
            <LayoutGrid className="h-6 w-6" />
            <span className="text-xs">Categories</span>
          </Button>
          <Button variant="ghost" className="flex flex-col h-auto items-center gap-1 relative">
            <ShoppingCart className="h-6 w-6" />
            <span className="text-xs">Cart</span>
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center -translate-y-1/2 translate-x-1/2">0</div>
          </Button>
           <Button variant="ghost" className="flex flex-col h-auto items-center gap-1">
            <Search className="h-6 w-6" />
            <span className="text-xs">Search</span>
          </Button>
        </div>
      </div>
    </footer>
  );
}
