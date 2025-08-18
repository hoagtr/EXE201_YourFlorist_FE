import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { formatCurrency } from '../utils/currency';
import { Order, DeliveryHistory, Feedback } from '../types';
import { Package, DollarSign, MapPin, Truck, CheckCircle, Clock, AlertCircle, XCircle, RefreshCcw, Star, User } from 'lucide-react';

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [historiesByOrder, setHistoriesByOrder] = useState<Record<string, DeliveryHistory[]>>({});
  const [ratings, setRatings] = useState<Record<string, { rating: number; comment: string; submitted: boolean }>>({});
  const [showRatingForm, setShowRatingForm] = useState<Record<string, boolean>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, Feedback[]>>({});

  const loadOrders = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const uid = isNaN(Number(user.id)) ? user.id : Number(user.id);
      const params: any = {};
      if (statusFilter) params.status = statusFilter as any;
      const list = await apiService.getUserOrders(uid as any, params);
      console.log('Orders response:', list);
      
      // Check if orders have items, if not, fetch details for each
      const ordersWithDetails = await Promise.all(
        list.map(async (order: any) => {
          if (!order.items || order.items.length === 0) {
            try {
              console.log(`Fetching details for order ${order.id}`);
              const detailedOrder = await apiService.getOrderWithDetails(order.id);
              console.log(`Order ${order.id} details:`, detailedOrder);
              return detailedOrder;
            } catch (e) {
              console.warn(`Failed to fetch details for order ${order.id}:`, e);
              return order;
            }
          }
          return order;
        })
      );
      
      setOrders(ordersWithDetails);
      
      // Load feedbacks for all orders in parallel
      await loadFeedbacksForOrders(ordersWithDetails);
      
      // fire-and-forget load of histories
      loadHistories();
      setError(null);
    } catch (err) {
      console.error('Error fetching orders (with params). Retrying without filters...', err);
      try {
        const uid = isNaN(Number(user.id)) ? user.id : Number(user.id);
        const list = await apiService.getUserOrders(uid as any);
        console.log('Orders fallback response:', list);
        
        // Same fallback logic for items
        const ordersWithDetails = await Promise.all(
          list.map(async (order: any) => {
            if (!order.items || order.items.length === 0) {
              try {
                return await apiService.getOrderWithDetails(order.id);
              } catch (e) {
                console.warn(`Failed to fetch details for order ${order.id}:`, e);
                return order;
              }
            }
            return order;
          })
        );
        
        setOrders(ordersWithDetails);
        await loadFeedbacksForOrders(ordersWithDetails);
        setError(null);
      } catch (err2) {
        setError('Failed to load orders');
        console.error('Error fetching orders:', err2);
      }
    } finally {
      setLoading(false);
    }
  }, [user, statusFilter]);

  const loadFeedbacksForOrders = async (ordersList: Order[]) => {
    const feedbacksMap: Record<string, Feedback[]> = {};
    
    for (const order of ordersList) {
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          const bouquetId = item.bouquetId || item.product?.id;
          if (bouquetId) {
            try {
              const feedbacks = await apiService.getActiveFeedbacksByBouquet(Number(bouquetId), 0, 10);
              const key = `${order.id}-${item.id}`;
              feedbacksMap[key] = feedbacks.content || [];
            } catch (e) {
              console.warn(`Failed to load feedbacks for bouquet ${bouquetId}:`, e);
            }
          }
        }
      }
    }
    
    setFeedbacks(feedbacksMap);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [user, navigate, statusFilter, loadOrders]);

  const confirmDelivered = async (orderId: string | number) => {
    try {
      await apiService.confirmCustomerStatus(orderId, 'DELIVERED', 'Customer confirmed delivery');
      await loadOrders();
    } catch (e) {
      console.error('Confirm delivery failed', e);
    }
  };

  const handleRatingSubmit = async (orderId: string | number, itemId: string | number, rating: number, comment: string) => {
    try {
      console.log('Looking for order with ID:', orderId);
      console.log('Looking for item with ID:', itemId);
      console.log('All orders:', orders);
      
      const order = orders.find(o => o.id === orderId);
      console.log('Found order:', order);
      console.log('Order items:', order?.items);
      
      const item = order?.items?.find(i => i.id === itemId || (i as any).orderItemId === itemId);
      console.log('Found item for rating:', item);
      console.log('Item structure:', JSON.stringify(item, null, 2));
      console.log('User ID:', user?.id);
      console.log('Order ID:', orderId);
      console.log('Item ID:', itemId);
      
      // Check all possible fields where bouquetId might be stored
      const possibleBouquetId = item?.bouquetId || item?.product?.id;
      console.log('Item object keys:', Object.keys(item || {}));
      console.log('Item.bouquetId:', item?.bouquetId);
      console.log('Item.product:', item?.product);
      console.log('Item.product.id:', item?.product?.id);
      console.log('Possible bouquet ID fields:', {
        bouquetId: item?.bouquetId,
        'product.id': item?.product?.id,
        selected: possibleBouquetId
      });
      
      // Validate all required fields
      if (!user?.id) {
        alert('User ID not found. Please log in again.');
        return;
      }
      
      if (!possibleBouquetId) {
        console.error('No valid product/bouquet ID found:', item);
        alert('Unable to submit rating: Product ID not found.');
        return;
      }
      
      if (!rating || rating < 1 || rating > 5) {
        alert('Please select a valid rating (1-5 stars).');
        return;
      }
      
      const payload = {
        userId: Number(user.id),
        bouquetId: Number(possibleBouquetId),
        orderItemId: Number(itemId),
        rating,
        comment: comment.trim(),
        isActive: true
      };
      
      console.log('Submitting feedback with payload:', payload);
      
      // Double-check that no values are null/undefined
      if (Object.values(payload).some(val => val === null || val === undefined)) {
        console.error('Payload contains null/undefined values:', payload);
        alert('Invalid data: Some required fields are missing.');
        return;
      }
      
      await apiService.createFeedback(payload);
      
      // Update local state
      const ratingKey = `${orderId}-${itemId}`;
      setRatings(prev => ({
        ...prev,
        [ratingKey]: { rating, comment, submitted: true }
      }));
      setShowRatingForm(prev => ({
        ...prev,
        [ratingKey]: false
      }));
      
      // Reload feedbacks for this item
      await loadFeedbacksForOrders(orders);
      
      // Show success message
      alert('Thank you for your feedback!');
    } catch (error: any) {
      console.error('Failed to submit rating:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // More detailed error message
      if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || 'Invalid data provided';
        alert(`Rating submission failed: ${errorMessage}`);
      } else if (error.response?.status === 401) {
        alert('Please log in again to submit ratings.');
      } else if (error.response?.status === 403) {
        alert('You are not authorized to submit ratings for this product.');
      } else {
        alert('Failed to submit rating. Please try again.');
      }
    }
  };

  const toggleRatingForm = (orderId: string | number, itemId: string | number) => {
    const ratingKey = `${orderId}-${itemId}`;
    console.log('Toggle rating form:', { orderId, itemId, ratingKey });
    console.log('Current showRatingForm state:', showRatingForm);
    
    setShowRatingForm(prev => {
      const newState = {
        ...prev,
        [ratingKey]: !prev[ratingKey]
      };
      console.log('New showRatingForm state:', newState);
      return newState;
    });
  };

  const loadHistories = async () => {
    if (!user) return;
    try {
      const paged = await apiService.getUserDeliveryHistories(user.id, {
        status: 'SHIPPED',
        page: 0,
        size: 50,
        direction: 'ASC',
      });
      const grouped: Record<string, DeliveryHistory[]> = {};
      for (const h of (paged?.content || []) as any[]) {
        const key = String((h as any).orderId);
        if (!grouped[key]) grouped[key] = [] as any[];
        grouped[key].push(h as any);
      }
      setHistoriesByOrder(grouped);
    } catch (e) {
      // non-blocking
      console.warn('Failed to load delivery histories', e);
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'shipped':
        return <Truck size={20} className="text-blue-500" />;
      case 'processing':
        return <Clock size={20} className="text-yellow-500" />;
      case 'pending':
        return <Clock size={20} className="text-gray-500" />;
      case 'cancelled':
        return <XCircle size={20} className="text-red-500" />;
      default:
        return <AlertCircle size={20} className="text-gray-500" />;
    }
  };

  const getOrderStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered': return 'Delivered';
      case 'shipped': return 'Shipped';
      case 'processing': return 'Processing';
      case 'pending': return 'Pending';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const renderFeedbacks = (orderId: string | number, itemId: string | number) => {
    const feedbackKey = `${orderId}-${itemId}`;
    const itemFeedbacks = feedbacks[feedbackKey] || [];
    
    if (itemFeedbacks.length === 0) {
      return null;
    }

    return (
      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
        <h6 className="text-sm font-medium text-gray-900 mb-2">Recent Reviews</h6>
        <div className="space-y-2">
          {itemFeedbacks.slice(0, 3).map((feedback, index) => (
            <div key={index} className="text-sm">
              <div className="flex items-center space-x-2 mb-1">
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={12}
                      className={`${
                        star <= feedback.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                {feedback.userName && (
                  <div className="flex items-center space-x-1 text-gray-600">
                    <User size={12} />
                    <span className="text-xs">{feedback.userName}</span>
                  </div>
                )}
              </div>
              {feedback.comment && (
                <p className="text-gray-700 text-xs italic">"{feedback.comment}"</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-florist-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">My Orders</h1>
            <p className="text-gray-600">Track your orders and view order history</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white"
            >
              <option value="">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button
              onClick={loadOrders}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50"
            >
              <RefreshCcw size={16} className="mr-2" /> Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle size={20} className="text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Package size={64} className="text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-florist-500 text-white px-6 py-3 rounded-lg hover:bg-florist-600 transition-colors"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order: any) => (
              <div key={order.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getOrderStatusIcon(order.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusText(order.status)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Package size={16} className="text-gray-400" />
                      <span className="text-gray-600">{order.items?.length ?? 0} items</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign size={16} className="text-gray-400" />
                      <span className="text-gray-600">Total: {formatCurrency(Number(order.total ?? 0))}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="text-gray-600">
                        {order.shippingAddress?.city}, {order.shippingAddress?.state}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div className="p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                    <div className="space-y-4">
                      {order.items.map((item: any, index: number) => {
                        const ratingKey = `${order.id}-${item.orderItemId || item.id}`;
                        const itemRating = ratings[ratingKey];
                        const isRatingFormVisible = showRatingForm[ratingKey];
                        
                        return (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center space-x-4 mb-3">
                              <img
                                src={item.product?.image || item.product?.imageUrl || ''}
                                alt={item.product?.name}
                                className="w-16 h-16 object-cover rounded-md"
                              />
                              <div className="flex-1">
                                <h5 className="font-medium text-gray-900">{item.product?.name}</h5>
                                <p className="text-sm text-gray-600">
                                  {typeof item.product?.category === 'string' ? item.product?.category : item.product?.category?.name}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-medium text-gray-900">{formatCurrency(Number(item.product?.price ?? 0))}</p>
                                <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            
                            {/* Rating Section */}
                            <div className="border-t border-gray-100 pt-3">
                              {itemRating?.submitted ? (
                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center space-x-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star
                                        key={star}
                                        size={16}
                                        className={`${
                                          star <= itemRating.rating
                                            ? 'text-yellow-400 fill-current'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-600">Your rating: {itemRating.rating}/5</span>
                                  {itemRating.comment && (
                                    <span className="text-sm text-gray-500">• "{itemRating.comment}"</span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <button
                                    onClick={() => {
                                      const itemIdToUse = item.orderItemId || item.id;
                                      console.log('Button clicked with:', {
                                        orderId: order.id,
                                        itemId: itemIdToUse,
                                        'item.orderItemId': item.orderItemId,
                                        'item.id': item.id
                                      });
                                      toggleRatingForm(order.id, itemIdToUse);
                                    }}
                                    className="text-sm text-florist-600 hover:text-florist-700 font-medium"
                                  >
                                    {isRatingFormVisible ? 'Cancel Rating' : 'Rate this product'}
                                  </button>
                                </div>
                              )}
                              
                              {/* Rating Form */}
                              {(() => {
                                const ratingKey = `${order.id}-${item.orderItemId || item.id}`;
                                const isFormVisible = showRatingForm[ratingKey];
                                console.log('Rating form visibility check:', { 
                                  ratingKey, 
                                  isFormVisible, 
                                  showRatingForm, 
                                  'itemRating?.submitted': itemRating?.submitted 
                                });
                                
                                return isFormVisible && !itemRating?.submitted ? (
                                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="mb-3">
                                      <label className="block text-sm font-medium text-gray-700 mb-2">Rating:</label>
                                      <div className="flex items-center space-x-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <button
                                            key={star}
                                            onClick={() => {
                                              setRatings(prev => ({
                                                ...prev,
                                                [ratingKey]: { 
                                                  rating: star, 
                                                  comment: prev[ratingKey]?.comment || '', 
                                                  submitted: false 
                                                }
                                              }));
                                            }}
                                            className="hover:scale-110 transition-transform"
                                          >
                                            <Star
                                              size={20}
                                              className={`${
                                                star <= (ratings[ratingKey]?.rating || 0)
                                                  ? 'text-yellow-400 fill-current'
                                                  : 'text-gray-300'
                                              }`}
                                            />
                                          </button>
                                        ))}
                                      </div>
                                    </div>
                                    
                                    <div className="mb-3">
                                      <label className="block text-sm font-medium text-gray-700 mb-2">Comment (optional):</label>
                                      <textarea
                                        value={ratings[ratingKey]?.comment || ''}
                                        onChange={(e) => {
                                          setRatings(prev => ({
                                            ...prev,
                                            [ratingKey]: { 
                                              rating: prev[ratingKey]?.rating || 0, 
                                              comment: e.target.value, 
                                              submitted: false 
                                            }
                                          }));
                                        }}
                                        placeholder="Share your experience with this product..."
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-florist-500 focus:border-transparent"
                                        rows={2}
                                      />
                                    </div>
                                    
                                    <div className="flex justify-end space-x-2">
                                      <button
                                        onClick={() => toggleRatingForm(order.id, item.orderItemId || item.id)}
                                        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={() => {
                                          const rating = ratings[ratingKey]?.rating || 0;
                                          const comment = ratings[ratingKey]?.comment || '';
                                          if (rating > 0) {
                                            handleRatingSubmit(order.id, item.orderItemId || item.id, rating, comment);
                                          } else {
                                            alert('Please select a rating before submitting.');
                                          }
                                        }}
                                        disabled={!ratings[ratingKey]?.rating}
                                        className="px-4 py-2 bg-florist-500 text-white text-sm rounded-md hover:bg-florist-600 disabled:cursor-not-allowed"
                                      >
                                        Submit Rating
                                      </button>
                                    </div>
                                  </div>
                                ) : null;
                              })()}
                              
                              {/* Display existing feedbacks */}
                              {renderFeedbacks(order.id, item.orderItemId || item.id)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Order Details */}
                <div className="bg-gray-50 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Shipping Address</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{order.shippingAddress?.street}</p>
                        <p>
                          {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}
                        </p>
                        <p>{order.shippingAddress?.country}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Order Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="text-gray-900">{formatCurrency(Number(order.total ?? 0))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping:</span>
                          <span className="text-gray-900">Free</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-2">
                          <span className="font-semibold text-gray-900">Total:</span>
                          <span className="font-semibold text-gray-900">{formatCurrency(Number(order.total ?? 0))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {selectedOrder?.id === order.id && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-4">Order Timeline</h4>
                    <div className="space-y-4">
                      {(historiesByOrder[String(order.id)] || []).map((h, idx) => (
                        <div key={idx} className="flex items-center space-x-3">
                          {String(h.status).toUpperCase() === 'DELIVERED' ? (
                            <CheckCircle size={20} className="text-green-500" />
                          ) : String(h.status).toUpperCase() === 'SHIPPED' ? (
                            <Truck size={20} className="text-blue-500" />
                          ) : (
                            <Clock size={20} className="text-gray-500" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{h.status}</p>
                            {h.createdAt && (
                              <p className="text-sm text-gray-600">{new Date(h.createdAt).toLocaleString()}</p>
                            )}
                            {h.note && <p className="text-xs text-gray-500">{h.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders; 