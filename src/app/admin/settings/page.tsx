'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Settings } from '@/lib/settings';
import { IKContext, IKUpload } from 'imagekitio-react';
import Image from 'next/image';
import { Trash2, PlusCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const shippingOptionSchema = z.object({
  id: z.string().optional(), // ID is generated, so optional at first
  label: z.string().min(1, 'Label is required'),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
});

const settingsSchema = z.object({
  whatsappNumber: z.string().min(1, 'WhatsApp number is required'),
  messengerLink: z.string().url('Must be a valid URL'),
  hotlineNumber: z.string().optional(),
  heroImageUrl: z.string().optional(),
  heroImageCdnUrl: z.string().optional(),
  shippingOptions: z.array(shippingOptionSchema).optional(),
  smsGreetingPlaced: z.string().optional(),
  smsGreetingConfirmed: z.string().optional(),
  smsGreetingDelivered: z.string().optional(),
  welcomeMessage: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const SETTINGS_DOC_ID = 'global';

const authenticator = async () => {
    try {
        const response = await fetch('/api/imagekit/auth');
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed with status ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        const { signature, expire, token } = data;
        return { signature, expire, token };
    } catch (error) {
        console.error("Authentication request failed:", error);
        throw new Error("Failed to authenticate with ImageKit.");
    }
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const firestore = useFirestore();

  const settingsDocRef = useMemoFirebase(
    () => (firestore ? doc(firestore, 'settings', SETTINGS_DOC_ID) : null),
    [firestore]
  );
  
  const { data: settingsData, isLoading } = useDoc<Settings>(settingsDocRef);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      whatsappNumber: '',
      messengerLink: '',
      hotlineNumber: '',
      heroImageUrl: '',
      heroImageCdnUrl: '',
      shippingOptions: [],
      smsGreetingPlaced: '',
      smsGreetingConfirmed: '',
      smsGreetingDelivered: '',
      welcomeMessage: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "shippingOptions",
  });

  useEffect(() => {
    if (settingsData) {
      form.reset({
        ...settingsData,
        shippingOptions: settingsData.shippingOptions || [],
        welcomeMessage: settingsData.welcomeMessage || '',
      });
    }
  }, [settingsData, form]);

  const onUploadSuccess = (res: any) => {
    form.setValue('heroImageUrl', res.url);
    form.setValue('heroImageCdnUrl', res.thumbnailUrl.replace('tr:n-media_library_thumbnail', ''));
  };

  const onUploadError = (err: any) => {
    console.error("Upload error", err);
    toast({
      variant: "destructive",
      title: "Upload Failed",
      description: "There was a problem with the image upload. Please try again.",
    });
  };

  const onSubmit: SubmitHandler<SettingsFormData> = (data) => {
    if (!settingsDocRef) return;
    
    const processedData = {
        ...data,
        shippingOptions: data.shippingOptions?.map(option => ({
            ...option,
            id: option.id || `shipping_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        }))
    }

    setDocumentNonBlocking(settingsDocRef, processedData, { merge: true });

    toast({
      title: 'Settings Saved',
      description: 'Your changes have been successfully saved.',
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Shop Settings</h1>
      </div>
       {isLoading ? <p>Loading settings...</p> : (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto pr-2 space-y-8">
                
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome Banner</CardTitle>
                        <CardDescription>
                            Set a welcome message for new visitors. It will appear in a dismissible banner on the homepage. Leave it blank to disable the banner.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                          control={form.control}
                          name="welcomeMessage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Banner Message</FormLabel>
                              <FormControl>
                                <Textarea placeholder="e.g. Welcome to our store! Get 10% off your first order." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                    </CardContent>
                </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    Update your shop's contact details. This will be reflected on the website.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="whatsappNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp Number</FormLabel>
                          <FormControl>
                            <Input placeholder="+8801234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="messengerLink"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook Messenger Link</FormLabel>
                          <FormControl>
                            <Input placeholder="https://m.me/yourpage" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hotlineNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hotline Number</FormLabel>
                          <FormControl>
                            <Input placeholder="09642-XXXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </CardContent>
              </Card>

              <Card>
                 <CardHeader>
                    <CardTitle>Homepage Settings</CardTitle>
                    <CardDescription>
                        Manage the content displayed on your homepage.
                    </CardDescription>
                </CardHeader>
                 <CardContent>
                    <FormItem>
                        <FormLabel>Hero Banner Image</FormLabel>
                        <FormControl>
                        <IKContext
                            publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
                            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                            authenticator={authenticator}
                            >
                        <div className="flex flex-col items-start gap-4">
                            {form.watch('heroImageCdnUrl') && (
                            <div className="relative w-full max-w-md aspect-video rounded-md overflow-hidden border">
                                <Image
                                    src={form.watch('heroImageCdnUrl')!}
                                    alt="Hero Banner preview"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            )}
                            <IKUpload
                            fileName="hero-banner.jpg"
                            onError={onUploadError}
                            onSuccess={onUploadSuccess}
                            useUniqueFileName={true}
                            />
                        </div>
                        </IKContext>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                 </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle>Shipping Methods</CardTitle>
                    <CardDescription>Manage shipping options for checkout.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg">
                            <FormField
                                control={form.control}
                                name={`shippingOptions.${index}.label`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Label</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. ঢাকা সিটির ভিতরে" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`shippingOptions.${index}.price`}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price (Tk)</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="70" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => append({ label: '', price: 0, id: '' })}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Shipping Option
                    </Button>
                </CardContent>
              </Card>
              
               <Card>
                <CardHeader>
                  <CardTitle>SMS Notifications</CardTitle>
                  <CardDescription>
                    Set a custom greeting for each automated SMS. The system will automatically add the status update and invoice link. Use `[customerName]` to personalize the message.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="smsGreetingPlaced"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Greeting for "Order Placed"</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Thank you [customerName]," {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="smsGreetingConfirmed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Greeting for "Order Confirmed"</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Hi [customerName]," {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="smsGreetingDelivered"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Greeting for "Order Delivered"</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Hello [customerName]," {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                </CardContent>
              </Card>
              </div>
              <div className="pt-8">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    Save All Settings
                </Button>
              </div>
            </form>
          </Form>
        )}
    </div>
  );
}
