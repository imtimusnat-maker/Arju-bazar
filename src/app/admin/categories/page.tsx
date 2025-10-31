'use client';

import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IKContext, IKUpload } from 'imagekitio-react';
import Image from 'next/image';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  collection,
  serverTimestamp,
  doc,
} from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';

// Define the type for a Category based on your data structure
export type Category = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  imageCdnUrl: string;
  slug: string;
};

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().min(1, 'Description is required'),
  imageUrl: z.string().optional(),
  imageCdnUrl: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const authenticator =  async () => {
    try {
        const response = await fetch('https://imagekit.io/api/v1/signatures');
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed with status ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        const { signature, expire, token } = data;
        return { signature, expire, token };
    } catch (error) {
        throw new Error(`Authentication request failed: ${error.message}`);
    }
};

export default function AdminCategoriesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { toast } = useToast();

  const firestore = useFirestore();
  const categoriesCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories, isLoading } = useCollection<Category>(
    categoriesCollection
  );

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      imageUrl: '',
      imageCdnUrl: '',
    },
  });

  const handleDialogOpen = (category: Category | null = null) => {
    setEditingCategory(category);
    if (category) {
      form.reset({
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
        imageCdnUrl: category.imageCdnUrl,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        imageUrl: '',
        imageCdnUrl: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleDelete = (categoryId: string) => {
    if (!firestore) return;
    const categoryDoc = doc(firestore, 'categories', categoryId);
    deleteDocumentNonBlocking(categoryDoc);
    toast({
      title: 'Category Deleted',
      description: 'The category has been successfully deleted.',
    });
  };

  const onSubmit: SubmitHandler<CategoryFormData> = async (data) => {
    if (!firestore) return;

    const slug = data.name.toLowerCase().replace(/\s+/g, '-');
    const categoryData = {
      ...data,
      slug,
      updatedAt: serverTimestamp(),
    };

    if (editingCategory) {
      const categoryDoc = doc(firestore, 'categories', editingCategory.id);
      updateDocumentNonBlocking(categoryDoc, categoryData);
      toast({
        title: 'Category Updated',
        description: `${data.name} has been updated.`,
      });
    } else {
      const newCategoryData = {
        ...categoryData,
        createdAt: serverTimestamp(),
      };
      addDocumentNonBlocking(collection(firestore, 'categories'), newCategoryData);
      toast({
        title: 'Category Added',
        description: `${data.name} has been successfully added.`,
      });
    }

    form.reset();
    setIsDialogOpen(false);
    setEditingCategory(null);
  };
  
  const onUploadSuccess = (res: any) => {
    form.setValue('imageUrl', res.url);
    form.setValue('imageCdnUrl', res.url);
  };

  const onUploadError = (err: any) => {
    console.error("Upload error", err);
    toast({
      variant: "destructive",
      title: "Upload Failed",
      description: "There was a problem with the image upload.",
    });
  };


  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => handleDialogOpen()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>
            Here you can add, edit, and delete product categories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : categories && categories.length > 0 ? (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>
                      <Image
                        src={category.imageCdnUrl || 'https://placehold.co/400'}
                        alt={category.name}
                        width={40}
                        height={40}
                        className="rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleDialogOpen(category)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(category.id)}
                            className="text-red-500"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No categories found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Category' : 'Add Category'}
            </DialogTitle>
            <DialogDescription>
              {editingCategory
                ? 'Update the details of your category.'
                : 'Add a new category to your store.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Men Collections" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe the category..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormItem>
                <FormLabel>Category Image</FormLabel>
                <FormControl>
                  <IKContext
                      publicKey="public_c4ZeIR2RUTeVp4nR4SoIF3R8f1w="
                      urlEndpoint="https://ik.imagekit.io/yajy2sbsw"
                      authenticator={authenticator}
                    >
                  <div className="flex items-center gap-4">
                    {form.watch('imageCdnUrl') && (
                      <Image
                        src={form.watch('imageCdnUrl')!}
                        alt="Category preview"
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                      />
                    )}
                    <IKUpload
                      fileName="category-image.jpg"
                      onError={onUploadError}
                      onSuccess={onUploadSuccess}
                    />
                  </div>
                  </IKContext>
                </FormControl>
                <FormMessage />
              </FormItem>

              <DialogFooter>
                <Button type="submit">
                  {editingCategory ? 'Save Changes' : 'Add Category'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
