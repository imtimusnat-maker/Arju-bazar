import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart } from 'lucide-react';
import type { ImagePlaceholder } from '@/lib/placeholder-images';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    originalPrice?: number;
    image: ImagePlaceholder;
    slug: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <Link href={`/product/${product.slug}`} className="block">
        <CardContent className="p-0">
          <div className="relative aspect-[3/4]">
            <Image
              src={product.image.imageUrl}
              alt={product.image.description}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
              data-ai-hint={product.image.imageHint}
            />
            {discount > 0 && (
              <Badge variant="destructive" className="absolute top-3 left-3">
                {discount}% OFF
              </Badge>
            )}
          </div>
          <div className="p-4 space-y-2">
            <h3 className="font-headline text-lg leading-tight truncate">{product.name}</h3>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-bold text-primary">${product.price.toFixed(2)}</p>
              {product.originalPrice && (
                <p className="text-sm text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Link>
      <div className="border-t p-4">
        <Button className="w-full">
          <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
        </Button>
      </div>
    </Card>
  );
}
