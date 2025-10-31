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
import { doc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import type { Settings } from '@/lib/settings';

const settingsSchema = z.object({
  whatsappNumber: z.string().min(1, 'WhatsApp number is required'),
  messengerLink: z.string().url('Must be a valid URL'),
  hotlineNumber: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const SETTINGS_DOC_ID = 'global';

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
    },
  });

  useEffect(() => {
    if (settingsData) {
      form.reset(settingsData);
    }
  }, [settingsData, form]);

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
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            Update your shop's contact details. This will be reflected on the website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? <p>Loading settings...</p> : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-lg">
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
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Save Settings
              </Button>
            </form>
          </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
