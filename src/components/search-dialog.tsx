'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Search, Folder, FolderOpen } from 'lucide-react';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, limit, orderBy, startAt, endAt } from 'firebase/firestore';
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


export function SearchDialog({ isOpen, onOpenChange }: SearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const firestore = useFirestore();

  const searchKey = debouncedSearchTerm.toLowerCase().replace(/\s+/g, '');
  const endMarker = searchKey + '\uf8ff';

  const productsQuery = useMemo(() => {
    if (!firestore || !searchKey) return null;
    return query(
      collection(firestore, 'products'),
      orderBy('searchKeywords'),
      startAt(searchKey),
      endAt(endMarker),
      limit(5)
    );
  }, [firestore, searchKey, endMarker]);

  const categoriesQuery = useMemo(() => {
    if (!firestore || !searchKey) return null;
    return query(
      collection(firestore, 'categories'),
      orderBy('searchKeywords'),
      startAt(searchKey),
      endAt(endMarker),
      limit(3)
    );
  }, [firestore, searchKey, endMarker]);

  const subcategoriesQuery = useMemo(() => {
    if (!firestore || !searchKey) return null;
    return query(
      collection(firestore, 'subcategories'),
      orderBy('searchKeywords'),
      startAt(searchKey),
      endAt(endMarker),
      limit(4)
    );
  }, [firestore, searchKey, endMarker]);

  const { data: products, isLoading: productsLoading } = useCollection<Product>(productsQuery);
  const { data: categories, isLoading: categoriesLoading } = useCollection<Category>(categoriesQuery);
  const { data: subcategories, isLoading: subcategoriesLoading } = useCollection<Subcategory>(subcategoriesQuery);
  
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleLinkClick = () => {
    onOpenChange(false);
  }

  const isLoading = productsLoading || categoriesLoading || subcategoriesLoading;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 gap-0 overflow-hidden">
        <DialogHeader>
           <VisuallyHidden>
            <DialogTitle>Search</DialogTitle>
           </VisuallyHidden>
        </DialogHeader>
        <div className="flex items-center border-b px-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for products, categories..."
            className="h-12 w-full border-0 shadow-none focus-visible:ring-0"
          />
        </div>
        <div className="overflow-y-auto max-h-[70vh] p-4">
          {isLoading && <p className="text-center text-sm text-muted-foreground">Searching...</p>}
          {!isLoading && debouncedSearchTerm && (!products?.length && !categories?.length && !subcategories?.length) && (
            <p className="text-center text-sm text-muted-foreground">No results found for "{debouncedSearchTerm}"</p>
          )}

          {products && products.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 px-2">Products</h3>
              <div className="flex flex-col gap-1">
                {products.map((product) => (
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

          {categories && categories.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 px-2">Categories</h3>
              <div className="flex flex-col gap-1">
                {categories.map((category) => (
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
          
          {subcategories && subcategories.length > 0 && (
            <div >
              <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 px-2">Subcategories</h3>
              <div className="flex flex-col gap-1">
                {subcategories.map((subcategory) => (
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
      </DialogContent>
    </Dialog>
  );
}