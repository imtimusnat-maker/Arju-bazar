'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, useUser, initiateEmailSignUp } from '@/firebase';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { onAuthStateChanged, AuthError } from 'firebase/auth';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Logo } from '@/components/logo';

const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    if (!isUserLoading && user && !user.isAnonymous) {
      router.replace('/account');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, () => {}, (error: AuthError) => {
        let message = 'An unknown authentication error occurred.';
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'This email is already in use. Please log in instead.';
                break;
            case 'auth/invalid-email':
                message = 'The email address is not valid.';
                break;
            case 'auth/weak-password':
                message = 'The password is too weak. Please use at least 6 characters.';
                break;
            default:
                message = `Sign-up failed: ${error.message}`;
                break;
        }
        toast({
            variant: "destructive",
            title: "Sign-up Failed",
            description: message,
        });
    });

    return () => unsubscribe();
  }, [auth, toast]);

  const onSubmit: SubmitHandler<SignUpFormData> = (data) => {
    initiateEmailSignUp(auth, data.email, data.password);
  };
  
  if (isUserLoading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-md">
            <Card>
            <CardHeader className="text-center">
                <div className="mx-auto mb-4">
                  <Logo />
                </div>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>Join us to start your shopping journey</CardDescription>
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
                            <Input type="email" placeholder="you@example.com" {...field} />
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
                    <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    Create Account
                    </Button>
                </form>
                </Form>
            </CardContent>
            <CardFooter className="text-center text-sm">
                <p>
                    Already have an account?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Log In
                    </Link>
                </p>
            </CardFooter>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
