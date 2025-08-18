import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Star, Flower } from 'lucide-react';
import { Product, Category } from '../types';
import { apiService } from '../services/api';
import ProductCard from '../components/products/ProductCard';

const Home: React.FC = () => {
  console.log('Home component is rendering');
  
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [randomCategories, setRandomCategories] = useState<Category[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Home useEffect is running');
    const fetchData = async () => {
      try {
        console.log('Attempting to fetch data from API...');
        const [bouquetsData, categoriesData] = await Promise.all([
          apiService.getActiveBouquets(),
          apiService.getCategories()
        ]);
        // Map bouquet data to Product type
        const mappedProducts = bouquetsData.map((bouquet: any) => ({
          id: bouquet.id?.toString() || '',
          name: bouquet.name,
          description: bouquet.description,
          price: bouquet.price || 0,
          image: bouquet.imageUrl || bouquet.image || '', // Prioritize imageUrl for bouquets
          imageUrl: bouquet.imageUrl,
          category: bouquet.category?.name || bouquet.categoryId?.toString() || '',
          inStock: bouquet.isActive ?? true,
          quantity: 1,
          tags: [],
        }));
        // Get first 6 products as featured
        setFeaturedProducts(mappedProducts.slice(0, 6));
        setCategories(categoriesData);
        // pick 3 random categories to display on homepage
        const shuffled = [...categoriesData].sort(() => Math.random() - 0.5);
        setRandomCategories(shuffled.slice(0, Math.min(3, shuffled.length)));
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load featured products. Please try again later.');
      } finally {
        console.log('Setting loading to false');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const heroSlides = [
    {
      title: 'Fresh Flowers for Every Occasion',
      subtitle: 'Discover our beautiful collection of hand-picked flowers',
      image: 'https://images.unsplash.com/photo-1562690868-60bbe7293e94?w=1200',
      cta: 'Shop Now'
    },
    {
      title: 'Wedding Flowers & Bouquets',
      subtitle: 'Make your special day unforgettable with our stunning arrangements',
      image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=1200',
      cta: 'View Collection'
    },
    {
      title: 'Same Day Delivery Available',
      subtitle: 'Get fresh flowers delivered to your door today',
      image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=1200',
      cta: 'Learn More'
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-florist-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] overflow-hidden">
        <div className="relative h-full">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white max-w-2xl mx-auto px-4">
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 opacity-90">
                    {slide.subtitle}
                  </p>
                  <Link
                    to="/products"
                    className="inline-flex items-center px-8 py-3 bg-florist-500 text-white font-semibold rounded-md hover:bg-florist-600 transition-colors"
                  >
                    {slide.cta}
                    <ArrowRight className="ml-2" size={20} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 p-2 rounded-full hover:bg-opacity-100 transition-all"
        >
          <ChevronRight size={24} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white bg-opacity-50'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our diverse collection of flowers and arrangements for every occasion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {randomCategories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${(category.categoryId ?? category.id ?? '').toString()}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all">
                  {category.image ? (
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-florist-100 to-florist-200 flex items-center justify-center">
                      <Flower size={64} className="text-florist-600" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-40 transition-all"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                      <p className="text-sm opacity-90">{category.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/categories"
              className="inline-flex items-center px-6 py-3 border border-florist-500 text-florist-500 font-semibold rounded-md hover:bg-florist-500 hover:text-white transition-colors"
            >
              View More Categories
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Featured Products
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our most popular and beautiful flower arrangements
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-florist-500 text-florist-500 font-semibold rounded-md hover:bg-florist-500 hover:text-white transition-colors"
            >
              View All Products
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-florist-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose YourFlorist?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're committed to providing the best flower experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-florist-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Premium Quality
              </h3>
              <p className="text-gray-600">
                We source only the finest flowers from trusted growers
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-florist-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Same Day Delivery
              </h3>
              <p className="text-gray-600">
                Get fresh flowers delivered to your door on the same day
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-florist-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Expert Arrangements
              </h3>
              <p className="text-gray-600">
                Beautiful arrangements crafted by our expert florists
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 