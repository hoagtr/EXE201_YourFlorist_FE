import React, { useState } from 'react';
import { formatCurrency } from '../utils/currency';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { User, MapPin, Phone, Mail, Home, Building, Globe, Hash } from 'lucide-react';
import { apiService } from '../services/api';

interface CheckoutForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { items, getTotalPrice, getShippingCost, getTaxAmount, getTotalWithFees, clearCart, promotionId, promotionCode, discountPercentage, setPromotion, getDiscountAmount, getTotalAfterDiscount } = useCart();
  const { user } = useAuth();

  const [formData, setFormData] = useState<CheckoutForm>({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    phone: user?.phone || '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);

  const applyPromotion = async () => {
    setPromoError(null);
    try {
      const code = promoInput.trim();
      if (!code) {
        setPromotion(null);
        return;
      }
      const promo = await apiService.getPromotionByCode(code);
      if (!promo || promo.isActive === false) {
        throw new Error('Invalid or inactive code');
      }
      setPromotion({ id: promo.id, code: promo.code, discountPercentage: promo.discountPercentage });
    } catch (err: any) {
      setPromotion(null);
      setPromoError(err?.message || 'Invalid promotion code');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Build backend order payload according to POST /orders contract
      const payload: any = {
        userId: Number(user?.id),
        promotionId: promotionId ?? null,
        totalPrice: Number((getTotalAfterDiscount() + getShippingCost() + getTaxAmount()).toFixed(2)),
        shippingAddress: `${formData.street}, ${formData.city}, ${formData.state}, ${formData.zipCode}, ${formData.country}`,
        createdAt: new Date().toISOString(),
        orderItems: items.map((item) => ({
          bouquetId: Number(item.product.id),
          quantity: item.quantity,
          subTotal: Number((item.product.price * item.quantity).toFixed(2)),
          isActive: true,
          orderBouquetFlowers: [] as any[],
        }))
      };

      const created = await apiService.placeOrder(payload);
      const orderId = created?.id || created?.orderId;
      if (orderId) {
        try {
          const checkoutUrl = await apiService.startPayment(orderId);
          if (checkoutUrl) {
            window.location.assign(checkoutUrl);
            return; // stop further processing; browser will navigate
          }
        } catch (payErr) {
          console.error('Start payment failed:', payErr);
        }
      }

      // Optional: store local receipt for review eligibility as before
      if (user) {
        const key = `purchases:${user.id}`;
        const existing: any[] = JSON.parse(localStorage.getItem(key) || '[]');
        const now = Date.now();
        const newItems = items.map((item, idx) => ({
          orderItemId: Number(`${now}${idx}`),
          bouquetId: typeof item.product.id === 'string' ? parseInt(item.product.id as string, 10) || item.product.id : (item.product.id as number),
          productId: item.product.id,
          quantity: item.quantity,
          createdAt: new Date().toISOString()
        }));
        localStorage.setItem(key, JSON.stringify([...existing, ...newItems]));
      }

      clearCart();
      navigate('/checkout/success');
    } catch (error) {
      console.error('Checkout error:', error);
      navigate('/checkout/fail');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Add some items to your cart before checking out.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-florist-500 text-white px-6 py-3 rounded-md hover:bg-florist-600 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-medium text-gray-900 mb-8">Order Summary</h2>
            <div className="border-t border-gray-200 py-6">
              {items.map((item) => (
                <div key={item.product.id} className="flex py-6">
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                    <img
                      src={item.product.image || item.product.imageUrl || ''}
                      alt={item.product.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex flex-1 flex-col">
                    <div>
                      <div className="flex justify-between text-base font-medium text-gray-900">
                        <h3>{item.product.name}</h3>
                        <p className="ml-4">{formatCurrency(item.product.price * item.quantity)}</p>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {typeof item.product.category === 'string' ? item.product.category : item.product.category.name}
                      </p>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{item.product.description}</p>
                      <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t border-gray-200 py-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Subtotal</p>
                  <p>{formatCurrency(getTotalPrice())}</p>
                </div>
                {(discountPercentage ?? 0) > 0 && (
                  <div className="flex justify-between text-base font-medium text-gray-900 mt-2 text-green-600">
                    <p>Discount ({discountPercentage}%{promotionCode ? ` · ${promotionCode}` : ''})</p>
                    <p>-{formatCurrency(getDiscountAmount())}</p>
                  </div>
                )}
                <div className="flex justify-between text-base font-medium text-gray-900 mt-2">
                  <p>Subtotal after discount</p>
                  <p>{formatCurrency(getTotalAfterDiscount())}</p>
                </div>
                <div className="flex justify-between text-base font-medium text-gray-900 mt-2">
                  <p>Shipping</p>
                  <p>{formatCurrency(getShippingCost())}</p>
                </div>
                <div className="flex justify-between text-base font-medium text-gray-900 mt-2">
                  <p>Tax</p>
                  <p>{formatCurrency(getTaxAmount())}</p>
                </div>
                <div className="flex justify-between text-lg font-medium text-gray-900 mt-4 pt-4 border-t border-gray-200">
                  <p>Total</p>
                  <p>{formatCurrency(getTotalAfterDiscount() + getShippingCost() + getTaxAmount())}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="mt-10 lg:col-span-1 lg:mt-0">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Promotion Code */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Promotion</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Enter promo code"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-florist-500"
                  />
                  <button type="button" onClick={applyPromotion} className="px-4 py-2 bg-florist-500 text-white rounded-md hover:bg-florist-600">Apply</button>
                  {(discountPercentage ?? 0) > 0 && (
                    <button type="button" onClick={() => setPromotion(null)} className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800">Remove</button>
                  )}
                </div>
                {promoError && <p className="text-sm text-red-600 mt-2">{promoError}</p>}
                {(discountPercentage ?? 0) > 0 && (
                  <p className="text-sm text-green-700 mt-2">Applied {promotionCode} for {discountPercentage}% off.</p>
                )}
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-florist-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-florist-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
                    <p className="text-sm text-gray-500">Tell us about yourself</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-florist-500 focus:border-florist-500 sm:text-sm transition-colors"
                        placeholder="Enter first name"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-florist-500 focus:border-florist-500 sm:text-sm transition-colors"
                        placeholder="Enter last name"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-florist-500 focus:border-florist-500 sm:text-sm transition-colors"
                        placeholder="Enter email address"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-florist-500 focus:border-florist-500 sm:text-sm transition-colors"
                        placeholder="Enter phone number"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-florist-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-florist-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>
                    <p className="text-sm text-gray-500">Where should we deliver your order?</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                      Street address
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="street"
                        id="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-florist-500 focus:border-florist-500 sm:text-sm transition-colors"
                        placeholder="Enter street address"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Home className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="city"
                        id="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-florist-500 focus:border-florist-500 sm:text-sm transition-colors"
                        placeholder="Enter city"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                      State / Province
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="state"
                        id="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-florist-500 focus:border-florist-500 sm:text-sm transition-colors"
                        placeholder="Enter state"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP / Postal code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="zipCode"
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-florist-500 focus:border-florist-500 sm:text-sm transition-colors"
                        placeholder="Enter ZIP code"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Hash className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="country"
                        id="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-florist-500 focus:border-florist-500 sm:text-sm transition-colors"
                        placeholder="Enter country"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-florist-500 border border-transparent rounded-lg shadow-sm py-4 px-6 text-base font-semibold text-white hover:bg-florist-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-florist-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02]"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Processing...
                    </div>
                  ) : (
                    `Proceed to Payment - ${formatCurrency(getTotalAfterDiscount() + getShippingCost() + getTaxAmount())}`
                  )}
                </button>
                <p className="mt-3 text-sm text-gray-500 text-center">
                  You will be redirected to our secure payment partner to complete your order.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
