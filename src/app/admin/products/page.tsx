'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IKContext, IKUpload } from 'imagekitio-react';
import Image from 'next/image';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp, doc, query, where } from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';
import type { Product } from '@/lib/products';
import type { Category, Subcategory } from '@/lib/categories';
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
  categoryId: z.string().min(1, 'Please select a category'),
  subcategoryId: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

const authenticator = async () => {
    try {
        const response = await fetch('/api/imagekit/auth');
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Request failed with status ${response.status}: ${errorText}`);
        }
        const data = await response.json();
        const { signature, expire, token } = data;
        return { signature, expire, token };
    } catch (error) {
        console.error("Authentication request failed:", error);
        throw new Error("Failed to authenticate with ImageKit.");
    }
};

const generateSearchKeywords = (name: string): string => {
    if (!name) return '';
    return name.toLowerCase().replace(/\s+/g, '');
};


export default function AdminProductsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();

  const firestore = useFirestore();

  const productsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: products, isLoading: productsLoading } =
    useCollection<Product>(productsCollection);

  const categoriesCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories, isLoading: categoriesLoading } =
    useCollection<Category>(categoriesCollection);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stockQuantity: 0,
      imageUrl: '',
      imageCdnUrl: '',
      categoryId: '',
      subcategoryId: '',
    },
  });

  const selectedCategoryId = form.watch('categoryId');

  const subcategoriesQuery = useMemoFirebase(() => {
    if (!firestore || !selectedCategoryId) return null;
    return query(
        collection(firestore, 'subcategories'),
        where('categoryId', '==', selectedCategoryId)
    );
  }, [firestore, selectedCategoryId]);

  const { data: subcategories, isLoading: subcategoriesLoading } = useCollection<Subcategory>(subcategoriesQuery);
  
  useEffect(() => {
    if (form.formState.isDirty && form.formState.dirtyFields.categoryId) {
        form.resetField('subcategoryId', { defaultValue: '' });
    }
  }, [selectedCategoryId, form]);


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
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId || '',
      });
    } else {
      form.reset({
        name: '',
        description: '',
        price: 0,
        stockQuantity: 0,
        imageUrl: '',
        imageCdnUrl: '',
        categoryId: '',
        subcategoryId: '',
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
    const category = categories?.find(c => c.id === data.categoryId);
    const searchKeywords = generateSearchKeywords(data.name);

    if (editingProduct) {
       const productData = {
        ...data,
        slug,
        searchKeywords,
        categorySlug: category?.slug || '',
        updatedAt: serverTimestamp(),
      };
      const productDoc = doc(firestore, 'products', editingProduct.id);
      updateDocumentNonBlocking(productDoc, productData);
      toast({
        title: 'Product Updated',
        description: `${data.name} has been updated.`,
      });
    } else {
       const newProductData = {
        ...data,
        slug,
        searchKeywords,
        categorySlug: category?.slug || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      addDocumentNonBlocking(
        collection(firestore, 'products'),
        newProductData
      );
      toast({
        title: 'Product Added',
        description: `${data.name} has been successfully added.`,
      });
    }

    form.reset();
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  const onUploadSuccess = (res: any) => {
    form.setValue('imageUrl', res.url);
    form.setValue('imageCdnUrl', res.thumbnailUrl.replace('tr:n-media_library_thumbnail', ''));
  };

  const onUploadError = (err: any) => {
    console.error('Upload error', err);
    toast({
      variant: 'destructive',
      title: 'Upload Failed',
      description: 'There was a problem with the image upload. Please try again.',
    });
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
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px] sm:w-[80px]">Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Price</TableHead>
                  <TableHead className="hidden md:table-cell">Stock</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsLoading ? (
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
                      <TableCell className="hidden md:table-cell">Tk {product.price.toFixed(2)}</TableCell>
                      <TableCell className="hidden md:table-cell">{product.stockQuantity}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={() => handleDialogOpen(product)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-500"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete the product "
                                    {product.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(product.id)}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
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
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
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
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {categoriesLoading ? <SelectItem value="loading" disabled>Loading...</SelectItem> :
                                categories?.map(cat => (
                                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                ))
                            }
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="subcategoryId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Subcategory</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''} disabled={!selectedCategoryId || subcategoriesLoading}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a subcategory" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                            {subcategoriesLoading && <SelectItem value="loading" disabled>Loading...</SelectItem>}
                            {subcategories && subcategories.length > 0 ? subcategories.map(sub => (
                                <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                            )) : <SelectItem value="none" disabled>No subcategories</SelectItem>}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
               </div>
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
                  <IKContext
                    publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
                    urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                    authenticator={authenticator}
                  >
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
                      <IKUpload
                        fileName="product-image.jpg"
                        onError={onUploadError}
                        onSuccess={onUploadSuccess}
                        useUniqueFileName={true}
                      />
                    </div>
                  </IKContext>
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
