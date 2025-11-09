'use client';

import { useState, useMemo } from 'react';
import { notFound, useParams } from 'next/navigation';
import Image from 'next/image';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, where, limit } from 'firebase/firestore';
import type { Product } from '@/lib/products';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CreditCard, ShoppingCart, Loader2 } from 'lucide-react';
import { ProductCard } from '@/components/product-card';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';
import { CheckoutSheet } from '@/components/checkout-sheet';
import type { Settings } from '@/lib/settings';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { useTranslation } from '@/hooks/use-translation';
import { Skeleton } from '@/components/ui/skeleton';


const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M20.52 3.48A11.92 11.92 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.56 4.18 1.63 5.99L0 24l6.21-1.61A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-1.98-.45-3.85-1.48-5.52zM12 21.5c-1.5 0-2.97-.39-4.26-1.14l-.31-.17-3.68.95.98-3.59-.2-.33A9.5 9.5 0 1 1 21.5 12 9.51 9.51 0 0 1 12 21.5z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M17.03 14.18c-.28-.14-1.66-.82-1.92-.91-.26-.09-.45-.14-.64.14-.2.28-.75.91-.92 1.1-.17.19-.34.21-.62.07-.28-.14-1.16-.43-2.21-1.36-.82-.72-1.37-1.61-1.53-1.89-.16-.29-.02-.45.12-.59.12-.12.28-.31.42-.47.14-.16.19-.28.29-.47.1-.19.05-.36-.02-.5-.07-.14-.64-1.54-.88-2.11-.23-.56-.47-.48-.64-.49-.17-.01-.37-.01-.57-.01-.19 0-.5.07-.77.36-.28.29-1.06 1.03-1.06 2.51 0 1.47 1.09 2.9 1.24 3.1.14.2 2.14 3.35 5.19 4.69 3.06 1.34 3.06.89 3.62.84.56-.06 1.83-.74 2.09-1.46.26-.72.26-1.34.18-1.46-.08-.12-.29-.19-.57-.33z" />
    </svg>
  );
  
  const MessengerIcon = (props: React.SVGProps<SVGSVGElement>) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        {...props}
      >
          <path d="M12 0C5.37 0 0 4.92 0 11c0 2.92 1.13 5.6 2.98 7.64L2 24l5.55-2.98A11.93 11.93 0 0 0 12 24c6.63 0 12-4.92 12-11S18.63 0 12 0z" fill="#0084FF"/>
          <path d="m6.5 13.6 2.8-6.4 4.2 5.2 2.9-6.6-9.9 7.8z" fill="white"/>
    </svg>
  );

const ProductPageSkeleton = () => (
    <div className="container mx-auto max-w-lg">
        <div className="bg-white rounded-lg overflow-hidden">
            <Skeleton className="relative w-full aspect-square border-b" />
            <div className="p-4 space-y-4">
                <Skeleton className="h-7 w-3/4" />
                <Skeleton className="h-6 w-1/4" />
                <div className="space-y-3 pt-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                </div>
            </div>
        </div>
    </div>
);


export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const firestore = useFirestore();

  const productQuery = useMemoFirebase(() => {
    if (!firestore || !params.slug) return null;
    return query(collection(firestore, 'products'), where('slug', '==', params.slug), limit(1));
  }, [firestore, params.slug]);

  const { data: productData, isLoading: isProductLoading } = useCollection<Product>(productQuery);
  const product = productData?.[0];
  
  const displayName = useTranslation(product?.name);
  const displayDescription = useTranslation(product?.description);

  const settingsDocRef = useMemo(
    () => (firestore ? doc(firestore, 'settings', 'global') : null),
    [firestore]
  );
  const { data: settings } = useDoc<Settings>(settingsDocRef);


  const { addToCart } = useCart();
  const { toast } = useToast();
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);

  const suggestedProductsQuery = useMemoFirebase(() => {
    if (!firestore || !product) return null;
    return query(
      collection(firestore, 'products'),
      where('categoryId', '==', product.categoryId),
      where('__name__', '!=', product.id),
      limit(5)
    );
  }, [firestore, product]);

  const { data: suggestedProducts, isLoading: areSuggestionsLoading } = useCollection<Product>(suggestedProductsQuery);

  if (isProductLoading) {
    return (
        <div className="flex min-h-screen flex-col bg-background pb-20 md:pb-0">
            <Header />
            <main className="flex-1 py-8 px-4">
                <ProductPageSkeleton />
            </main>
            <Footer />
      </div>
    );
  }

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleCodOrder = () => {
    setCheckoutOpen(true);
  };

  const whatsAppUrl = settings?.whatsappNumber ? `https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}` : '#';

  const showDiscount = product.originalPrice && product.originalPrice > product.price;

  return (
    <>
      <div key={params.slug} className="flex min-h-screen flex-col bg-background pb-20 md:pb-0">
        <Header />
        <main className="flex-1 py-8 px-4">
          <div className="container mx-auto max-w-lg">
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="relative w-full aspect-square border-b">
                <Image
                      src={product.imageCdnUrl || 'https://placehold.co/400'}
                      alt={product.name}
                      fill
                      className="object-contain p-4"
                  />
              </div>
              <div className="p-4">
                <h1 className="text-xl font-bold mb-2">{displayName}</h1>
                <div className="flex items-baseline gap-2 mb-6">
                    <p className="text-lg font-bold text-primary">Tk {product.price.toFixed(2)}</p>
                    {showDiscount && (
                        <p className="text-base text-muted-foreground line-through">Tk {product.originalPrice?.toFixed(2)}</p>
                    )}
                </div>


                <div className="space-y-3">
                   <Button onClick={handleAddToCart} className="w-full h-12 bg-black text-white hover:bg-gray-800 text-lg">
                    Add to cart
                  </Button>
                  <Button onClick={handleCodOrder} className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-lg">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    ক্যাশ অন ডেলিভারিতে অর্ডার করুন
                  </Button>
                  <Button className="w-full h-12 bg-yellow-400 text-black hover:bg-yellow-500 text-lg">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Pay Online
                  </Button>
                  <>
                    {settings?.messengerLink && (
                        <Button asChild className="w-full h-12 bg-black text-white hover:bg-gray-800 text-lg">
                            <Link href={settings.messengerLink} target="_blank">
                            <MessengerIcon className="mr-2 h-6 w-6" />
                            Chat with us
                            </Link>
                        </Button>
                    )}
                    {settings?.whatsappNumber && (
                        <Button asChild className="w-full h-12 bg-black text-white hover:bg-gray-800 text-lg">
                            <Link href={whatsAppUrl} target="_blank">
                                <WhatsAppIcon className="mr-2 h-6 w-6 fill-[#25D366]" />
                                WhatsApp Us
                            </Link>
                    </Button>
                    )}
                  </>
                </div>

                <Accordion type="single" collapsible className="w-full mt-8">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-lg font-semibold">Description</AccordionTrigger>
                    <AccordionContent className="text-base text-muted-foreground pt-2">
                      <div className="prose max-w-none">
                        <p>{displayDescription}</p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </div>
          </div>

          <div className="container mx-auto max-w-screen-xl px-4 py-8 mt-8">
            <h2 className="text-xl font-bold mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
               {areSuggestionsLoading ? (
                 Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)
                ) : (
                  suggestedProducts?.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))
                )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
      <CheckoutSheet
        isOpen={isCheckoutOpen}
        onOpenChange={setCheckoutOpen}
        product={product}
      />
    </>
  );
}
