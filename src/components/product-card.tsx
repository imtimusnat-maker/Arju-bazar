'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/context/cart-context';
import type { Product } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/use-translation';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const displayName = useTranslation(product.name);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
    });
  };
  
  const showDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-md border border-gray-200 rounded-lg">
      <Link href={`/product/${product.slug}`} className="block">
        <CardContent className="p-0">
          <div className="relative aspect-square bg-gray-100 flex items-center justify-center border-b border-gray-200">
            <Image
              src={product.imageCdnUrl || 'https://placehold.co/400'}
              alt={product.name}
              width={200}
              height={200}
              className="object-contain h-full w-full p-4"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </div>
          <div className="p-4 text-center space-y-2">
            <h3 className="font-body text-sm leading-tight truncate h-10">{displayName}</h3>
            <div className="flex items-baseline justify-center gap-2">
              <p className="text-base font-bold text-foreground">Tk {product.price.toFixed(2)}</p>
              {showDiscount && (
                <p className="text-sm text-muted-foreground line-through">Tk {product.originalPrice?.toFixed(2)}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
      <div className="px-4 pb-4">
        <Button onClick={handleAddToCart} className="w-full bg-primary text-primary-foreground h-9 rounded-md text-sm font-semibold">
          Quick Add
        </Button>
      </div>
    </Card>
  );
}
