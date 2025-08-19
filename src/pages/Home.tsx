import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight, Star, Flower, Search, Truck, ShieldCheck, PhoneCall, Sparkles, Heart, Tag } from 'lucide-react';
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
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<Array<{ id?: number; rating: number; comment: string; userName: string; bouquetName: string }>>([]);

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
        setRandomCategories(shuffled.slice(0, Math.min(4, shuffled.length)));
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

  // After featured products load, fetch recent feedbacks to display as testimonials
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const shuffledProducts = [...featuredProducts].sort(() => Math.random() - 0.5);
        const top = shuffledProducts.slice(0, 5);
        if (top.length === 0) {
          setTestimonials([]);
          return;
        }
        const pages = await Promise.all(
          top.map((p) => apiService.getActiveFeedbacksByBouquet(Number(p.id), 0, 5, 'createdAt', 'desc'))
        );
        const combined: Array<{ id?: number; rating: number; comment: string; userName: string; bouquetName: string }> = [];
        pages.forEach((pg: any, idx: number) => {
          const list = (pg && pg.content) || [];
          list.forEach((f: any) => {
            combined.push({
              id: f.id,
              rating: Number(f.rating) || 0,
              comment: f.comment || '',
              userName: f.userName || 'Anonymous',
              bouquetName: top[idx]?.name || 'Bouquet',
            });
          });
        });
        const randomized = combined.sort(() => Math.random() - 0.5);
        setTestimonials(randomized.slice(0, 3));
      } catch (e) {
        setTestimonials([]);
      }
    };
    loadTestimonials();
  }, [featuredProducts]);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) {
      navigate('/products');
      return;
    }
    navigate(`/products?keyword=${encodeURIComponent(query)}`);
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
      <section className="relative h-[70vh] min-h-[520px] overflow-hidden">
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
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/40"></div>
              <div className="absolute inset-0">
                <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
                  <div className="text-white max-w-2xl">
                    <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur px-3 py-1 rounded-full mb-4">
                      <Sparkles size={16} />
                      <span className="text-sm">Fresh. Handpicked. Delivered fast.</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
                      {slide.title}
                    </h1>
                    <p className="text-lg md:text-2xl mb-6 opacity-90">
                      {slide.subtitle}
                    </p>
                    <form onSubmit={onSearchSubmit} className="mb-4">
                      <div className="relative max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-11 pr-36 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-florist-400"
                          placeholder="Search bouquets, roses, lilies..."
                        />
                        <button
                          type="submit"
                          className="absolute right-1 top-1/2 -translate-y-1/2 px-4 py-2 bg-florist-500 text-white rounded-md hover:bg-florist-600 transition-colors"
                        >
                          Search
                        </button>
                      </div>
                    </form>
                    <div className="flex items-center gap-3">
                      <Link
                        to="/products"
                        className="inline-flex items-center px-6 py-3 bg-florist-500 text-white font-semibold rounded-md hover:bg-florist-600 transition-colors"
                      >
                        {slide.cta}
                        <ArrowRight className="ml-2" size={20} />
                      </Link>
                      <Link
                        to="/categories"
                        className="inline-flex items-center px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-md transition-colors"
                      >
                        Browse Categories
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-all shadow"
        >
          <ChevronLeft size={24} />
        </button>
        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white transition-all shadow"
        >
          <ChevronRight size={24} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentSlide ? 'bg-white' : 'bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Promo strip */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-florist-100 text-florist-600 flex items-center justify-center">
              <Truck size={18} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Same-day delivery</p>
              <p className="text-sm text-gray-600">Order before 2pm</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-florist-100 text-florist-600 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Freshness guarantee</p>
              <p className="text-sm text-gray-600">Handpicked & inspected</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-florist-100 text-florist-600 flex items-center justify-center">
              <PhoneCall size={18} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">Personal support</p>
              <p className="text-sm text-gray-600">We’re here to help</p>
            </div>
          </div>
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

          <div className="-mx-4 px-4">
            <div className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory">
              {randomCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${(category.categoryId ?? category.id ?? '').toString()}`}
                  className="group block min-w-[280px] snap-start"
                >
                  <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-56 bg-gradient-to-br from-florist-100 to-florist-200 flex items-center justify-center">
                        <Flower size={64} className="text-florist-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors"></div>
                    <div className="absolute inset-x-0 bottom-0 p-4">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-white" />
                        <h3 className="text-lg font-semibold text-white">{category.name}</h3>
                      </div>
                      {category.description && (
                        <p className="text-white/90 text-sm mt-1 line-clamp-2">{category.description}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
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
            <div className="inline-flex items-center gap-2 bg-florist-50 text-florist-700 px-3 py-1 rounded-full mb-3">
              <Heart size={16} />
              <span className="text-sm font-medium">This week’s picks</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Featured bouquets</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Our most popular and beautiful flower arrangements</p>
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

      {/* Trust / Features Section */
      }
      <section className="py-16 bg-florist-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why choose YourFlorist?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">We're committed to providing the best flower experience</p>
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
                <Truck className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Same-day delivery</h3>
              <p className="text-gray-600">Get fresh flowers delivered to your door on the same day</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-florist-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Satisfaction guaranteed</h3>
              <p className="text-gray-600">Beautiful arrangements crafted by our expert florists</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Loved by our customers</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">Real words from people who sent smiles with flowers</p>
          </div>
          {testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <div key={t.id ?? idx} className="p-6 border border-gray-200 rounded-xl shadow-sm bg-white">
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} className={i < Math.round(t.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
                    ))}
                  </div>
                  <p className="text-gray-700">“{t.comment || 'Great bouquet!'}”</p>
                  <p className="mt-3 text-xs text-gray-500">Bouquet: {t.bouquetName}</p>
                  <p className="mt-2 text-sm text-gray-500">— {t.userName}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 border border-gray-200 rounded-xl shadow-sm bg-white">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className={i < 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
                  ))}
                </div>
                <p className="text-gray-700">“The bouquet was stunning and delivered right on time. It made my sister’s day!”</p>
                <p className="mt-2 text-sm text-gray-500">— Emily R.</p>
              </div>
              <div className="p-6 border border-gray-200 rounded-xl shadow-sm bg-white">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className={i < 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
                  ))}
                </div>
                <p className="text-gray-700">“Fresh flowers that lasted more than a week. Will definitely order again.”</p>
                <p className="mt-2 text-sm text-gray-500">— Daniel K.</p>
              </div>
              <div className="p-6 border border-gray-200 rounded-xl shadow-sm bg-white">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={16} className={i < 5 ? 'text-yellow-400 fill-current' : 'text-gray-300'} />
                  ))}
                </div>
                <p className="text-gray-700">“Beautiful arrangements and super helpful customer service. 10/10.”</p>
                <p className="mt-2 text-sm text-gray-500">— Mai L.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-br from-florist-100 to-florist-200 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Get 10% off your first order</h3>
              <p className="text-gray-700">Join our newsletter for exclusive deals and seasonal picks.</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); }} className="w-full md:w-auto">
              <div className="flex w-full md:min-w-[420px] bg-white rounded-lg shadow-sm overflow-hidden">
                <input type="email" required placeholder="Your email address" className="flex-1 px-4 py-3 outline-none" />
                <button type="submit" className="px-5 bg-florist-500 text-white font-semibold hover:bg-florist-600 transition-colors">Subscribe</button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home; 