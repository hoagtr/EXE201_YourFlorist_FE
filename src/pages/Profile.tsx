import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { User, Order } from '../types';
import { User as UserIcon, Mail, MapPin, Phone, Edit, Save, X, LogOut, Package, Calendar, DollarSign } from 'lucide-react';
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
        const ordersData = await apiService.getOrders();
        setOrders(ordersData);
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
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <>
      <Notification
        type={notificationType}
        message={notificationMessage}
        show={showNotification}
        onClose={() => setShowNotification(false)}
      />
      <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>

          {/* Profile Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                <button
                  onClick={handleEditToggle}
                  className="flex items-center space-x-1 text-florist-600 hover:text-florist-700 transition-colors"
                >
                  {isEditing ? <X size={16} /> : <Edit size={16} />}
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-florist-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <UserIcon size={16} className="text-gray-400" />
                      <span className="text-gray-900">{user.name}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-florist-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Mail size={16} className="text-gray-400" />
                      <span className="text-gray-900">{user.email}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-florist-500 focus:border-transparent"
                    />
                  ) : (
                    user.phone ? (
                      <div className="flex items-center space-x-2">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-gray-900">{user.phone}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Not provided</span>
                    )
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  {isEditing ? (
                    <select
                      value={editForm.gender || ''}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-florist-500 focus:border-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    user.gender ? (
                      <span className="text-gray-900">{user.gender}</span>
                    ) : (
                      <span className="text-gray-500">Not provided</span>
                    )
                  )}
                </div>
              </div>

              {isEditing && (
                <button
                  onClick={handleSave}
                  className="mt-4 bg-florist-500 text-white px-4 py-2 rounded-lg hover:bg-florist-600 transition-colors flex items-center space-x-2"
                >
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              )}
            </div>

            {/* Address Information */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={typeof user.address === 'string' ? user.address : (user.address?.street || '')}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-florist-500 focus:border-transparent"
                      placeholder="Enter your full address"
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span className="text-gray-900">
                        {typeof user.address === 'string' ? user.address : (user.address?.street || 'No address provided')}
                      </span>
                    </div>
                  )}
                </div>

                {/* Show additional address fields only if address is an object */}
                {typeof user.address === 'object' && user.address && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={typeof editForm.address === 'object' && editForm.address ? editForm.address.city || '' : ''}
                            onChange={(e) => handleInputChange('address.city', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-florist-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="text-gray-900">{user.address.city}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={typeof editForm.address === 'object' && editForm.address ? editForm.address.state || '' : ''}
                            onChange={(e) => handleInputChange('address.state', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-florist-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="text-gray-900">{user.address.state}</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={typeof editForm.address === 'object' && editForm.address ? editForm.address.zipCode || '' : ''}
                            onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-florist-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="text-gray-900">{user.address.zipCode}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={typeof editForm.address === 'object' && editForm.address ? editForm.address.country || '' : ''}
                            onChange={(e) => handleInputChange('address.country', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-florist-500 focus:border-transparent"
                          />
                        ) : (
                          <span className="text-gray-900">{user.address.country}</span>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order History</h2>
          
          {error && (
            <div className="text-red-600 mb-4">{error}</div>
          )}

          {orders.length === 0 ? (
            <div className="text-center py-8">
              <Package size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-4">Start shopping to see your order history here</p>
              <button
                onClick={() => navigate('/products')}
                className="bg-florist-500 text-white px-6 py-2 rounded-lg hover:bg-florist-600 transition-colors"
              >
                Browse Products
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getOrderStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="font-semibold text-gray-900">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Package size={16} />
                      <span>{order.items.length} items</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} />
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign size={16} />
                      <span>Total: ${order.total.toFixed(2)}</span>
                    </div>
                  </div>
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