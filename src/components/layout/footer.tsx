import { Home, LayoutGrid, ShoppingCart, ArrowUp } from 'lucide-react';
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
          <div className="relative">
             <Button variant="ghost" className="flex flex-col h-auto items-center gap-1 absolute bottom-0 left-1/2 -translate-x-1/2  w-20 h-20 rounded-full bg-background justify-center border-2 border-primary shadow-lg">
                <ArrowUp className="h-8 w-8 text-primary" />
             </Button>
          </div>
          <Button variant="ghost" className="flex flex-col h-auto items-center gap-1">
            <ShoppingCart className="h-6 w-6" />
            <span className="text-xs">Cart</span>
          </Button>
           <Button variant="ghost" className="flex flex-col h-auto items-center gap-1">
            Chat
          </Button>
        </div>
      </div>
    </footer>
  );
}
