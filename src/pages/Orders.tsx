import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { formatCurrency } from '../utils/currency';
import { Order } from '../types';
import { Package, Calendar, DollarSign, MapPin, Truck, CheckCircle, Clock, AlertCircle, XCircle, RefreshCcw } from 'lucide-react';

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const loadOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const uid = isNaN(Number(user.id)) ? user.id : Number(user.id);
      const params: any = {};
      if (statusFilter) params.status = statusFilter as any;
      const list = await apiService.getUserOrders(uid as any, params);
      setOrders(list as any);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders (with params). Retrying without filters...', err);
      try {
        const uid = isNaN(Number(user.id)) ? user.id : Number(user.id);
        const list = await apiService.getUserOrders(uid as any);
        setOrders(list as any);
        setError(null);
      } catch (err2) {
        setError('Failed to load orders');
        console.error('Error fetching orders:', err2);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [user, navigate, statusFilter]);

  const confirmDelivered = async (orderId: string | number) => {
    try {
      await apiService.confirmCustomerStatus(orderId, 'DELIVERED', 'Customer confirmed delivery');
      await loadOrders();
    } catch (e) {
      console.error('Confirm delivery failed', e);
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
                    <div className="space-y-3">
                      {order.items.map((item: any, index: number) => (
                        <div key={index} className="flex items-center space-x-4">
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
                      ))}
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

                {/* Order Actions */}
                <div className="p-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                      className="flex-1 bg-florist-500 text-white px-4 py-2 rounded-lg hover:bg-florist-600 transition-colors"
                    >
                      {selectedOrder?.id === order.id ? 'Hide Details' : 'View Details'}
                    </button>
                    {String(order.status).toUpperCase() === 'DELIVERED' && (
                      <button
                        onClick={() => confirmDelivered(order.id)}
                        className="flex-1 border border-florist-500 text-florist-500 px-4 py-2 rounded-lg hover:bg-florist-50 transition-colors"
                      >
                        Confirm Delivery
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Order Details */}
                {selectedOrder?.id === order.id && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-4">Order Timeline</h4>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <CheckCircle size={20} className="text-green-500" />
                        <div>
                          <p className="font-medium text-gray-900">Order Placed</p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {String(order.status).toUpperCase() !== 'PENDING' && (
                        <div className="flex items-center space-x-3">
                          <Clock size={20} className="text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900">Processing</p>
                          </div>
                        </div>
                      )}
                      {(String(order.status).toUpperCase() === 'SHIPPED' || String(order.status).toUpperCase() === 'DELIVERED') && (
                        <div className="flex items-center space-x-3">
                          <Truck size={20} className="text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900">Shipped</p>
                          </div>
                        </div>
                      )}
                      {String(order.status).toUpperCase() === 'DELIVERED' && (
                        <div className="flex items-center space-x-3">
                          <CheckCircle size={20} className="text-green-500" />
                          <div>
                            <p className="font-medium text-gray-900">Delivered</p>
                          </div>
                        </div>
                      )}
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