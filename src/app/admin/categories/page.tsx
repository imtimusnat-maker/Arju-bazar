import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function AdminCategoriesPage() {
  return (
    <div>
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Categories</h1>
            <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Category
            </Button>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Manage Categories</CardTitle>
                <CardDescription>Here you can add, edit, and delete categories and subcategories.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Category management tools will be here.</p>
            </CardContent>
        </Card>
    </div>
  );
}
