'use client';

import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/'); // Redirect to homepage after sign out
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };
  
  if (isUserLoading) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <Header />
            <main className="flex-1 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin" />
            </main>
            <Footer />
        </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="container mx-auto max-w-md">
            {user && !user.isAnonymous ? (
                // Logged-in user view
                <Card>
                    <CardHeader>
                        <CardTitle>My Account</CardTitle>
                        <CardDescription>View your account details and order history.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">Email</p>
                            <p>{user.email}</p>
                        </div>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium text-muted-foreground">User ID</p>
                            <p className="text-xs break-all">{user.uid}</p>
                        </div>
                        <Button asChild variant="outline" className="w-full">
                          <Link href="/account/orders">
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            My Orders
                          </Link>
                        </Button>
                    </CardContent>
                    <CardFooter>
                        <Button variant="destructive" onClick={handleSignOut}>Sign Out</Button>
                    </CardFooter>
                </Card>
            ) : (
                // Guest user view
                <Card className="text-center">
                     <CardHeader>
                        <CardTitle>Join Us</CardTitle>
                        <CardDescription>Create an account to manage your orders and view your profile.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <Button asChild size="lg">
                            <Link href="/login">Login</Link>
                        </Button>
                        <Button asChild variant="outline" size="lg">
                             <Link href="/signup">Sign Up</Link>
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
