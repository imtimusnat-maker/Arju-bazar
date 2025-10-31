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

    // If on any admin page except login
    if (pathname !== '/admin/login') {
      if (!user) {
        // Not logged in, redirect to login
        router.replace('/admin/login');
      } else if (user.uid !== ADMIN_UID) {
        // Logged in but not an admin, redirect to homepage
        router.replace('/');
      }
    }
  }, [user, isUserLoading, pathname, router]);

  const handleSignOut = async () => {
    if(auth) {
        await signOut(auth);
    }
    router.push('/admin/login');
  };
  
  // Do not render the layout for the login page itself or while loading
  if (pathname === '/admin/login' || isUserLoading || !user || user.uid !== ADMIN_UID) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            {isUserLoading ? <p>Loading...</p> : children}
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
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-background px-4">
            <SidebarTrigger className="md:hidden" />
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold">Admin Panel</h1>
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
        <main className="p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
