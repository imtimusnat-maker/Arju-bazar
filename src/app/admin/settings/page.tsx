'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Settings } from '@/lib/settings';
import { IKContext, IKUpload } from 'imagekitio-react';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';

const settingsSchema = z.object({
  whatsappNumber: z.string().min(1, 'WhatsApp number is required'),
  messengerLink: z.string().url('Must be a valid URL'),
  hotlineNumber: z.string().optional(),
  heroImageUrl: z.string().optional(),
  heroImageCdnUrl: z.string().optional(),
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
    },
  });

  useEffect(() => {
    if (settingsData) {
      form.reset(settingsData);
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
    
    setDocumentNonBlocking(settingsDocRef, data, { merge: true });

    toast({
      title: 'Settings Saved',
      description: 'Your changes have been successfully saved.',
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Shop Settings</h1>
      </div>
       {isLoading ? <p>Loading settings...</p> : (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                            publicKey="public_c4ZeIR2RUTeVp4nR4SoIF3R8f1w="
                            urlEndpoint="https://ik.imagekit.io/yajy2sbsw"
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

              <Button type="submit" disabled={form.formState.isSubmitting}>
                Save All Settings
              </Button>
            </form>
          </Form>
        )}
    </div>
  );
}
