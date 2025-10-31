'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where, limit, orderBy } from 'firebase/firestore';
import { useDebounce } from '@/hooks/use-debounce';
import type { Product } from '@/lib/products';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';

interface SearchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const firestore = useFirestore();

  const productsQuery = useMemoFirebase(() => {
    if (!firestore || !debouncedSearchTerm) return null;
    const lowercasedTerm = debouncedSearchTerm.toLowerCase();
    return query(
      collection(firestore, 'products'),
      where('keywords', 'array-contains', lowercasedTerm),
      limit(10)
    );
  }, [firestore, debouncedSearchTerm]);

  const { data: products, isLoading } = useCollection<Product>(productsQuery);

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchTerm) return;
    router.push(`/search?q=${searchTerm}`);
    onOpenChange(false);
  };
  
  // Need to use an effect to reset state when dialog is closed
  useEffect(() => {
    if (!open) {
      setSearchTerm('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0 gap-0">
        <div className="flex items-center border-b px-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for products..."
              className="w-full h-12 border-0 shadow-none focus-visible:ring-0 text-base"
            />
          </form>
          {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />}
        </div>
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {products && products.length > 0 ? (
            <div className="space-y-4">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-4 group"
                >
                  <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={product.imageCdnUrl || 'https://placehold.co/400'}
                      alt={product.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium group-hover:text-primary">{product.name}</p>
                    <p className="text-sm font-semibold text-primary">Tk {product.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            debouncedSearchTerm && !isLoading && (
              <p className="text-center text-muted-foreground py-8">No products found.</p>
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
