import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { 
  StarIcon, 
  HeartIcon, 
  ShoppingCartIcon,
  ArrowRightIcon,
  TruckIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import Navbar from '../components/ui/Navbar';
import { CartProvider, useCart } from '../lib/cartContext';
import { fetchProducts } from '../lib/api';

const HomePage = () => {
  return (
    <CartProvider>
      <HomeContent />
    </CartProvider>
  );
};

const HomeContent = () => {
  const { addToCart, addToWishlist, isInWishlist } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch featured products
  const { data: featuredProducts, isLoading: featuredLoading } = useQuery(
    ['featured-products'],
    () => fetchProducts({ featured: true, limit: 8 }),
    { staleTime: 5 * 60 * 1000 }
  );

  // Fetch new arrivals
  const { data: newProducts, isLoading: newLoading } = useQuery(
    ['new-products'],
    () => fetchProducts({ sortBy: 'createdAt', limit: 8 }),
    { staleTime: 5 * 60 * 1000 }
  );

  // Hero carousel
  const heroSlides = [
    {
      id: 1,
      title: "Summer Collection 2024",
      subtitle: "Discover the latest trends in fashion",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
      cta: "Shop Now",
      link: "/category/clothing"
    },
    {
      id: 2,
      title: "Electronics Sale",
      subtitle: "Up to 50% off on premium electronics",
      image: "https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=1200&h=600&fit=crop",
      cta: "Explore Deals",
      link: "/category/electronics"
    },
    {
      id: 3,
      title: "Kitchen Essentials",
      subtitle: "Transform your cooking experience",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=600&fit=crop",
      cta: "Shop Kitchen",
      link: "/category/kitchen-items"
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  const categories = [
    {
      name: 'Clothing',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop',
      href: '/category/clothing',
      count: '500+ Products'
    },
    {
      name: 'Kitchen Items',
      image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
      href: '/category/kitchen-items',
      count: '300+ Products'
    },
    {
      name: 'Kids Toys',
      image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&h=300&fit=crop',
      href: '/category/kids-toys',
      count: '200+ Products'
    },
    {
      name: 'Electronics',
      image: 'https://images.unsplash.com/photo-1468495244123-6c6c332eeece?w=400&h=300&fit=crop',
      href: '/category/electronics',
      count: '400+ Products'
    }
  ];

  const features = [
    {
      icon: TruckIcon,
      title: 'Free Shipping',
      description: 'Free shipping on orders over $50'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure Payment',
      description: '100% secure payment processing'
    },
    {
      icon: ArrowPathIcon,
      title: 'Easy Returns',
      description: '30-day return policy'
    },
    {
      icon: CreditCardIcon,
      title: 'Installment Plans',
      description: 'Pay in installments with 0% interest'
    }
  ];

  const ProductCard = ({ product }) => {
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
      addToCart(product, quantity, selectedVariant);
    };

    const handleWishlist = () => {
      if (isInWishlist(product)) {
        // Remove from wishlist logic would go here
      } else {
        addToWishlist(product);
      }
    };

    return (
      <div className="card hover-lift group">
        <div className="relative overflow-hidden rounded-t-lg">
          <Image
            src={product.mainImage}
            alt={product.name}
            width={300}
            height={300}
            className="product-image w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
          
          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
          >
            <HeartIcon className={`h-5 w-5 ${isInWishlist(product) ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
          </button>

          {/* Quick add to cart */}
          <div className="absolute bottom-0 left-0 right-0 bg-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleAddToCart}
              className="w-full py-2 bg-primary text-white font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingCartIcon className="h-4 w-4" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(product.averageRating || 0)
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 ml-1">
              ({product.totalReviews || 0})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900">
                ${product.price}
              </span>
              {product.comparePrice && product.comparePrice > product.price && (
                <span className="text-sm text-gray-500 line-through">
                  ${product.comparePrice}
                </span>
              )}
            </div>
            
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                Only {product.stock} left
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Head>
        <title>ElevenKart - Your Premium Shopping Destination</title>
        <meta name="description" content="Discover amazing products at ElevenKart. Shop for clothing, electronics, kitchen items, and kids toys with free shipping and easy returns." />
        <meta name="keywords" content="ecommerce, online shopping, clothing, electronics, kitchen items, toys" />
      </Head>

      <Navbar />

      {/* Hero Section */}
      <section className="relative h-96 md:h-[500px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black bg-opacity-40" />
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-4">
                <div className="max-w-2xl text-white">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 text-shadow">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 text-shadow">
                    {slide.subtitle}
                  </p>
                  <Link
                    href={slide.link}
                    className="inline-flex items-center bg-primary hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
                  >
                    {slide.cta}
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our wide range of products across different categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={category.href}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-lg hover-lift">
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={300}
                    height={225}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.count}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
              <p className="text-gray-600">Handpicked products for you</p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center text-primary hover:text-blue-700 font-semibold"
            >
              View All
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="card animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-t-lg" />
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts?.products?.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">New Arrivals</h2>
              <p className="text-gray-600">Latest products added to our collection</p>
            </div>
            <Link
              href="/products?sortBy=createdAt"
              className="inline-flex items-center text-primary hover:text-blue-700 font-semibold"
            >
              View All
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {newLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="card animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-t-lg" />
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts?.products?.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and get the latest updates on new products, exclusive offers, and more.
          </p>
          <div className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button className="bg-blue-800 hover:bg-blue-900 text-white px-6 py-3 rounded-r-lg transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;