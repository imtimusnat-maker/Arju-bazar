'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Home, ShoppingBag, Folder, LayoutGrid, Users, LogOut, Settings } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { signOut } from 'firebase/auth';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/admin/products', label: 'Products', icon: ShoppingBag },
  { href: '/admin/categories', label: 'Categories', icon: Folder },
  { href: '/admin/orders', label: 'Orders', icon: Home },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

const ADMIN_UID = 'BS1kBWdHZ4cE43xsC36iglVcjL22';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  useEffect(() => {
    if (isUserLoading) {
      return; // Wait until user status is determined
    }

    // If not logged in, redirect to the admin login page.
    if (!user && pathname !== '/admin/login') {
      router.replace('/admin/login');
    }
    // If logged in but NOT an admin, show an "Access Denied" message or similar.
    // Avoid redirecting to '/' to prevent confusion if they followed a direct link.
    else if (user && user.uid !== ADMIN_UID) {
       // The content below will be shown instead of the admin panel.
    }
    // If on the login page but already logged in as admin, redirect to dashboard.
    else if (user && user.uid === ADMIN_UID && pathname === '/admin/login') {
        router.replace('/admin/dashboard');
    }
  }, [user, isUserLoading, pathname, router]);

  const handleSignOut = async () => {
    if(auth) {
        await signOut(auth);
    }
    router.push('/admin/login');
  };
  
  if (isUserLoading) {
     return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <p>Loading...</p>
        </div>
    );
  }

  // If on the login page, render it standalone
  if (pathname === '/admin/login') {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            {user && user.uid === ADMIN_UID ? <p>Redirecting to dashboard...</p> : children}
        </div>
    );
  }
  
  // If the user is not an admin, show access denied instead of the layout
  if (!user || user.uid !== ADMIN_UID) {
     return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center">
            <h1 className="text-2xl font-bold">Access Denied</h1>
            <p className="text-muted-foreground">You do not have permission to view this page.</p>
            <div className="mt-6 flex gap-4">
                 <Button asChild variant="outline">
                    <Link href="/">Back to Shop</Link>
                </Button>
                <Button onClick={handleSignOut}>Sign Out</Button>
            </div>
        </div>
     );
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset className="flex flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <h1 className="text-lg font-semibold hidden md:block">Admin Panel</h1>
            </div>
             <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                    <Link href="/">Back to Shop</Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
