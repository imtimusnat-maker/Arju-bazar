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
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Search } from 'lucide-react';
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
import { useDebounce } from '@/hooks/use-debounce';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  name_bn: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  description_bn: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  originalPrice: z.coerce.number().optional(),
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

const generateSearchKeywords = (name: string, name_bn?: string): string[] => {
    const keywords = new Set<string>();
    
    // Add English keywords
    name.toLowerCase().split(/\s+/).forEach(word => {
        if(word) keywords.add(word);
    });

    // Add Bengali keywords
    if (name_bn) {
        name_bn.split(/\s+/).forEach(word => {
            if(word) keywords.add(word.toLowerCase());
        });
    }
    
    return Array.from(keywords);
};


export default function AdminProductsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const firestore = useFirestore();

  const productsCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'products') : null),
    [firestore]
  );
  const { data: products, isLoading: productsLoading } =
    useCollection<Product>(productsCollection);
    
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!debouncedSearchTerm) return products;
    
    const searchKeywords = debouncedSearchTerm.toLowerCase().split(/\s+/).filter(Boolean);

    return products.filter(product =>
      searchKeywords.every(keyword =>
        product.searchKeywords?.some(productKeyword => productKeyword.includes(keyword))
      )
    );
  }, [products, debouncedSearchTerm]);


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
      name_bn: '',
      description: '',
      description_bn: '',
      price: 0,
      originalPrice: 0,
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
  
  // Auto-translation logic
  const nameEn = useDebounce(form.watch('name'), 500);
  const descriptionEn = useDebounce(form.watch('description'), 500);

  useEffect(() => {
    if (nameEn && isDialogOpen) {
        fetch(`/api/translate?text=${encodeURIComponent(nameEn)}&targetLang=bn`)
            .then(res => res.json())
            .then(data => form.setValue('name_bn', data.translation));
    }
  }, [nameEn, form, isDialogOpen]);

  useEffect(() => {
    if (descriptionEn && isDialogOpen) {
        fetch(`/api/translate?text=${encodeURIComponent(descriptionEn)}&targetLang=bn`)
            .then(res => res.json())
            .then(data => form.setValue('description_bn', data.translation));
    }
  }, [descriptionEn, form, isDialogOpen]);


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
        name_bn: product.name_bn || '',
        description: product.description,
        description_bn: product.description_bn || '',
        price: product.price,
        originalPrice: product.originalPrice || undefined,
        stockQuantity: product.stockQuantity,
        imageUrl: product.imageUrl,
        imageCdnUrl: product.imageCdnUrl,
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId || '',
      });
    } else {
      form.reset({
        name: '',
        name_bn: '',
        description: '',
        description_bn: '',
        price: 0,
        originalPrice: 0,
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
    const searchKeywords = generateSearchKeywords(data.name, data.name_bn);

    // Ensure optional fields are not undefined
    const productPayload = {
      ...data,
      name_bn: data.name_bn || '',
      description_bn: data.description_bn || '',
      originalPrice: data.originalPrice || data.price,
      imageUrl: data.imageUrl || '',
      imageCdnUrl: data.imageCdnUrl || '',
      subcategoryId: data.subcategoryId || '',
      slug,
      searchKeywords,
      categorySlug: category?.slug || '',
    };


    if (editingProduct) {
       const productData = {
        ...productPayload,
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
        ...productPayload,
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
      <div className="flex items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
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
                ) : filteredProducts && filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
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
        <DialogContent className="sm:max-w-2xl flex flex-col h-full sm:h-auto">
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
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-1 pr-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Product Name (EN)</FormLabel>
                          <FormControl>
                          <Input placeholder="e.g. Organic Honey" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="name_bn"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Product Name (BN)</FormLabel>
                          <FormControl>
                          <Input placeholder="স্বয়ংক্রিয়ভাবে অনুবাদ হবে" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Description (EN)</FormLabel>
                          <FormControl>
                          <Textarea
                              placeholder="Describe the product in English..."
                              {...field}
                          />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="description_bn"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Description (BN)</FormLabel>
                          <FormControl>
                          <Textarea
                              placeholder="স্বয়ংক্রিয়ভাবে অনুবাদ হবে"
                              {...field}
                          />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                </div>
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
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
                    name="originalPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Original Price</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="120.00" {...field} />
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
              </div>

              <DialogFooter className="mt-4 pt-4 border-t">
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
