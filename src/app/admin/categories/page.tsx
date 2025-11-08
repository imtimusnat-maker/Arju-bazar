'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { PlusCircle, MoreHorizontal, Pencil, Trash2, Search } from 'lucide-react';
import { useForm, type SubmitHandler, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IKContext, IKUpload } from 'imagekitio-react';
import Image from 'next/image';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import {
  collection,
  serverTimestamp,
  doc,
  query,
  where,
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
import type { Category, Subcategory } from '@/lib/categories';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Textarea } from '@/components/ui/textarea';
import { useDebounce } from '@/hooks/use-debounce';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  name_bn: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  description_bn: z.string().optional(),
  imageUrl: z.string().optional(),
  imageCdnUrl: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

const subcategorySchema = z.object({
  name: z.string().min(1, 'Subcategory name is required'),
  name_bn: z.string().optional(),
  imageUrl: z.string().optional(),
  imageCdnUrl: z.string().optional(),
});

type SubcategoryFormData = z.infer<typeof subcategorySchema>;

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


function SubcategoryList({
  categoryId,
  onEdit,
}: {
  categoryId: string;
  onEdit: (subcategory: Subcategory) => void;
}) {
  const firestore = useFirestore();
  const subcategoriesQuery = useMemoFirebase(
    () => (firestore ? query(collection(firestore, 'subcategories'), where('categoryId', '==', categoryId)) : null),
    [firestore, categoryId]
  );
  const { data: subcategories, isLoading } = useCollection<Subcategory>(subcategoriesQuery);

  const handleDelete = (subcategoryId: string) => {
    if (!firestore) return;
    const subcategoryDoc = doc(firestore, `subcategories`, subcategoryId);
    deleteDocumentNonBlocking(subcategoryDoc);
  };

  if (isLoading) return <p>Loading subcategories...</p>;
  if (!subcategories || subcategories.length === 0) return <p className="px-4 py-2 text-sm text-muted-foreground">No subcategories found.</p>;

  return (
    <div className="px-4 py-2 bg-gray-50/50">
      <h4 className="font-semibold text-sm mb-2">Subcategories:</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {subcategories.map((sub) => (
          <div key={sub.id} className="flex items-center justify-between p-2 text-sm border rounded-md bg-white">
            <div className="flex items-center gap-2 overflow-hidden">
                 {sub.imageCdnUrl && (
                    <Image
                      src={sub.imageCdnUrl}
                      alt={sub.name}
                      width={24}
                      height={24}
                      className="rounded-sm object-cover flex-shrink-0"
                    />
                  )}
                <span className="truncate">{sub.name}</span>
            </div>
            <div className="flex items-center flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(sub)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                   <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the subcategory "{sub.name}".
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(sub.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


export default function AdminCategoriesPage() {
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [isEditSubcategoryDialogOpen, setIsEditSubcategoryDialogOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [activeForm, setActiveForm] = useState<'category' | 'subcategory' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const { toast } = useToast();
  const firestore = useFirestore();

  const categoriesCollection = useMemoFirebase(
    () => (firestore ? collection(firestore, 'categories') : null),
    [firestore]
  );
  const { data: categories, isLoading } = useCollection<Category>(
    categoriesCollection
  );
  
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!debouncedSearchTerm) return categories;

    const searchKeywords = debouncedSearchTerm.toLowerCase().split(/\s+/).filter(Boolean);
    if (searchKeywords.length === 0) return categories;

    return categories.filter(category =>
      searchKeywords.every(keyword =>
        category.searchKeywords?.some(categoryKeyword => categoryKeyword.includes(keyword))
      )
    );
  }, [categories, debouncedSearchTerm]);


  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      name_bn: '',
      description: '',
      description_bn: '',
      imageUrl: '',
      imageCdnUrl: '',
    },
  });

  const subcategoryForm = useForm<SubcategoryFormData>({
    resolver: zodResolver(subcategorySchema),
    defaultValues: {
      name: '',
      name_bn: '',
      imageUrl: '',
      imageCdnUrl: '',
    },
  });

  // Auto-translation logic for Category form
  const catNameEn = useDebounce(categoryForm.watch('name'), 500);
  const catDescEn = useDebounce(categoryForm.watch('description'), 500);

  useEffect(() => {
    if (catNameEn && isCategoryDialogOpen) {
        fetch(`/api/translate?text=${encodeURIComponent(catNameEn)}&targetLang=bn`)
            .then(res => res.json())
            .then(data => categoryForm.setValue('name_bn', data.translation));
    }
  }, [catNameEn, isCategoryDialogOpen, categoryForm]);

  useEffect(() => {
    if (catDescEn && isCategoryDialogOpen) {
        fetch(`/api/translate?text=${encodeURIComponent(catDescEn)}&targetLang=bn`)
            .then(res => res.json())
            .then(data => categoryForm.setValue('description_bn', data.translation));
    }
  }, [catDescEn, isCategoryDialogOpen, categoryForm]);

  // Auto-translation logic for Subcategory form
  const subcatNameEn = useDebounce(subcategoryForm.watch('name'), 500);

  useEffect(() => {
    if (subcatNameEn && (isSubcategoryDialogOpen || isEditSubcategoryDialogOpen)) {
        fetch(`/api/translate?text=${encodeURIComponent(subcatNameEn)}&targetLang=bn`)
            .then(res => res.json())
            .then(data => subcategoryForm.setValue('name_bn', data.translation));
    }
  }, [subcatNameEn, isSubcategoryDialogOpen, isEditSubcategoryDialogOpen, subcategoryForm]);


  const handleCategoryDialogOpen = (category: Category | null = null) => {
    setEditingCategory(category);
    setActiveForm('category');
    if (category) {
      categoryForm.reset({
        name: category.name,
        name_bn: category.name_bn || '',
        description: category.description,
        description_bn: category.description_bn || '',
        imageUrl: category.imageUrl,
        imageCdnUrl: category.imageCdnUrl,
      });
    } else {
      categoryForm.reset({
        name: '',
        name_bn: '',
        description: '',
        description_bn: '',
        imageUrl: '',
        imageCdnUrl: '',
      });
    }
    setIsCategoryDialogOpen(true);
  };
  
  const handleAddSubcategoryDialogOpen = (category: Category) => {
    setParentCategory(category);
    setActiveForm('subcategory');
    subcategoryForm.reset({ name: '', name_bn: '', imageUrl: '', imageCdnUrl: '' });
    setIsSubcategoryDialogOpen(true);
  };
  
  const handleEditSubcategoryDialogOpen = (subcategory: Subcategory, category: Category) => {
      setParentCategory(category);
      setEditingSubcategory(subcategory);
      setActiveForm('subcategory');
      subcategoryForm.reset({ 
          name: subcategory.name,
          name_bn: subcategory.name_bn || '',
          imageUrl: subcategory.imageUrl,
          imageCdnUrl: subcategory.imageCdnUrl,
      });
      setIsEditSubcategoryDialogOpen(true);
  };


  const handleCategoryDelete = (categoryId: string) => {
    if (!firestore) return;
    const categoryDoc = doc(firestore, 'categories', categoryId);
    // TODO: Also delete subcollections and related products, or handle this via a cloud function.
    deleteDocumentNonBlocking(categoryDoc);
    toast({
      title: 'Category Deleted',
      description: 'The category has been successfully deleted.',
    });
  };

  const onCategorySubmit: SubmitHandler<CategoryFormData> = async (data) => {
    if (!firestore) return;

    const slug = data.name.toLowerCase().replace(/\s+/g, '-');
    const searchKeywords = generateSearchKeywords(data.name, data.name_bn);
    
    if (editingCategory) {
       const categoryData = {
        ...data,
        name_bn: data.name_bn || '',
        description_bn: data.description_bn || '',
        imageUrl: data.imageUrl || '',
        imageCdnUrl: data.imageCdnUrl || '',
        slug,
        searchKeywords,
        updatedAt: serverTimestamp(),
      };
      const categoryDoc = doc(firestore, 'categories', editingCategory.id);
      updateDocumentNonBlocking(categoryDoc, categoryData);
      toast({
        title: 'Category Updated',
        description: `${data.name} has been updated.`,
      });
    } else {
      const newCategoryData = {
        ...data,
        name_bn: data.name_bn || '',
        description_bn: data.description_bn || '',
        imageUrl: data.imageUrl || '',
        imageCdnUrl: data.imageCdnUrl || '',
        slug,
        searchKeywords,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      addDocumentNonBlocking(collection(firestore, 'categories'), newCategoryData);
      toast({
        title: 'Category Added',
        description: `${data.name} has been successfully added.`,
      });
    }

    categoryForm.reset();
    setIsCategoryDialogOpen(false);
    setEditingCategory(null);
  };

   const onAddSubcategorySubmit: SubmitHandler<SubcategoryFormData> = async (data) => {
    if (!firestore || !parentCategory) return;
    
    const slug = data.name.toLowerCase().replace(/\s+/g, '-');
    const searchKeywords = generateSearchKeywords(data.name, data.name_bn);
    const subcategoryData = {
        ...data,
        name_bn: data.name_bn || '',
        imageUrl: data.imageUrl || '',
        imageCdnUrl: data.imageCdnUrl || '',
        slug,
        searchKeywords,
        categoryId: parentCategory.id,
        categorySlug: parentCategory.slug, // Ensure categorySlug is saved
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    }

    addDocumentNonBlocking(collection(firestore, 'subcategories'), subcategoryData);
    toast({
        title: 'Subcategory Added',
        description: `${data.name} has been added to ${parentCategory.name}.`,
    });
    
    subcategoryForm.reset();
    setIsSubcategoryDialogOpen(false);
    setParentCategory(null);
   };
   
  const onEditSubcategorySubmit: SubmitHandler<SubcategoryFormData> = async (data) => {
    if (!firestore || !parentCategory || !editingSubcategory) return;
    
    const slug = data.name.toLowerCase().replace(/\s+/g, '-');
    const searchKeywords = generateSearchKeywords(data.name, data.name_bn);
    const subcategoryData = {
        ...data,
        name_bn: data.name_bn || '',
        imageUrl: data.imageUrl || '',
        imageCdnUrl: data.imageCdnUrl || '',
        slug,
        searchKeywords,
        updatedAt: serverTimestamp(),
    };

    const subcategoryDoc = doc(firestore, `subcategories`, editingSubcategory.id);
    updateDocumentNonBlocking(subcategoryDoc, subcategoryData);
    toast({
      title: 'Subcategory Updated',
      description: `${data.name} has been updated.`,
    });
    
    subcategoryForm.reset();
    setIsEditSubcategoryDialogOpen(false);
    setEditingSubcategory(null);
    setParentCategory(null);
  };

  const onUploadSuccess = (res: any) => {
    let form: UseFormReturn<CategoryFormData> | UseFormReturn<SubcategoryFormData> | null = null;
    if (activeForm === 'category') {
      form = categoryForm;
    } else if (activeForm === 'subcategory') {
      form = subcategoryForm;
    }
    
    if (form) {
        form.setValue('imageUrl', res.url);
        form.setValue('imageCdnUrl', res.thumbnailUrl.replace('tr:n-media_library_thumbnail', ''));
    }
  };

  const onUploadError = (err: any) => {
    console.error("Upload error", err);
    toast({
      variant: "destructive",
      title: "Upload Failed",
      description: "There was a problem with the image upload. Please try again.",
    });
  };


  return (
    <div>
      <div className="flex items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">Categories</h1>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => handleCategoryDialogOpen()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Categories</CardTitle>
          <CardDescription>
            Here you can add, edit, and manage product categories and subcategories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
             {isLoading ? (
                <p className="text-center py-4">Loading...</p>
              ) : filteredCategories && filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                    <AccordionItem value={category.id} key={category.id}>
                       <div className="flex items-center w-full">
                        <AccordionTrigger className="flex-1 py-2">
                            <div className="flex items-center gap-4">
                                <Image
                                    src={category.imageCdnUrl || 'https://placehold.co/400'}
                                    alt={category.name}
                                    width={40}
                                    height={40}
                                    className="rounded-md object-cover"
                                />
                                <div className="text-left">
                                    <p className="font-medium">{category.name}</p>
                                    <p className="text-sm text-muted-foreground hidden sm:block">{category.description}</p>
                                </div>
                            </div>
                        </AccordionTrigger>
                        <div className="px-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleAddSubcategoryDialogOpen(category)}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Subcategory
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleCategoryDialogOpen(category)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Edit
                                </DropdownMenuItem>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-500">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                            This will permanently delete the category "{category.name}" and all its subcategories. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleCategoryDelete(category.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                        <AccordionContent>
                           <SubcategoryList
                              categoryId={category.id}
                              onEdit={(subcategory) => handleEditSubcategoryDialogOpen(subcategory, category)}
                            />
                        </AccordionContent>
                    </AccordionItem>
                ))
              ) : (
                <p className="text-center py-4">No categories found.</p>
              )}
          </Accordion>
        </CardContent>
      </Card>

      {/* Category Dialog (Add/Edit) */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-2xl flex flex-col h-full sm:h-auto">
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
          <Form {...categoryForm}>
            <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-1 pr-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={categoryForm.control}
                        name="name"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category Name (EN)</FormLabel>
                            <FormControl>
                            <Input placeholder="e.g. Men Collections" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={categoryForm.control}
                        name="name_bn"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category Name (BN)</FormLabel>
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
                        control={categoryForm.control}
                        name="description"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description (EN)</FormLabel>
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
                    <FormField
                        control={categoryForm.control}
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
                  
                  <FormItem>
                    <FormLabel>Category Image</FormLabel>
                    <FormControl>
                      <IKContext
                          publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
                          urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                          authenticator={authenticator}
                        >
                      <div className="flex items-center gap-4">
                        {categoryForm.watch('imageCdnUrl') && (
                          <Image
                            src={categoryForm.watch('imageCdnUrl')!}
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
                  {editingCategory ? 'Save Changes' : 'Add Category'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

    {/* Add Subcategory Dialog */}
     <Dialog open={isSubcategoryDialogOpen} onOpenChange={setIsSubcategoryDialogOpen}>
        <DialogContent className="sm:max-w-xl flex flex-col h-full sm:h-auto">
          <DialogHeader>
            <DialogTitle>Add Subcategory</DialogTitle>
            <DialogDescription>
              Add a new subcategory to {parentCategory?.name}.
            </DialogDescription>
          </DialogHeader>
          <Form {...subcategoryForm}>
            <form onSubmit={subcategoryForm.handleSubmit(onAddSubcategorySubmit)} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-1 pr-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={subcategoryForm.control}
                            name="name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subcategory Name (EN)</FormLabel>
                                <FormControl>
                                <Input placeholder="e.g. Panjabi" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={subcategoryForm.control}
                            name="name_bn"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Subcategory Name (BN)</FormLabel>
                                <FormControl>
                                <Input placeholder="স্বয়ংক্রিয়ভাবে অনুবাদ হবে" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                    </div>
                    <FormItem>
                        <FormLabel>Subcategory Image</FormLabel>
                        <FormControl>
                        <IKContext
                            publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
                            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                            authenticator={authenticator}
                            >
                        <div className="flex items-center gap-4">
                            {subcategoryForm.watch('imageCdnUrl') && (
                            <Image
                                src={subcategoryForm.watch('imageCdnUrl')!}
                                alt="Subcategory preview"
                                width={64}
                                height={64}
                                className="rounded-md object-cover"
                            />
                            )}
                            <IKUpload
                            fileName="subcategory-image.jpg"
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
                <Button type="submit">Add Subcategory</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
    {/* Edit Subcategory Dialog */}
     <Dialog open={isEditSubcategoryDialogOpen} onOpenChange={setIsEditSubcategoryDialogOpen}>
        <DialogContent className="sm:max-w-xl flex flex-col h-full sm:h-auto">
          <DialogHeader>
            <DialogTitle>Edit Subcategory</DialogTitle>
            <DialogDescription>
              Editing subcategory in {parentCategory?.name}.
            </DialogDescription>
          </DialogHeader>
          <Form {...subcategoryForm}>
            <form onSubmit={subcategoryForm.handleSubmit(onEditSubcategorySubmit)} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-1 pr-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={subcategoryForm.control}
                                name="name"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subcategory Name (EN)</FormLabel>
                                    <FormControl>
                                    <Input placeholder="e.g. Panjabi" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={subcategoryForm.control}
                                name="name_bn"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subcategory Name (BN)</FormLabel>
                                    <FormControl>
                                    <Input placeholder="স্বয়ংক্রিয়ভাবে অনুবাদ হবে" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                    <FormItem>
                        <FormLabel>Subcategory Image</FormLabel>
                        <FormControl>
                        <IKContext
                            publicKey={process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY}
                            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                            authenticator={authenticator}
                            >
                        <div className="flex items-center gap-4">
                            {subcategoryForm.watch('imageCdnUrl') && (
                            <Image
                                src={subcategoryForm.watch('imageCdnUrl')!}
                                alt="Subcategory preview"
                                width={64}
                                height={64}
                                className="rounded-md object-cover"
                            />
                            )}
                            <IKUpload
                            fileName="subcategory-image.jpg"
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
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
