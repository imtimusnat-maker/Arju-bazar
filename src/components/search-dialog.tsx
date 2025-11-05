'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Folder, FolderOpen, Loader2 } from 'lucide-react';
import { useFirestore } from '@/firebase';
import { collection, query, limit, orderBy, startAt, endAt, getDocs, type Query } from 'firebase/firestore';
import { useDebounce } from '@/hooks/use-debounce';
import type { Product } from '@/lib/products';
import type { Category, Subcategory } from '@/lib/categories';

interface SearchDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const VisuallyHidden = ({ children }: { children: React.ReactNode }) => (
    <div style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: '0',
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: '0',
    }}>
        {children}
    </div>
);

type SearchResults = {
    products: Product[];
    categories: Category[];
    subcategories: Subcategory[];
}

export function SearchDialog({ isOpen, onOpenChange }: SearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResults>({ products: [], categories: [], subcategories: [] });
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const firestore = useFirestore();

  const performSearch = useCallback(async (searchKey: string) => {
    if (!firestore || !searchKey) {
        setResults({ products: [], categories: [], subcategories: [] });
        setIsLoading(false);
        return;
    }
    setIsLoading(true);

    const endMarker = searchKey + '\uf8ff';

    const productsQuery = query(
      collection(firestore, 'products'),
      orderBy('searchKeywords'),
      startAt(searchKey),
      endAt(endMarker),
      limit(5)
    ) as Query<Product>;

    const categoriesQuery = query(
      collection(firestore, 'categories'),
      orderBy('searchKeywords'),
      startAt(searchKey),
      endAt(endMarker),
      limit(3)
    ) as Query<Category>;

    const subcategoriesQuery = query(
      collection(firestore, 'subcategories'),
      orderBy('searchKeywords'),
      startAt(searchKey),
      endAt(endMarker),
      limit(4)
    ) as Query<Subcategory>;

    try {
        const [productSnap, categorySnap, subcategorySnap] = await Promise.all([
            getDocs(productsQuery),
            getDocs(categoriesQuery),
            getDocs(subcategoriesQuery),
        ]);

        const products = productSnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        const categories = categorySnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        const subcategories = subcategorySnap.docs.map(doc => ({ ...doc.data(), id: doc.id }));

        setResults({ products, categories, subcategories });
    } catch (error) {
        console.error("Error performing search:", error);
        setResults({ products: [], categories: [], subcategories: [] });
    } finally {
        setIsLoading(false);
    }
  }, [firestore]);


  useEffect(() => {
    const searchKey = debouncedSearchTerm.toLowerCase().replace(/\s+/g, '');
    if (searchKey) {
      performSearch(searchKey);
    } else {
      setResults({ products: [], categories: [], subcategories: [] });
      setIsLoading(false);
    }
  }, [debouncedSearchTerm, performSearch]);
  
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setResults({ products: [], categories: [], subcategories: [] });
    }
  }, [isOpen]);

  const handleLinkClick = () => {
    onOpenChange(false);
  }

  const hasResults = results.products.length > 0 || results.categories.length > 0 || results.subcategories.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden">
        <VisuallyHidden>
            <DialogTitle>Search</DialogTitle>
        </VisuallyHidden>
        <div className="flex items-center border-b px-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for products, categories..."
            className="h-12 w-full border-0 shadow-none focus-visible:ring-0"
            autoFocus
          />
        </div>
        <div className="overflow-y-auto max-h-[70vh] p-4">
          {isLoading && (
            <div className="flex justify-center items-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {!isLoading && debouncedSearchTerm && !hasResults && (
            <p className="text-center text-sm text-muted-foreground">No results found for "{debouncedSearchTerm}"</p>
          )}

          {!isLoading && hasResults && (
            <div className="space-y-6">
                {results.products.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 px-2">Products</h3>
                    <div className="flex flex-col gap-1">
                    {results.products.map((product) => (
                        <Link href={`/product/${product.slug}`} key={product.id} passHref onClick={handleLinkClick}>
                        <div className="flex items-center gap-4 rounded-md p-2 hover:bg-accent cursor-pointer">
                            <Image
                            src={product.imageCdnUrl || 'https://placehold.co/400'}
                            alt={product.name}
                            width={40}
                            height={40}
                            className="rounded-md object-contain border bg-white"
                            />
                            <div className="flex-1">
                            <p className="text-sm font-medium">{product.name}</p>
                            <p className="text-sm text-primary">Tk {product.price.toFixed(2)}</p>
                            </div>
                        </div>
                        </Link>
                    ))}
                    </div>
                </div>
                )}

                {results.categories.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 px-2">Categories</h3>
                    <div className="flex flex-col gap-1">
                    {results.categories.map((category) => (
                        <Link href={`/collections/${category.slug}`} key={category.id} passHref onClick={handleLinkClick}>
                        <div className="flex items-center gap-4 rounded-md p-2 hover:bg-accent cursor-pointer">
                            <Folder className="h-5 w-5 text-muted-foreground" />
                            <p className="text-sm font-medium flex-1">{category.name}</p>
                        </div>
                        </Link>
                    ))}
                    </div>
                </div>
                )}
                
                {results.subcategories.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 px-2">Subcategories</h3>
                    <div className="flex flex-col gap-1">
                    {results.subcategories.map((subcategory) => (
                        <Link href={`/collections/${subcategory.categorySlug}/${subcategory.slug}`} key={subcategory.id} passHref onClick={handleLinkClick}>
                        <div className="flex items-center gap-4 rounded-md p-2 hover:bg-accent cursor-pointer">
                            <FolderOpen className="h-5 w-5 text-muted-foreground" />
                            <p className="text-sm font-medium flex-1">{subcategory.name}</p>
                        </div>
                        </Link>
                    ))}
                    </div>
                </div>
                )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
