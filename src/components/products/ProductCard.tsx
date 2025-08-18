import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { apiService } from '../../services/api';
import { formatCurrency } from '../../utils/currency';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [avgRating, setAvgRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  useEffect(() => {
    const loadRating = async () => {
      try {
        const bouquetId = Number(product.id);
        if (Number.isNaN(bouquetId)) return;
        const paged = await apiService.getActiveFeedbacksByBouquet(bouquetId, 0, 50, 'createdAt', 'desc');
        const list = paged?.content || [];
        const count = list.length;
        if (count === 0) {
          setAvgRating(0);
          setRatingCount(0);
          return;
        }
        const avg = list.reduce((sum: number, f: any) => sum + (Number(f.rating) || 0), 0) / count;
        setAvgRating(avg);
        setRatingCount(count);
      } catch (e) {
        setAvgRating(0);
        setRatingCount(0);
      }
    };
    loadRating();
  }, [product.id]);

  return (
    <div className="group bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300 overflow-hidden">
      <Link to={`/product/${product.id}`} className="block">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={product.image || product.imageUrl || ''}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Product Info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500 capitalize">
              {typeof product.category === 'string' ? product.category : product.category.name}
            </span>
            {ratingCount > 0 && (
              <div className="flex items-center space-x-1">
                <Star size={14} className="text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-gray-500">({ratingCount})</span>
              </div>
            )}
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-florist-600 transition-colors">
            {product.name}
          </h3>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">{formatCurrency(product.price)}</span>
            
            <button
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="p-2 bg-florist-500 text-white rounded-full hover:bg-florist-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard; 