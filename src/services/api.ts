import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Product, Category, Order, User, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://flourist-gkf7c9aefxcxb4ck.eastasia-01.azurewebsites.net/custom-florist/api/v1';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60 second timeout (increased from 5 seconds)
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.log('API Error:', error.message);
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Product endpoints
  async getProducts(): Promise<Product[]> {
    const response: AxiosResponse<ApiResponse<Product[]>> = await this.api.get('/products');
    return response.data.data;
  }

  async getActiveBouquets(): Promise<Product[]> {
    const response: AxiosResponse<ApiResponse<Product[]>> = await this.api.get('/bouquets/active');
    return response.data.data;
  }

  async getProduct(id: string): Promise<Product> {
    const response: AxiosResponse<ApiResponse<Product>> = await this.api.get(`/products/${id}`);
    return response.data.data;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const response: AxiosResponse<ApiResponse<Product[]>> = await this.api.get(`/products/category/${category}`);
    return response.data.data;
  }

  // Category endpoints
  async getCategories(): Promise<Category[]> {
    const response: AxiosResponse<ApiResponse<{ content: Category[] }>> = await this.api.get('/categories/active?page=0&size=50');
    return response.data.data.content;
  }

  // Order endpoints
  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const response: AxiosResponse<ApiResponse<Order>> = await this.api.post('/orders', orderData);
    return response.data.data;
  }

  async getOrders(): Promise<Order[]> {
    const response: AxiosResponse<ApiResponse<Order[]>> = await this.api.get('/orders');
    return response.data.data;
  }

  async getOrder(id: string): Promise<Order> {
    const response: AxiosResponse<ApiResponse<Order>> = await this.api.get(`/orders/${id}`);
    return response.data.data;
  }

  // User endpoints
  async login(credentials: { email: string; password: string }): Promise<string> {
    try {
      const response: AxiosResponse<ApiResponse<string>> = await this.api.post('/users/login', credentials);
      const token = response.data.data;
      if (!token) {
        throw new Error('No token returned from login.');
      }
      return token;
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle specific authentication errors
      if (error.response?.status === 401) {
        throw new Error('Invalid email or password. Please try again.');
      } else if (error.response?.status === 400) {
        const errorMessage = error.response.data?.message || '';
        if (errorMessage.toLowerCase().includes('email')) {
          throw new Error('Please enter a valid email address.');
        } else if (errorMessage.toLowerCase().includes('password')) {
          throw new Error('Please enter your password.');
        } else if (errorMessage) {
          throw new Error(errorMessage);
        } else {
          throw new Error('Please provide valid email and password.');
        }
      } else if (error.response?.status === 404) {
        throw new Error('User not found. Please check your email.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error('Login failed. Please try again.');
      }
    }
  }

  async register(userData: { 
    email: string; 
    password: string; 
    name: string; 
    address: string; 
    phone: string; 
    gender: 'Male' | 'Female' | 'Other';
  }): Promise<User> {
    try {
      console.log('API: Register request with userData:', { ...userData, password: '***' });
      console.log('API: Register endpoint:', '/users/signup');
      const response: AxiosResponse<ApiResponse<User>> = await this.api.post('/users/signup', userData);
      console.log('API: Register response:', response.data);
      const user = response.data.data;
      if (!user) {
        throw new Error('No user data returned from registration.');
      }
      return user;
    } catch (error: any) {
      console.error('Register error:', error);
      
      // Handle specific registration errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        throw new Error('Request timed out. Please check your connection and try again.');
      } else if (error.response?.status === 400) {
        console.error('API: 400 error response:', error.response.data);
        const errorMessage = error.response.data?.message || '';
        
        // Check for specific error messages
        if (errorMessage.toLowerCase().includes('email already exists') || errorMessage.toLowerCase().includes('email is already registered')) {
          throw new Error('Email already exists. Please use a different email address.');
        } else if (errorMessage.toLowerCase().includes('password')) {
          throw new Error('Password must be at least 6 characters long.');
        } else if (errorMessage.toLowerCase().includes('name')) {
          throw new Error('Please provide a valid name.');
        } else if (errorMessage.toLowerCase().includes('address')) {
          throw new Error('Please provide a valid address.');
        } else if (errorMessage.toLowerCase().includes('phone')) {
          throw new Error('Please provide a valid phone number.');
        } else if (errorMessage.toLowerCase().includes('gender')) {
          throw new Error('Please select a valid gender.');
        } else if (errorMessage.toLowerCase().includes('required') || errorMessage.toLowerCase().includes('missing')) {
          throw new Error('Please fill in all required fields.');
        } else if (errorMessage) {
          // Use the actual error message from the API
          throw new Error(errorMessage);
        } else {
          throw new Error('Please provide valid registration information.');
        }
      } else if (error.response?.status === 409) {
        throw new Error('Email is already registered. Please use a different email.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error('Registration failed. Please try again.');
      }
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await this.api.get('/users/me');
      return response.data.data;
    } catch (error: any) {
      console.error('Get current user error:', error);
      
      // Handle specific errors
      if (error.response?.status === 401) {
        throw new Error('Authentication failed. Please log in again.');
      } else if (error.response?.status === 404) {
        throw new Error('User not found.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error('Failed to get user information. Please try again.');
      }
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      // Prepare the payload according to the new API
      const payload: any = {
        name: userData.name,
        phone: userData.phone,
        address: typeof userData.address === 'string' ? userData.address : (userData.address ? `${userData.address.street}, ${userData.address.city}, ${userData.address.state}, ${userData.address.zipCode}, ${userData.address.country}` : ''),
        gender: userData.gender,
      };
      // Remove undefined fields
      Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);
      const response: AxiosResponse<ApiResponse<User>> = await this.api.put('/users/me', payload);
      return response.data.data;
    } catch (error: any) {
      console.error('Update profile error:', error);
      // Try to extract field-specific error messages from the API response
      if (error.response?.data) {
        const data = error.response.data;
        if (typeof data === 'object') {
          // If the API returns a field error object, e.g. { phone: 'Phone already exists' }
          if (data.phone) {
            throw new Error(`Phone: ${data.phone}`);
          }
          if (data.name) {
            throw new Error(`Name: ${data.name}`);
          }
          if (data.address) {
            throw new Error(`Address: ${data.address}`);
          }
          if (data.gender) {
            throw new Error(`Gender: ${data.gender}`);
          }
          if (data.message) {
            throw new Error(data.message);
          }
        }
      }
      if (error.response?.status === 400) {
        throw new Error('Please provide valid profile information.');
      } else if (error.response?.status === 401) {
        throw new Error('Please log in to update your profile.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error('Failed to update profile. Please try again.');
      }
    }
  }

  // Password management endpoints
  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      await this.api.put(`/users/${userId}/password`, {
        currentPassword,
        newPassword
      });
    } catch (error: any) {
      console.error('Change password error:', error);
      
      // Handle specific password change errors
      if (error.response?.status === 400) {
        if (error.response.data?.message?.includes('current password')) {
          throw new Error('Current password is incorrect.');
        } else if (error.response.data?.message?.includes('new password')) {
          throw new Error('New password must be at least 6 characters long.');
        } else {
          throw new Error('Please provide valid password information.');
        }
      } else if (error.response?.status === 401) {
        throw new Error('Please log in to change your password.');
      } else if (error.response?.status === 404) {
        throw new Error('User not found.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error('Failed to change password. Please try again.');
      }
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    try {
      await this.api.post('/users/reset-password/request', { email });
    } catch (error: any) {
      console.error('Request password reset error:', error);
      
      // Handle specific reset request errors
      if (error.response?.status === 400) {
        throw new Error('Please provide a valid email address.');
      } else if (error.response?.status === 404) {
        throw new Error('No account found with this email address.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error('Failed to send reset email. Please try again.');
      }
    }
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    try {
      await this.api.post('/users/reset-password/confirm', {
        token,
        newPassword
      });
    } catch (error: any) {
      console.error('Confirm password reset error:', error);
      
      // Handle specific reset confirm errors
      if (error.response?.status === 400) {
        if (error.response.data?.message?.includes('token')) {
          throw new Error('Invalid or expired reset token.');
        } else if (error.response.data?.message?.includes('password')) {
          throw new Error('New password must be at least 6 characters long.');
        } else {
          throw new Error('Please provide valid reset information.');
        }
      } else if (error.response?.status === 404) {
        throw new Error('Reset token not found or expired.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error('Failed to reset password. Please try again.');
      }
    }
  }
}

export const apiService = new ApiService(); 