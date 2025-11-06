'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useFirestore, useCollection } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { User } from '@/lib/users';
import { Loader2, Search } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

export default function AdminCustomersPage() {
    const firestore = useFirestore();
    const [searchTerm, setSearchTerm] = useState('');

    const customersQuery = useMemo(
        () => (firestore ? query(collection(firestore, 'users'), where('orderCount', '>', 0)) : null),
        [firestore]
    );

    const { data: customers, isLoading } = useCollection<User>(customersQuery);

    const filteredCustomers = useMemo(() => {
        if (!customers) return [];
        const lowercasedTerm = searchTerm.toLowerCase();
        return customers.filter(customer =>
            customer.name.toLowerCase().includes(lowercasedTerm) ||
            (customer.email && customer.email.toLowerCase().includes(lowercasedTerm)) ||
            customer.phone.toLowerCase().includes(lowercasedTerm)
        );
    }, [customers, searchTerm]);

    return (
        <div>
            <div className="flex items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl font-bold">Customers</h1>
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Customers</CardTitle>
                    <CardDescription>View and manage your customer list. Only users who have placed an order are shown here.</CardDescription>
                </CardHeader>
                <CardContent>
                   <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Orders</TableHead>
                                <TableHead className="text-right">Total Spent</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredCustomers && filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer) => (
                                    <TableRow key={customer.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{customer.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>{customer.email}</div>
                                            <div className="text-sm text-muted-foreground">{customer.phone}</div>
                                        </TableCell>
                                        <TableCell>{customer.orderCount || 0}</TableCell>
                                        <TableCell className="text-right">Tk {(customer.totalSpent || 0).toFixed(2)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                   </Table>
                </CardContent>
            </Card>
        </div>
    );
}
