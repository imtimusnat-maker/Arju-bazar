'use client';

import { notFound } from 'next/navigation';
import Image from 'next/image';
import { products } from '@/lib/products';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { CreditCard, ShoppingCart } from 'lucide-react';
import { ProductCard } from '@/components/product-card';

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M20.52 3.48A11.92 11.92 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.56 4.18 1.63 5.99L0 24l6.21-1.61A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-1.98-.45-3.85-1.48-5.52zM12 21.5c-1.5 0-2.97-.39-4.26-1.14l-.31-.17-3.68.95.98-3.59-.2-.33A9.5 9.5 0 1 1 21.5 12 9.51 9.51 0 0 1 12 21.5z" />
    <path fill="#fff" d="M17.03 14.18c-.28-.14-1.66-.82-1.92-.91-.26-.09-.45-.14-.64.14-.2.28-.75.91-.92 1.1-.17.19-.34.21-.62.07-.28-.14-1.16-.43-2.21-1.36-.82-.72-1.37-1.61-1.53-1.89-.16-.29-.02-.45.12-.59.12-.12.28-.31.42-.47.14-.16.19-.28.29-.47.1-.19.05-.36-.02-.5-.07-.14-.64-1.54-.88-2.11-.23-.56-.47-.48-.64-.49-.17-.01-.37-.01-.57-.01-.19 0-.5.07-.77.36-.28.29-1.06 1.03-1.06 2.51 0 1.47 1.09 2.9 1.24 3.1.14.2 2.14 3.35 5.19 4.69 3.06 1.34 3.06.89 3.62.84.56-.06 1.83-.74 2.09-1.46.26-.72.26-1.34.18-1.46-.08-.12-.29-.19-.57-.33z" />
  </svg>
);

const MessengerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
        <path d="M12 0C5.37 0 0 4.92 0 11c0 2.92 1.13 5.6 2.98 7.64L2 24l5.55-2.98A11.93 11.93 0 0 0 12 24c6.63 0 12-4.92 12-11S18.63 0 12 0z" />
        <path fill="#fff" d="m6.5 13.6 2.8-6.4 4.2 5.2 2.9-6.6-9.9 7.8z" />
  </svg>
);


export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  const { image } = product;

  // Filter out the current product and take the first 4 for suggestions
  const suggestedProducts = products.filter(p => p.id !== product.id).slice(0, 5);


  return (
    <div className="flex min-h-screen flex-col bg-background pb-20 md:pb-0">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-lg">
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="relative w-full aspect-square border-b">
              {image && (
                 <Image
                    src={image.imageUrl}
                    alt={image.description}
                    fill
                    className="object-contain p-4"
                    data-ai-hint={image.imageHint}
                />
              )}
            </div>
            <div className="p-4">
              <h1 className="text-xl font-bold mb-2">{product.name}</h1>
              <p className="text-lg font-bold text-primary mb-6">Tk {product.price.toFixed(2)}</p>

              <div className="space-y-3">
                 <Button className="w-full h-12 bg-black text-white hover:bg-gray-800 text-lg">
                  Add to cart
                </Button>
                <Button className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90 text-lg">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  ক্যাশ অন ডেলিভারিতে অর্ডার করুন
                </Button>
                <Button className="w-full h-12 bg-yellow-400 text-black hover:bg-yellow-500 text-lg">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay Online
                </Button>
                <Button className="w-full h-12 bg-[#0084FF] text-white hover:bg-[#0072ff] text-lg">
                    <MessengerIcon className="mr-2 h-6 w-6" />
                    Chat with us
                </Button>
                 <Button className="w-full h-12 bg-[#25D366] text-white hover:bg-[#1ebe57] text-lg">
                    <WhatsAppIcon className="mr-2 h-6 w-6" />
                    WhatsApp Us
                </Button>
              </div>

              <Accordion type="single" collapsible className="w-full mt-8">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-semibold">Description</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground pt-2">
                    <div className="prose max-w-none">
                      <p>
                        বহুকাল যাবত আয়ুর্বেদিক চিকিৎসায় অশ্বগন্ধা ব্যবহৃত হচ্ছে
                        মানসিক চাপ, ক্লান্তি, ঘুমের সমস্যা ও বিভিন্ন রোগ প্রতিরোধে।
                        যত্নসহকারে তৈরি হওয়ায় স্বাদ মাটির ঘ্রাণে ভরপুর ও স্বাস্থ্যকর দ্রব্য
                        হিসেবে পরিচিত; গরম/ঠান্ডা দুধ বা খুদি বা পানি কিংবা হালকা
                        খাবারের সঙ্গে মিশিয়ে সহজেই গ্রহীত।
                      </p>
                      <h4 className="font-bold mt-4">অশ্বগন্ধার স্বাস্থ্য উপকারিতা:</h4>
                      <ul>
                        <li>মানসিক চাপ কমাতে এবং মানসিক সুস্থতায় সহায়তা করে; স্বীকৃত গবেষণায় ইতিবাচক ফলাফল প্রদর্শন করেছে।</li>
                        <li>ঘুম ও বিশ্রামের মান উন্নত করে, ইনসমনিয়া ও সাধারণ ক্লান্তিতে কার্যকর।</li>
                        <li>দেহের শক্তি ও কর্মদক্ষতা বৃদ্ধিতে সহায়তা করে, যা স্ট্যামিনা ও রিকভারি বাড়ায়।</li>
                      </ul>
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
            {suggestedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
