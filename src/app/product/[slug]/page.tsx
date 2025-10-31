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
import { CreditCard, MessageCircle, ShoppingCart } from 'lucide-react';

// WhatsApp and Messenger icons as inline SVGs for styling flexibility
const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
        <path
        d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.46-1.207-1.39-1.39-1.39a.571.571 0 0 0-.49-.275c-.315 0-1.08.16-1.38.39-1.01.775-1.213 2.13-1.213 3.343 0 1.212.77 2.275 1.49 2.92.51.51 1.77 1.49 3.25 1.49 1.95 0 3.23-1.74 3.23-1.74s.2-.51.2-.51a.571.571 0 0 0-.49-.57z"
        fill="#fff"
        />
        <path
        d="M26.56 25.319c-1.82-1.256-3.64-2.51-5.46-3.766-1.82-1.254-3.64-2.508-5.46-3.762-1.82-1.254-2.88-2.022-3.34-2.383-1.137-.9-2.27-2.45-2.27-4.282 0-1.777 1.02-3.387 2.67-4.35-1.017-1.307-1.017-2.843 0-4.15 1.138-1.46 3.12-2.31 5.24-2.31 1.93 0 3.81.69 5.24 2.31 1.01 1.31 1.01 2.84 0 4.15-1.65 1.01-2.67 2.63-2.67 4.35 0 1.77 1.13 3.32 2.27 4.28.46.36 1.52 1.13 3.34 2.38 1.82 1.26 3.64 2.51 5.46 3.77 1.82 1.25 3.64 2.51 5.46 3.76"
        fill="#00e676"
        transform="matrix(.08 0 0 .08 15 15)"
        />
  </svg>
);

const MessengerIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
        <path
        d="M16 4.438c-6.398 0-11.562 4.336-11.562 9.688 0 3.375 2.016 6.336 4.96 7.968v4.46L13.837 24a13.98 13.98 0 0 0 2.163.188c6.398 0 11.562-4.336 11.562-9.688S22.398 4.438 16 4.438z"
        fill="url(#a)"
        />
        <path
        d="m10.19 14.28 3.06-3.098 5.43 3.107 4.01-3.107-3.06 3.098-5.43-3.107z"
        fill="#fff"
        />
        <defs>
        <linearGradient
            id="a"
            x1="4.438"
            x2="27.562"
            y1="4.438"
            y2="27.562"
            gradientUnits="userSpaceOnUse"
        >
            <stop stopColor="#00c6ff" offset="0" />
            <stop stopColor="#0072ff" offset="1" />
        </linearGradient>
        </defs>
    </svg>
);


export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = products.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  const { image } = product;

  return (
    <div className="flex min-h-screen flex-col bg-background">
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
                <Button className="w-full h-12 bg-black text-white hover:bg-gray-800 text-lg">
                    <MessengerIcon className="mr-2 h-6 w-6" />
                    Chat with us
                </Button>
                 <Button className="w-full h-12 bg-black text-white hover:bg-gray-800 text-lg">
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
      </main>
      <Footer />
    </div>
  );
}
