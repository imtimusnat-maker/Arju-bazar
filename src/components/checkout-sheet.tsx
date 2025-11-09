'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import type { Product } from '@/lib/products';
import { User as UserIcon, Phone, MapPin, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo, useEffect } from 'react';
import type { useCart } from '@/context/cart-context';
import { useFirestore, useDoc, useUser, errorEmitter, FirestorePermissionError } from '@/firebase';
import { doc, collection, writeBatch, serverTimestamp, type Timestamp } from 'firebase/firestore';
import type { Settings } from '@/lib/settings';
import type { User } from '@/lib/users';
import { useToast } from '@/hooks/use-toast';
import { useForm, Controller, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLanguage } from '@/context/language-context';
import { sendSms } from '@/lib/sms';
import type { OrderStatus, OrderItem, Invoice } from '@/lib/orders';
import { useCart as useCartContext } from '@/context/cart-context';

const checkoutSchema = z.object({
    name: z.string().min(1, "Name is required"),
    phone: z.string().min(1, "Phone number is required"),
    address: z.string().min(1, "Address is required"),
    orderNote: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

type CartItem = ReturnType<typeof useCartContext>['cart'][0];

interface CheckoutSheetProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  product?: Product;
  cartItems?: CartItem[];
}

export function CheckoutSheet({ isOpen, onOpenChange, product, cartItems }: CheckoutSheetProps) {
    if (!product && !cartItems) {
        throw new Error("CheckoutSheet requires either 'product' or 'cartItems' prop.");
    }
    
    const { user } = useUser();
    const firestore = useFirestore();
    const { toast } = useToast();
    const { clearCart } = useCartContext();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useLanguage();

    const userProfileRef = useMemo(() => {
        if (!firestore || !user || user.isAnonymous) return null;
        return doc(firestore, 'users', user.uid);
    }, [firestore, user]);
    const { data: userProfile } = useDoc<User>(userProfileRef);
    
    const settingsDocRef = useMemo(
        () => (firestore ? doc(firestore, 'settings', 'global') : null),
        [firestore]
    );
    const { data: settings } = useDoc<Settings>(settingsDocRef);
    
    const shippingOptions = settings?.shippingOptions || [];

    const [shippingCost, setShippingCost] = useState(0);
    const [shippingLabel, setShippingLabel] = useState('');

    const { control, handleSubmit, formState: { errors }, reset } = useForm<CheckoutFormData>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: { name: '', phone: '', address: '', orderNote: '' }
    });

    useEffect(() => {
        if (userProfile) {
            reset({
                name: userProfile.name || '',
                phone: userProfile.phone || '',
                address: userProfile.address || '',
            });
        }
    }, [userProfile, reset]);

    useEffect(() => {
        if (shippingOptions.length > 0) {
            setShippingCost(shippingOptions[0].price);
            setShippingLabel(shippingOptions[0].label);
        }
    }, [shippingOptions]);
    
    const subtotal = useMemo(() => {
        if (product) {
            return product.price;
        }
        return cartItems?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;
    }, [product, cartItems]);

    const itemsToDisplay = useMemo(() => {
        if (product) {
            return [{ ...product, quantity: 1 }];
        }
        return cartItems || [];
    }, [product, cartItems]);
    
    const total = subtotal + shippingCost;
    
    const onConfirmOrder: SubmitHandler<CheckoutFormData> = async (data) => {
        if (!firestore || !user) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Cannot place order. Please try again.',
            });
            return;
        }
        setIsSubmitting(true);

        const batch = writeBatch(firestore);
        const newStatus: OrderStatus = 'order placed';
        
        // 1. Create the private order document with a new generated ID
        const orderRef = doc(collection(firestore, `users/${user.uid}/orders`));
        const orderData = {
            id: orderRef.id,
            userId: user.uid,
            orderDate: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: newStatus,
            totalAmount: total,
            customerName: data.name,
            customerPhone: data.phone,
            shippingAddress: data.address,
            shippingMethod: shippingLabel,
            shippingCost: shippingCost,
            orderNote: data.orderNote || '',
            hiddenFromUser: false,
        };
        batch.set(orderRef, orderData);

        const orderItemsCollection = collection(orderRef, 'orderItems');
        const invoiceItems: Omit<OrderItem, 'id' | 'orderId'>[] = [];
        
        itemsToDisplay.forEach(item => {
            const itemRef = doc(orderItemsCollection);
            const orderItemData: OrderItem = {
                id: itemRef.id,
                orderId: orderRef.id,
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
                name: item.name,
                imageCdnUrl: item.imageCdnUrl || '',
            };
            batch.set(itemRef, orderItemData);
            // Prepare item for public invoice
            invoiceItems.push({
                productId: item.id,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                imageCdnUrl: item.imageCdnUrl || ''
            });
        });

        // 2. Create the public invoice document
        const invoiceRef = doc(firestore, 'invoices', orderRef.id);
        const invoiceData: Invoice = {
          id: orderRef.id,
          orderDate: serverTimestamp() as Timestamp, // Cast for type consistency
          status: newStatus,
          totalAmount: total,
          customerName: data.name,
          customerPhone: data.phone,
          shippingAddress: data.address,
          shippingMethod: shippingLabel,
          shippingCost: shippingCost,
          orderNote: data.orderNote || '',
          items: invoiceItems
        };
        batch.set(invoiceRef, invoiceData);

        // Commit the batch and handle errors
        batch.commit()
            .then(() => {
                // Success actions
                if (cartItems) {
                    clearCart();
                }
                
                if (settings) {
                    sendSms({
                        number: data.phone,
                        order: { id: orderRef.id, customerName: data.name },
                        status: newStatus,
                        settings
                    });
                }

                toast({
                    title: 'Order Confirmed!',
                    description: 'Your order has been placed successfully.',
                });
                onOpenChange(false);
            })
            .catch(error => {
                console.error("Error placing order: ", error);
                // Emit contextual error for permission issues
                 errorEmitter.emit(
                    'permission-error',
                    new FirestorePermissionError({
                        path: `users/${user.uid}/orders`,
                        operation: 'write', // A batch is a 'write' operation
                        requestResourceData: { 
                            order: orderData,
                            invoice: invoiceData
                         },
                    })
                );
                
                toast({
                    variant: 'destructive',
                    title: 'Order Failed',
                    description: 'There was a problem placing your order.',
                });
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };


  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="h-[90vh] rounded-t-lg flex flex-col p-0"
      >
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="text-base font-semibold text-center">
            {t('checkout.title')}
          </SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit(onConfirmOrder)} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                <div className="space-y-4">
                    <div>
                        <Label htmlFor="name" className="text-sm font-medium">{t('checkout.form.nameLabel')}*</Label>
                        <div className="relative mt-1">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Controller name="name" control={control} render={({ field }) => <Input {...field} id="name" placeholder={t('checkout.form.namePlaceholder')} className="pl-10" />} />
                        </div>
                        {errors.name && <p className="text-red-500 text-xs mt-1">{t(errors.name.message as string, { ns: 'errors' })}</p>}
                    </div>
                    <div>
                        <Label htmlFor="phone" className="text-sm font-medium">{t('checkout.form.phoneLabel')}*</Label>
                        <div className="relative mt-1">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                             <Controller name="phone" control={control} render={({ field }) => <Input {...field} id="phone" type="tel" placeholder={t('checkout.form.phonePlaceholder')} className="pl-10" />} />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{t(errors.phone.message as string, { ns: 'errors' })}</p>}
                    </div>
                    <div>
                        <Label htmlFor="address" className="text-sm font-medium">{t('checkout.form.addressLabel')}*</Label>
                        <div className="relative mt-1">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Controller name="address" control={control} render={({ field }) => <Input {...field} id="address" placeholder={t('checkout.form.addressPlaceholder')} className="pl-10" />} />
                        </div>
                        {errors.address && <p className="text-red-500 text-xs mt-1">{t(errors.address.message as string, { ns: 'errors' })}</p>}
                    </div>
                </div>

                <div>
                    <Label className="text-sm font-medium">{t('checkout.shippingMethod')}</Label>
                    {shippingOptions.length > 0 ? (
                        <RadioGroup 
                            defaultValue={shippingOptions[0].id} 
                            className="mt-2 space-y-2" 
                            onValueChange={(value) => {
                                const option = shippingOptions.find(o => o.id === value);
                                if(option) {
                                    setShippingCost(option.price);
                                    setShippingLabel(option.label);
                                }
                            }}
                        >
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
                    ) : (
                        <p className="text-sm text-muted-foreground mt-2">{t('checkout.noShippingOptions')}</p>
                    )}
                </div>

                <div className="bg-gray-50 p-4 rounded-md space-y-3">
                    {itemsToDisplay.map((item, index) => (
                        <div key={item.id + index} className="flex items-center gap-3">
                            <div className="relative h-14 w-14 rounded-md overflow-hidden border">
                                <Image src={item.imageCdnUrl || 'https://placehold.co/400'} alt={item.name} fill className="object-contain" />
                            </div>
                            <p className="flex-1 font-medium text-sm">{item.name} <span className="text-muted-foreground">x {item.quantity}</span></p>
                            <p className="font-semibold">Tk {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    ))}
                    <Separator />
                    <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span>{t('checkout.summary.subtotal')}</span>
                            <span className="font-semibold">Tk {subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>{t('checkout.summary.shipping')}</span>
                            <span className="font-semibold">Tk {shippingCost.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-bold text-base">
                            <span>{t('checkout.summary.total')}</span>
                            <span>Tk {total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <Label htmlFor="order-note" className="text-sm font-medium">{t('checkout.form.noteLabel')}</Label>
                    <Controller name="orderNote" control={control} render={({ field }) => <Textarea {...field} id="order-note" placeholder={t('checkout.form.notePlaceholder')} className="mt-1" />} />
                </div>

            </div>
            <div className="p-4 border-t bg-white">
                <Button type="submit" className="w-full h-12 text-lg" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : t('checkout.confirmButton')}
                </Button>
                <p className="text-xs text-center text-gray-500 mt-2">{t('checkout.confirmNote')}</p>
            </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
