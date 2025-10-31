'use client';

import React, { useState, useMemo } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Widget as UploadcareWidget } from '@uploadcare/react-widget';
import Image from 'next/image';
import { useFirestore, useCollection } from '@/firebase';
import {
  collection,
  serverTimestamp,
  doc,
  writeBatch,
} from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import type { Product } from '@/lib/products';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  stockQuantity: z.coerce.number().int().min(0, 'Stock must be a whole number'),
  imageUrl: z.string().optional(),
  imageCdnUrl: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AdminProductsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const firestore = useFirestore();
  const productsCollection = useMemo(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: products, isLoading } = useCollection<Product>(
    productsCollection
  );

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      imageUrl: '',
      imageCdnUrl: '',
    },
  });

  const handleDialogOpen = (product: Product | null = null) => {
    setEditingProduct(product);
    if (product) {
      form.reset({
        name: product.name,
        description: product.description,
        price: product.price,
        stockQuantity: product.stockQuantity,
        imageUrl: product.imageUrl,
        imageCdnUrl: product.imageCdnUrl,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        stockQuantity: 0,
        imageUrl: '',
        imageCdnUrl: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleDelete = (productId: string) => {
    if (!firestore) return;
    const productDoc = doc(firestore, 'products', productId);
    deleteDocumentNonBlocking(productDoc);
    toast({
      title: 'Product Deleted',
      description: 'The product has been successfully deleted.',
    });
  };

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    if (!firestore) return;

    const slug = data.name.toLowerCase().replace(/\s+/g, '-');
    const productData = {
      ...data,
      slug,
      updatedAt: serverTimestamp(),
    };

    if (editingProduct) {
      // Update existing product
      const productDoc = doc(firestore, 'products', editingProduct.id);
      updateDocumentNonBlocking(productDoc, productData);
      toast({
        title: 'Product Updated',
        description: `${data.name} has been updated.`,
      });
    } else {
      // Add new product
      const newProductData = {
        ...productData,
        createdAt: serverTimestamp(),
      };
      addDocumentNonBlocking(collection(firestore, 'products'), newProductData);
      toast({
        title: 'Product Added',
        description: `${data.name} has been successfully added.`,
      });
    }

    form.reset();
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => handleDialogOpen()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Products</CardTitle>
          <CardDescription>
            Here you can add, edit, and delete products.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : products && products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Image
                        src={product.imageCdnUrl || 'https://placehold.co/400'}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="rounded-md object-cover"
                      />
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>Tk {product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.stockQuantity}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleDialogOpen(product)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(product.id)}
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
                  <TableCell colSpan={5} className="text-center">
                    No products found.
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
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Update the details of your product.'
                : 'Add a new product to your store.'}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Organic Honey" {...field} />
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
                        placeholder="Describe the product..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="99.99" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stockQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormItem>
                <FormLabel>Product Image</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    {form.watch('imageCdnUrl') && (
                      <Image
                        src={form.watch('imageCdnUrl')!}
                        alt="Product preview"
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                      />
                    )}
                    <UploadcareWidget
                      publicKey="8a36dc68d775720c733b"
                      onFileSelect={(file) => {
                        if (file) {
                          file.done((fileInfo) => {
                            form.setValue('imageUrl', fileInfo.originalUrl || '');
                            form.setValue('imageCdnUrl', fileInfo.cdnUrl || '');
                          });
                        }
                      }}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>

              <DialogFooter>
                <Button type="submit">
                  {editingProduct ? 'Save Changes' : 'Add Product'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
