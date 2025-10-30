import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Admin Panel</CardTitle>
          <CardDescription>
            This is the placeholder for the admin panel. Manage your products, orders, and users from here.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>The admin dashboard and management features will be implemented here.</p>
          <Button asChild variant="outline">
            <Link href="/">Go Back to Shop</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
