'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import type { Product } from '@/lib/products';
import { User, Phone, MapPin, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface CheckoutSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  product: Product;
}

const shippingOptions = [
  { id: 'dhaka', label: 'ঢাকা সিটির ভিতরে', price: 70 },
  { id: 'chittagong', label: 'চট্টগ্রাম সিটির ভিতরে', price: 70 },
  { id: 'outside', label: 'ঢাকা এবং চট্টগ্রাম সিটির বাহিরে', price: 130 },
];

export function CheckoutSheet({ isOpen, onOpenChange, product }: CheckoutSheetProps) {
    const [shippingCost, setShippingCost] = useState(shippingOptions[0].price);
    const subtotal = product.price;
    const total = subtotal + shippingCost;


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[95vh] rounded-t-lg flex flex-col p-0"
      >
        <SheetHeader className="p-4 border-b text-left">
          <SheetTitle className="text-base font-semibold">
            ক্যাশ অন ডেলিভারিতে অর্ডার করতে আপনার তথ্য দিন
          </SheetTitle>
          <SheetClose className="absolute right-4 top-4">
             <X className="h-5 w-5" />
          </SheetClose>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="name" className="text-sm font-medium">আপনার নাম*</Label>
                    <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input id="name" placeholder="আপনার নাম" className="pl-10" />
                    </div>
                </div>
                 <div>
                    <Label htmlFor="phone" className="text-sm font-medium">ফোন নাম্বার*</Label>
                    <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input id="phone" type="tel" placeholder="ফোন নাম্বার" className="pl-10" />
                    </div>
                </div>
                 <div>
                    <Label htmlFor="address" className="text-sm font-medium">এড্রেস*</Label>
                    <div className="relative mt-1">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <Input id="address" placeholder="এড্রেস" className="pl-10" />
                    </div>
                </div>
            </div>

            <div>
                <Label className="text-sm font-medium">শিপিং মেথড</Label>
                <RadioGroup defaultValue={shippingOptions[0].id} className="mt-2 space-y-2" onValueChange={(value) => {
                    const option = shippingOptions.find(o => o.id === value);
                    if(option) setShippingCost(option.price);
                }}>
                    {shippingOptions.map((option) => (
                        <Label key={option.id} htmlFor={option.id} className="flex items-center justify-between p-3 border rounded-md cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                            <div className="flex items-center">
                                <RadioGroupItem value={option.id} id={option.id} />
                                <span className="ml-3 font-medium">{option.label}</span>
                            </div>
                            <span className="font-semibold">Tk {option.price.toFixed(2)}</span>
                        </Label>
                    ))}
                </RadioGroup>
            </div>

            <div className="flex gap-2">
                <Input placeholder="কুপন কোড" />
                <Button variant="outline" className="shrink-0 border-primary text-primary hover:bg-primary hover:text-primary-foreground">এপ্লাই</Button>
            </div>

            <div className="bg-gray-50 p-4 rounded-md space-y-3">
                 <div className="flex items-center gap-3">
                    <div className="relative h-14 w-14 rounded-md overflow-hidden border">
                         <Image src={product.image.imageUrl} alt={product.image.description} fill className="object-contain" />
                    </div>
                    <p className="flex-1 font-medium">{product.name}</p>
                    <p className="font-semibold">Tk {product.price.toFixed(2)}</p>
                 </div>
                 <Separator />
                 <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span>সাব টোটাল</span>
                        <span className="font-semibold">Tk {subtotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>ডেলিভারি চার্জ</span>
                        <span className="font-semibold">Tk {shippingCost.toFixed(2)}</span>
                    </div>
                     <Separator />
                     <div className="flex justify-between font-bold text-base">
                        <span>সর্বমোট</span>
                        <span>Tk {total.toFixed(2)}</span>
                    </div>
                 </div>
            </div>

             <div>
                <Label htmlFor="order-note" className="text-sm font-medium">Order note</Label>
                <Textarea id="order-note" placeholder="Order note" className="mt-1" />
            </div>

        </div>
        <div className="p-4 border-t bg-white">
            <Button className="w-full h-12 text-lg">আপনার অর্ডার কনফার্ম করতে ক্লিক করুন</Button>
            <p className="text-xs text-center text-gray-500 mt-2">উপরের বাটনে ক্লিক করলে আপনার অর্ডারটি সাথে সাথে কনফার্ম হয়ে যাবে !</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
