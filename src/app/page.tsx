import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { ProductCard } from '@/components/product-card';
import { PlaceHolderImages } from '@/lib/placeholder-images';

// Mock data
const categories = [
  { name: 'Men', href: '#', image: PlaceHolderImages.find(i => i.id === 'category-men')! },
  { name: 'Women', href: '#', image: PlaceHolderImages.find(i => i.id === 'category-women')! },
  { name: 'Kids', href: '#', image: PlaceHolderImages.find(i => i.id === 'category-kids')! },
  { name: 'Bedsheets', href: '#', image: PlaceHolderImages.find(i => i.id === 'category-bedsheet')! },
  { name: 'Furniture', href: '#', image: PlaceHolderImages.find(i => i.id === 'category-furniture')! },
];

const featuredProducts = [
  { id: '1', name: "Elegant Men's Watch", price: 120.00, originalPrice: 150.00, image: PlaceHolderImages.find(i => i.id === 'product-1')!, slug: 'elegant-mens-watch' },
  { id: '2', name: 'Summer Floral Dress', price: 75.50, image: PlaceHolderImages.find(i => i.id === 'product-2')!, slug: 'summer-floral-dress' },
  { id: '3', name: 'Leather Biker Jacket', price: 250.00, originalPrice: 300.00, image: PlaceHolderImages.find(i => i.id === 'product-3')!, slug: 'leather-biker-jacket' },
  { id: '4', name: 'Modern Scandinavian Sofa', price: 899.99, image: PlaceHolderImages.find(i => i.id === 'product-4')!, slug: 'modern-scandinavian-sofa' },
];

const heroSlides = PlaceHolderImages.filter(i => i.id.startsWith('hero-'));

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full">
          <Carousel
            className="w-full"
            opts={{
              loop: true,
            }}
          >
            <CarouselContent>
              {heroSlides.map((slide) => (
                <CarouselItem key={slide.id}>
                  <div className="relative aspect-[2/1] w-full">
                    <Image
                      src={slide.imageUrl}
                      alt={slide.description}
                      fill
                      priority
                      className="object-cover"
                      data-ai-hint={slide.imageHint}
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white p-4">
                      <h1 className="font-headline text-4xl md:text-6xl lg:text-7xl font-bold drop-shadow-lg">Discover Your Style</h1>
                      <p className="mt-4 max-w-2xl text-lg md:text-xl">Browse our curated collections of fashion and home essentials.</p>
                      <Button size="lg" className="mt-8 bg-primary hover:bg-primary/90 text-primary-foreground">
                        Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex" />
            <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex" />
          </Carousel>
        </section>

        {/* Categories Section */}
        <section className="py-12 md:py-20 bg-card">
          <div className="container mx-auto max-w-screen-xl px-4">
            <h2 className="text-center font-headline text-3xl md:text-4xl font-bold">Shop by Category</h2>
            <p className="text-center mt-2 text-muted-foreground max-w-2xl mx-auto">Find what you're looking for from our wide range of collections.</p>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 md:gap-6">
              {categories.map((category) => (
                <Link key={category.name} href={category.href} className="group block">
                  <Card className="overflow-hidden transition-all duration-300 group-hover:shadow-lg group-hover:border-primary">
                    <CardContent className="p-0">
                      <div className="relative aspect-square">
                        <Image
                          src={category.image.imageUrl}
                          alt={category.image.description}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          data-ai-hint={category.image.imageHint}
                        />
                         <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300"></div>
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <h3 className="font-headline text-xl md:text-2xl font-bold text-white drop-shadow-md text-center px-2">{category.name}</h3>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto max-w-screen-xl px-4">
            <h2 className="text-center font-headline text-3xl md:text-4xl font-bold">Featured Products</h2>
            <p className="text-center mt-2 text-muted-foreground max-w-2xl mx-auto">Check out our best-selling and most loved products.</p>
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-12 text-center">
              <Button size="lg" variant="outline">
                View All Products <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
