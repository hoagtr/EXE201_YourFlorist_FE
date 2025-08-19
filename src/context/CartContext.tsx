import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getShippingCost: () => number;
  getTaxAmount: () => number;
  getTotalWithFees: () => number;
  // Promotions
  promotionId?: number | null;
  promotionCode?: string | null;
  discountPercentage?: number;
  setPromotion: (promo: { id: number; code: string; discountPercentage: number } | null) => void;
  getDiscountAmount: () => number;
  getTotalAfterDiscount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [promotionId, setPromotionId] = useState<number | null>(null);
  const [promotionCode, setPromotionCode] = useState<string | null>(null);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // Persist promotion in localStorage
  useEffect(() => {
    const data = promotionId ? { promotionId, promotionCode, discountPercentage } : null;
    localStorage.setItem('cart_promotion', JSON.stringify(data));
  }, [promotionId, promotionCode, discountPercentage]);

  // Load promotion on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem('cart_promotion');
      if (raw) {
        const data = JSON.parse(raw);
        if (data && typeof data.discountPercentage === 'number') {
          setPromotionId(data.promotionId ?? null);
          setPromotionCode(data.promotionCode ?? null);
          setDiscountPercentage(data.discountPercentage ?? 0);
        }
      }
    } catch {}
  }, []);

  const addToCart = (product: Product, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id.toString() === product.id.toString());
      
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id.toString() === product.id.toString()
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string | number) => {
    const idString = productId.toString();
    setItems(prevItems => prevItems.filter(item => item.product.id.toString() !== idString));
  };

  const updateQuantity = (productId: string | number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    const idString = productId.toString();
    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id.toString() === idString
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getShippingCost = () => {
    return items.length > 0 ? 9.99 : 0;
  };

  const getTaxAmount = () => {
    return getTotalPrice() * 0.08; // 8% tax rate
  };

  const getTotalWithFees = () => {
    return getTotalPrice() + getShippingCost() + getTaxAmount();
  };

  const getDiscountAmount = () => {
    const subtotal = getTotalPrice();
    return Math.max(0, Math.round((subtotal * discountPercentage) / 100));
  };

  const getTotalAfterDiscount = () => {
    const subtotal = getTotalPrice();
    const discount = getDiscountAmount();
    return Math.max(0, subtotal - discount);
  };

  const setPromotion = (promo: { id: number; code: string; discountPercentage: number } | null) => {
    if (!promo) {
      setPromotionId(null);
      setPromotionCode(null);
      setDiscountPercentage(0);
      return;
    }
    setPromotionId(promo.id);
    setPromotionCode(promo.code);
    setDiscountPercentage(promo.discountPercentage);
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getShippingCost,
    getTaxAmount,
    getTotalWithFees,
    promotionId,
    promotionCode,
    discountPercentage,
    setPromotion,
    getDiscountAmount,
    getTotalAfterDiscount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 