import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { Product, BouquetData, BouquetComposition, Feedback } from '../types';
import { formatCurrency } from '../utils/currency';
import { ShoppingCart, Star, Truck, Shield, RefreshCw, Flower, Plus, Minus } from 'lucide-react';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [bouquetData, setBouquetData] = useState<BouquetData | null>(null);
  const [compositions, setCompositions] = useState<BouquetComposition[]>([]);
  const [basePrice, setBasePrice] = useState<number>(0);
  const [customPrice, setCustomPrice] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Feedback state for display only
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  const avgRating = feedbacks.length ? feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbacks.length : 0;

  // Calculate custom price based on basePrice and composition deltas
  const recalcCustomPrice = (currentCompositions: BouquetComposition[], currentBasePrice: number) => {
    const delta = currentCompositions.reduce((sum, comp) => {
      const unit = comp.unitPrice ?? comp.flower?.price ?? 0;
      const defQty = comp.defaultQuantity ?? comp.quantity; // default to initial if not set
      return sum + (comp.quantity - defQty) * unit;
    }, 0);
    const price = Math.max(0, Number((currentBasePrice + delta).toFixed(2)));
    setCustomPrice(price);
    // Keep product state in sync for cart add
    setProduct(prev => prev ? { ...prev, price } : prev);
  };



  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Try to fetch as bouquet first
        try {
          const bouquetData = await apiService.getBouquetById(id);
          setBouquetData(bouquetData);
          setBasePrice(bouquetData.price ?? 0);
          
          // Map bouquet data to Product type for compatibility
          const mappedProduct: Product = {
            id: bouquetData.id.toString(),
            name: bouquetData.name,
            description: bouquetData.description,
            price: bouquetData.price,
            image: bouquetData.imageUrl,
            imageUrl: bouquetData.imageUrl,
            category: bouquetData.category.name,
            inStock: bouquetData.isActive,
            quantity: 1, // Default quantity for bouquets
            tags: [],
            isActive: bouquetData.isActive,
            compositions: bouquetData.compositions,
          };
          setProduct(mappedProduct);

          // Enrich compositions with flower unit prices
          const enriched = await Promise.all(
            (bouquetData.compositions || []).map(async (c) => {
              try {
                const flower = await apiService.getFlowerById(c.flowerId);
                const minQ = Number(c.minQuantity ?? c.quantity ?? 0);
                return { ...c, flower, unitPrice: flower.price, defaultQuantity: minQ, quantity: minQ } as any;
              } catch (e) {
                const minQ = Number(c.minQuantity ?? c.quantity ?? 0);
                return { ...c, unitPrice: 0, defaultQuantity: minQ, quantity: minQ } as any;
              }
            })
          );
          setCompositions(enriched);
          recalcCustomPrice(enriched, bouquetData.price ?? 0);

          // Load active feedbacks for this bouquet
          const fbPaged = await apiService.getActiveFeedbacksByBouquet(bouquetData.id);
          console.log('Raw feedback response:', fbPaged);
          console.log('Feedback content:', fbPaged?.content);
          setFeedbacks(fbPaged?.content || []);


        } catch (bouquetError) {
          // If bouquet fetch fails, try regular product
          console.log('Bouquet fetch failed, trying regular product:', bouquetError);
          const productData = await apiService.getProduct(id);
          const mappedProduct = {
            id: productData.id?.toString() || '',
            name: productData.name,
            description: productData.description,
            price: productData.price || 0,
            image: productData.image || '',
            category: productData.category || '',
            inStock: productData.inStock ?? true,
            quantity: productData.quantity || 1,
            tags: productData.tags || [],
          };
          setProduct(mappedProduct);
          setCustomPrice(mappedProduct.price || 0);
          setBasePrice(mappedProduct.price || 0);

          // Non-bouquet products have no compositions
          setCompositions([]);
          // No review eligibility resolution for non-bouquet items
        }
        
        // Related products placeholder
        setRelatedProducts([]);
      } catch (err) {
        setError('Failed to load product details');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart({ ...product, price: customPrice }, quantity);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleImageChange = (index: number) => {
    setSelectedImage(index);
  };

  const updateCompositionQuantity = (compId: number, nextQty: number) => {
    setCompositions((prev) => {
      const updated = prev.map((c) => {
        if (c.id !== compId) return c;
        const clamped = Math.max(c.minQuantity, Math.min(c.maxQuantity, nextQty));
        return { ...c, quantity: clamped };
      });
      recalcCustomPrice(updated, basePrice);
      return updated;
    });
  };



  // Product images - using the main product image for all views
  const productImages = product ? [product.image || product.imageUrl || ''] : [''];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-florist-500"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The product you are looking for does not exist.'}</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-florist-500 text-white px-6 py-2 rounded-lg hover:bg-florist-600 transition-colors"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-florist-500">Home</button>
          <span>/</span>
          <button onClick={() => navigate('/products')} className="hover:text-florist-500">Products</button>
          <span>/</span>
          <button onClick={() => navigate(`/categories`)} className="hover:text-florist-500">
            {typeof product.category === 'string' ? product.category : product.category.name}
          </button>
          <span>/</span>
          <span className="text-gray-800">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative">
              <img
                src={productImages[selectedImage]}
                alt={product.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="flex space-x-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleImageChange(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === index ? 'border-florist-500' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={`${i < Math.round(avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">({feedbacks.length} reviews)</span>
              </div>
              <p className="text-2xl font-bold text-florist-600">{formatCurrency(customPrice)}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Category</h3>
              <span className="inline-block bg-florist-100 text-florist-800 px-3 py-1 rounded-full text-sm">
                {typeof product.category === 'string' ? product.category : product.category.name}
              </span>
            </div>

            {/* Bouquet Compositions (init at min; user can adjust within limits) */}
            {bouquetData && compositions && compositions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Flower Composition</h3>
                <div className="space-y-3">
                  {compositions.map((composition) => {
                    const unit = composition.unitPrice ?? composition.flower?.price ?? 0;
                    const canDecrease = composition.quantity > composition.minQuantity;
                    const canIncrease = composition.quantity < composition.maxQuantity;
                    return (
                      <div key={composition.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-florist-100 rounded-full flex items-center justify-center">
                            <Flower size={16} className="text-florist-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{composition.flower?.name || `Flower #${composition.flowerId}`}</p>
                            <p className="text-xs text-gray-500">
                              {formatCurrency(unit)} each • Min {composition.minQuantity} • Max {composition.maxQuantity}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateCompositionQuantity(composition.id, composition.quantity - 1)}
                            disabled={!canDecrease}
                            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-40"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center">{composition.quantity}</span>
                          <button
                            onClick={() => updateCompositionQuantity(composition.id, composition.quantity + 1)}
                            disabled={!canIncrease}
                            className="p-1 rounded-md hover:bg-gray-100 disabled:opacity-40"
                          >
                            <Plus size={16} />
                          </button>
                          <span className="text-sm text-gray-700 w-24 text-right">{formatCurrency(unit * composition.quantity)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Add to cart */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quantity</h3>
              <div className="flex items-center space-x-4">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="px-3 py-2 text-gray-600 hover:text-gray-800"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {product.quantity} available
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full bg-florist-500 text-white py-3 px-6 rounded-lg hover:bg-florist-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart size={20} />
                <span>{product.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
              </button>
            </div>

            {/* Feedback section */}
            <div className="pt-6 border-t border-gray-200 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Customer Reviews</h3>
              {feedbacks.length > 0 ? (
                <div className="space-y-3">
                  {feedbacks.map((fb) => {
                    console.log('Feedback object:', fb);
                    console.log('Feedback createdAt:', fb.createdAt, 'Type:', typeof fb.createdAt);
                    const userName = fb.userName || `User ${fb.userId}`;
                    // Default to today's date; replace if a valid createdAt exists
                    let createdAt = new Date().toLocaleDateString();
                    if (fb.createdAt) {
                      try {
                        const date = new Date(fb.createdAt);
                        if (!isNaN(date.getTime())) {
                          createdAt = date.toLocaleDateString();
                        } else {
                          console.warn('Invalid date value for feedback:', fb.createdAt);
                        }
                      } catch (error) {
                        console.warn('Invalid date format for feedback:', fb.createdAt, error);
                      }
                    } else {
                      console.warn('No createdAt field for feedback; using today as fallback:', fb);
                    }
                    
                    return (
                      <div key={fb.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={14} className={`${i < fb.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                            <span className="text-sm text-gray-700">{userName}</span>
                            {!fb.userName && (
                              <span className="text-xs text-gray-500">(Backend needs to populate user names)</span>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">{createdAt}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">{fb.comment}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No reviews yet.</p>
              )}

              {/* Reviews can be submitted from the Orders page */}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Truck size={20} className="text-florist-500" />
                <span className="text-sm text-gray-600">Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield size={20} className="text-florist-500" />
                <span className="text-sm text-gray-600">Secure Payment</span>
              </div>
              <div className="flex items-center space-x-2">
                <RefreshCw size={20} className="text-florist-500" />
                <span className="text-sm text-gray-600">Easy Returns</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/product/${relatedProduct.id}`)}
                >
                  <img
                    src={relatedProduct.image || relatedProduct.imageUrl || ''}
                    alt={relatedProduct.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">{relatedProduct.name}</h3>
                    <p className="text-florist-600 font-bold">${relatedProduct.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;