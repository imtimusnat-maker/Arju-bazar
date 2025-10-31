import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function AdminOrdersPage() {
  return (
    <div>
        <h1 className="text-2xl font-bold mb-6">Orders</h1>
        <Card>
            <CardHeader>
                <CardTitle>Manage Orders</CardTitle>
                <CardDescription>View and manage customer orders.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Order list and management tools will be here.</p>
            </CardContent>
        </Card>
    </div>
  );
}
