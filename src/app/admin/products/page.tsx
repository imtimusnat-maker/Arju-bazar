import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function AdminProductsPage() {
  return (
    <div>
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Products</h1>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
            </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Manage Products</CardTitle>
                <CardDescription>Here you can add, edit, and delete products.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Product list and management tools will be here.</p>
            </CardContent>
        </Card>
    </div>
  );
}
