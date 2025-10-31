import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function AdminCustomersPage() {
  return (
    <div>
        <h1 className="text-2xl font-bold mb-6">Customers</h1>
        <Card>
            <CardHeader>
                <CardTitle>Manage Customers</CardTitle>
                <CardDescription>View and manage your customer list.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Customer list and management tools will be here.</p>
            </CardContent>
        </Card>
    </div>
  );
}
