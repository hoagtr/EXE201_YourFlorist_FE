import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Category, Product } from '../types';
import { Flower, ArrowRight, Search } from 'lucide-react';

const Categories: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch categories first (this should work without authentication)
        const categoriesData = await apiService.getCategories(debouncedSearchTerm);
        setCategories(categoriesData);
        
        // Fetch active bouquets so we can count per-category items
        try {
          const bouquets = await apiService.getActiveBouquets();
          setProducts(bouquets);
        } catch (productsErr) {
          console.warn('Failed to fetch bouquets for category counts:', productsErr);
        }
      } catch (err) {
        setError('Failed to load categories');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [debouncedSearchTerm]);

  const getProductCount = (categoryId: number | string | undefined) => {
    if (!products || products.length === 0 || categoryId === undefined || categoryId === null) {
      return 0;
    }
    const idStr = categoryId.toString();
    return products.filter(product => {
      if (typeof product.category === 'string') return false;
      const prodCatId = product.category?.categoryId?.toString();
      return prodCatId === idStr;
    }).length;
  };

  const filteredCategories = categories
    .filter(category => category.isActive !== false) // Only show active categories
    .filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-florist-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Error Loading Categories</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-florist-500 text-white px-6 py-2 rounded-lg hover:bg-florist-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Browse Categories</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our beautiful collection of flowers and arrangements organized by category
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-florist-500 focus:border-transparent"
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-florist-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map((category) => (
            <div
              key={category.id || category.categoryId}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(`/products?category=${encodeURIComponent((category.categoryId ?? '').toString())}`)}
            >
              <div className="relative">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-florist-100 to-florist-200 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Flower size={64} className="text-florist-600" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all"></div>
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-full px-3 py-1 text-sm font-semibold text-gray-800">
                  {getProductCount(category.categoryId ?? '')} items
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                  <ArrowRight 
                    size={20} 
                    className="text-florist-500 group-hover:translate-x-1 transition-transform" 
                  />
                </div>
                <p className="text-gray-600 mb-4 line-clamp-2">{category.description}</p>
                <button className="text-florist-500 font-semibold hover:text-florist-600 transition-colors">
                  Browse {category.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Flower size={64} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No categories found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? `No categories match "${searchTerm}"` : 'No categories available'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="bg-florist-500 text-white px-6 py-2 rounded-lg hover:bg-florist-600 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Featured Categories Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Popular Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.slice(0, 4).map((category) => (
              <div
                key={category.id || category.categoryId}
                className="text-center group cursor-pointer"
                onClick={() => navigate(`/products?category=${encodeURIComponent((category.categoryId ?? '').toString())}`)}
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-florist-100 rounded-full flex items-center justify-center group-hover:bg-florist-200 transition-colors">
                  <Flower size={32} className="text-florist-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600">{getProductCount(category.categoryId ?? '')} products</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-florist-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Can't find what you're looking for?</h3>
          <p className="text-gray-600 mb-6">
            Browse all our products or contact us for custom arrangements
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/products')}
              className="bg-florist-500 text-white px-6 py-3 rounded-lg hover:bg-florist-600 transition-colors"
            >
              Browse All Products
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="border border-florist-500 text-florist-500 px-6 py-3 rounded-lg hover:bg-florist-50 transition-colors"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories; 