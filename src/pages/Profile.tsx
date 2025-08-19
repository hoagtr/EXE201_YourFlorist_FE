import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import { apiService } from '../services/api';
import { User, Order } from '../types';
import { 
  User as UserIcon, 
  Mail, 
  MapPin, 
  Phone, 
  Edit, 
  Save, 
  X, 
  LogOut, 
  Package, 
  Calendar, 
  DollarSign,
  Shield,
  Crown,
  Heart,
  ShoppingBag,
  Settings,
  ArrowRight
} from 'lucide-react';
import Notification from '../components/ui/Notification';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<User>>({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('error');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const uid = isNaN(Number(user.id)) ? user.id : Number(user.id);
        const ordersData = await apiService.getUserOrders(uid as any, { page: 0, size: 50, direction: 'DESC' });
        setOrders(ordersData || []);
      } catch (err) {
        setError('Failed to load order history');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm({});
    } else {
      setEditForm({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        gender: user?.gender || '',
        address: user?.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEditForm(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof User] as any),
          [child]: value
        }
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Call API to update user profile
      const updatedUser = await apiService.updateProfile(editForm);
      
      // Update the user context with new data
      // Note: You would need to add an updateUser method to AuthContext
      // For now, we'll just close edit mode
      
      setIsEditing(false);
      setEditForm({});
      
      // Show success notification
      setNotificationMessage('Profile updated successfully!');
      setNotificationType('success');
      setShowNotification(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      setNotificationMessage(err.message || 'Failed to update profile');
      setNotificationType('error');
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-florist-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-florist-200 border-t-florist-500 mx-auto mb-4"></div>
          <p className="text-florist-600 text-lg font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Notification
        type={notificationType}
        message={notificationMessage}
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-florist-50 to-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          
          {/* Profile Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
              <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                <div className="w-24 h-24 bg-gradient-to-br from-florist-400 to-florist-600 rounded-full flex items-center justify-center shadow-lg">
                  <UserIcon size={40} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{user.name}</h1>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Mail size={18} className="text-florist-500" />
                      <span>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center space-x-2">
                        <Phone size={18} className="text-florist-500" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleEditToggle}
                  className="flex items-center space-x-2 bg-florist-500 text-white px-6 py-3 rounded-xl hover:bg-florist-600 transition-all duration-200 transform hover:scale-105 shadow-md"
                >
                  {isEditing ? <X size={18} /> : <Edit size={18} />}
                  <span className="font-medium">{isEditing ? 'Cancel' : 'Edit Profile'}</span>
                </button>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-red-600 hover:text-red-700 px-4 py-3 rounded-xl hover:bg-red-50 transition-all duration-200"
                >
                  <LogOut size={18} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
              <div className="bg-gradient-to-br from-florist-50 to-florist-100 rounded-xl p-6 border border-florist-200 max-w-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-florist-600">Total Orders</p>
                    <p className="text-2xl font-bold text-florist-700">{orders.length}</p>
                  </div>
                  <ShoppingBag size={24} className="text-florist-500" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Personal Information Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-florist-100 rounded-full flex items-center justify-center">
                      <UserIcon size={20} className="text-florist-600" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                      <p className="text-gray-600">Manage your account details</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name</label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-florist-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter your full name"
                        />
                        <UserIcon size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                        <UserIcon size={18} className="text-florist-500" />
                        <span className="text-gray-900 font-medium">{user.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address</label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="email"
                          value={editForm.email || ''}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-florist-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter your email"
                        />
                        <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                        <Mail size={18} className="text-florist-500" />
                        <span className="text-gray-900 font-medium">{user.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number</label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="tel"
                          value={editForm.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-florist-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter your phone number"
                        />
                        <Phone size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    ) : (
                      user.phone ? (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                          <Phone size={18} className="text-florist-500" />
                          <span className="text-gray-900 font-medium">{user.phone}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-xl">
                          <Phone size={18} className="text-gray-400" />
                          <span className="text-gray-500">Not provided</span>
                        </div>
                      )
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Gender</label>
                    {isEditing ? (
                      <select
                        value={editForm.gender || ''}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-florist-500 focus:border-transparent transition-all duration-200"
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      user.gender ? (
                        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                          <UserIcon size={18} className="text-florist-500" />
                          <span className="text-gray-900 font-medium">{user.gender}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-xl">
                          <UserIcon size={18} className="text-gray-400" />
                          <span className="text-gray-500">Not provided</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={handleSave}
                      className="flex items-center space-x-2 bg-florist-500 text-white px-8 py-3 rounded-xl hover:bg-florist-600 transition-all duration-200 transform hover:scale-105 shadow-md font-medium"
                    >
                      <Save size={18} />
                      <span>Save Changes</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Address Information Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-florist-100 rounded-full flex items-center justify-center">
                    <MapPin size={20} className="text-florist-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Shipping Address</h2>
                    <p className="text-gray-600">Your delivery information</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Street Address</label>
                    {isEditing ? (
                      <div className="relative">
                        <input
                          type="text"
                          value={typeof user.address === 'string' ? user.address : (user.address?.street || '')}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-florist-500 focus:border-transparent transition-all duration-200"
                          placeholder="Enter your street address"
                        />
                        <MapPin size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                        <MapPin size={18} className="text-florist-500" />
                        <span className="text-gray-900 font-medium">
                          {typeof user.address === 'string' ? user.address : (user.address?.street || 'No address provided')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Show additional address fields only if address is an object */}
                  {typeof user.address === 'object' && user.address && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">City</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={typeof editForm.address === 'object' && editForm.address ? editForm.address.city || '' : ''}
                            onChange={(e) => handleInputChange('address.city', e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-florist-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter city"
                          />
                        ) : (
                          <span className="text-gray-900 font-medium">{user.address.city}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">State/Province</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={typeof editForm.address === 'object' && editForm.address ? editForm.address.state || '' : ''}
                            onChange={(e) => handleInputChange('address.state', e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-florist-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter state"
                          />
                        ) : (
                          <span className="text-gray-900 font-medium">{user.address.state}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">ZIP/Postal Code</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={typeof editForm.address === 'object' && editForm.address ? editForm.address.zipCode || '' : ''}
                            onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-florist-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter ZIP code"
                          />
                        ) : (
                          <span className="text-gray-900 font-medium">{user.address.zipCode}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Country</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={typeof editForm.address === 'object' && editForm.address ? editForm.address.country || '' : ''}
                            onChange={(e) => handleInputChange('address.country', e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-florist-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter country"
                          />
                        ) : (
                          <span className="text-gray-900 font-medium">{user.address.country}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/products')}
                    className="w-full flex items-center justify-between p-4 bg-florist-50 hover:bg-florist-100 rounded-xl transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <ShoppingBag size={20} className="text-florist-600" />
                      <span className="font-medium text-gray-900">Browse Products</span>
                    </div>
                    <ArrowRight size={18} className="text-florist-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button
                    onClick={() => navigate('/cart')}
                    className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <Package size={20} className="text-blue-600" />
                      <span className="font-medium text-gray-900">View Cart</span>
                    </div>
                    <ArrowRight size={18} className="text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                  
                  <button
                    onClick={() => navigate('/orders')}
                    className="w-full flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-all duration-200 group"
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar size={20} className="text-green-600" />
                      <span className="font-medium text-gray-900">Order History</span>
                    </div>
                    <ArrowRight size={18} className="text-green-600 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>


            </div>
          </div>

          {/* Order History */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mt-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-florist-100 rounded-full flex items-center justify-center">
                  <Package size={20} className="text-florist-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
                  <p className="text-gray-600">Track your past and current orders</p>
                </div>
              </div>
              
              {orders.length > 0 && (
                <button
                  onClick={() => navigate('/orders')}
                  className="flex items-center space-x-2 text-florist-600 hover:text-florist-700 font-medium transition-colors"
                >
                  <span>View All</span>
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {orders.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3">No orders yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">Start shopping to see your order history here. We'll keep track of all your purchases for you.</p>
                <button
                  onClick={() => navigate('/products')}
                  className="bg-florist-500 text-white px-8 py-3 rounded-xl hover:bg-florist-600 transition-all duration-200 transform hover:scale-105 shadow-md font-medium"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.slice(0, 6).map((order) => (
                  <div key={order.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">#{order.id}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getOrderStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="space-y-3 text-sm text-gray-600">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <Package size={16} className="text-florist-500" />
                          <span>Items</span>
                        </span>
                        <span className="font-medium">{order.items?.length ?? 0}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-2">
                          <DollarSign size={16} className="text-florist-500" />
                          <span>Total</span>
                        </span>
                        <span className="font-bold text-gray-900">{formatCurrency(order.total)}</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="w-full mt-4 bg-white text-florist-600 border border-florist-200 py-2 rounded-lg hover:bg-florist-50 transition-colors font-medium text-sm"
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile; 