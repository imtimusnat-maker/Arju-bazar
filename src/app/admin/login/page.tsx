'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, useUser, initiateEmailSignIn } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged, AuthError } from 'firebase/auth';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const ADMIN_UID = 'BS1kBWdHZ4cE43xsC36iglVcjL22';

export default function AdminLoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [authError, setAuthError] = useState<string | null>(null);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (isUserLoading) {
      return; 
    }

    if (user) {
      if (user.uid === ADMIN_UID) {
        router.replace('/admin/dashboard');
      } else {
        // This case is handled in the layout, but as a fallback:
        router.replace('/');
      }
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        // This listener is mainly for catching auth errors
    }, (error: AuthError) => {
        let message = 'An unknown authentication error occurred.';
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                message = 'Invalid email or password. Please try again.';
                break;
            case 'auth/invalid-email':
                message = 'The email address is not valid.';
                break;
            default:
                message = `Login failed: ${error.message}`;
                break;
        }
        setAuthError(message);
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: message,
        });
    });

    return () => unsubscribe();
  }, [auth, toast]);

  const onSubmit: SubmitHandler<LoginFormData> = (data) => {
    setAuthError(null); // Reset error on new submission
    initiateEmailSignIn(auth, data.email, data.password);
  };
  
  if (isUserLoading || user) {
    return <p>Loading...</p>;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4">
          <Logo />
        </div>
        <CardTitle>Admin Panel</CardTitle>
        <CardDescription>Sign in to access the dashboard</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="admin@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {authError && (
              <p className="text-sm font-medium text-destructive">{authError}</p>
            )}

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              Sign In
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
