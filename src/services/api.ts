import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Product, Category, Order, User, ApiResponse, BouquetData, BouquetApiResponse, Flower, Feedback, Paged, DeliveryHistory, OrderItem, Promotion } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://flourist-gkf7c9aefxcxb4ck.eastasia-01.azurewebsites.net/custom-florist/api/v1';

class ApiService {
  private api: AxiosInstance;
  private flowerCache: Map<number, Flower> = new Map();

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
    try {
      const response: AxiosResponse<ApiResponse<BouquetData[]>> = await this.api.get('/bouquets/active');
      
      // Map bouquet data to Product interface
      return response.data.data.map(bouquet => ({
        id: bouquet.id.toString(),
        name: bouquet.name,
        description: bouquet.description,
        price: bouquet.price,
        image: bouquet.imageUrl, // Map imageUrl to image
        imageUrl: bouquet.imageUrl,
        category: bouquet.category, // keep full category object
        inStock: bouquet.isActive,
        quantity: 1, // Default quantity for bouquets
        tags: [],
        isActive: bouquet.isActive,
        compositions: bouquet.compositions,
      }));
    } catch (error: any) {
      console.error('Get active bouquets error:', error);
      
      if (error.response?.status === 400) {
        throw new Error('Invalid request parameters. Please try again.');
      } else if (error.response?.status === 404) {
        throw new Error('No active bouquets found.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error('Failed to load active bouquets. Please try again.');
      }
    }
  }

  async getBouquetById(id: string | number): Promise<BouquetData> {
    try {
      const response: AxiosResponse<BouquetApiResponse> = await this.api.get(`/bouquets/${id}`);
      return response.data.data;
    } catch (error: any) {
      console.error('Get bouquet error:', error);
      
      if (error.response?.status === 400) {
        throw new Error('Invalid bouquet ID. Please try again.');
      } else if (error.response?.status === 404) {
        throw new Error('Bouquet not found.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error('Failed to load bouquet details. Please try again.');
      }
    }
  }

  async getProduct(id: string): Promise<Product> {
    const response: AxiosResponse<ApiResponse<Product>> = await this.api.get(`/products/${id}`);
    return response.data.data;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    const response: AxiosResponse<ApiResponse<Product[]>> = await this.api.get(`/products/category/${category}`);
    return response.data.data;
  }

  // Flower endpoints (for bouquet compositions)
  async getFlowerById(id: number): Promise<Flower> {
    if (this.flowerCache.has(id)) {
      return this.flowerCache.get(id)!;
    }
    try {
      const response: AxiosResponse<ApiResponse<Flower>> = await this.api.get(`/flowers/${id}`);
      const flower = response.data.data;
      if (flower) {
        this.flowerCache.set(id, flower);
      }
      return flower;
    } catch (error: any) {
      console.error('Get flower error:', error);
      if (error.response?.status === 404) {
        // Fallback with minimal info so UI can still function
        const fallback: Flower = { id, name: `Flower #${id}`, price: 0 };
        this.flowerCache.set(id, fallback);
        return fallback;
      }
      throw error;
    }
  }

  // Category endpoints
  async getCategories(keyword?: string, page: number = 0, size: number = 50): Promise<Category[]> {
    try {
      let url = `/categories/active?page=${page}&size=${size}`;
      if (keyword && keyword.trim()) {
        url += `&keyword=${encodeURIComponent(keyword.trim())}`;
      }
      
      console.log('Fetching categories from:', `${API_BASE_URL}${url}`);
      
      // Make a direct request without authentication for categories
      const response: AxiosResponse<ApiResponse<{ content: Category[] }>> = await axios.get(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      });
      
      console.log('Categories response:', response.data);
      return response.data.data.content;
    } catch (error: any) {
      console.error('Get categories error:', error);
      
      if (error.response?.status === 400) {
        throw new Error('Invalid search parameters. Please try again.');
      } else if (error.response?.status === 404) {
        throw new Error('Categories not found.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Please try again later.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error('Failed to load categories. Please try again.');
      }
    }
  }

  async searchCategories(keyword: string): Promise<Category[]> {
    return this.getCategories(keyword, 0, 50);
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

  async getUserOrders(userId: string | number, params?: {
    minOrderDate?: string; maxOrderDate?: string; minPrice?: number; maxPrice?: number; status?: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'; page?: number; size?: number; direction?: 'ASC' | 'DESC';
  }): Promise<Order[]> {
    const query = new URLSearchParams();
    if (params?.minOrderDate) query.append('minOrderDate', params.minOrderDate);
    if (params?.maxOrderDate) query.append('maxOrderDate', params.maxOrderDate);
    if (params?.minPrice !== undefined) query.append('minPrice', String(params.minPrice));
    if (params?.maxPrice !== undefined) query.append('maxPrice', String(params.maxPrice));
    if (params?.status) query.append('status', params.status);
    // Always include sensible defaults; some servers 500 without them
    query.append('page', String(params?.page ?? 0));
    query.append('size', String(params?.size ?? 50));
    query.append('direction', params?.direction ?? 'ASC');
    const url = `/orders/user/${userId}${query.toString() ? `?${query.toString()}` : ''}`;
    const response: AxiosResponse<ApiResponse<Paged<any>>> = await this.api.get(url);
    const data = response.data?.data as any;
    const list: any[] = (data && (data.content ?? data)) || [];
    return list.map((raw: any) => this.normalizeOrder(raw));
  }

  async getOrderById(orderId: string | number): Promise<Order> {
    const response: AxiosResponse<ApiResponse<any>> = await this.api.get(`/orders/${orderId}`);
    const raw = (response.data && (response.data as any).data) as any;
    return this.normalizeOrder(raw);
  }

  async getOrderWithDetails(orderId: string | number): Promise<Order> {
    try {
      // Call the backend endpoint that now returns orderItems
      const response: AxiosResponse<ApiResponse<any>> = await this.api.get(`/orders/${orderId}`);
      const orderData = response.data.data;
      
      // Use the normalizeOrder method to process the response
      return this.normalizeOrder(orderData);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      // Fallback to basic order if detailed fetch fails
      return await this.getOrderById(orderId);
    }
  }

  // Fetch order items by their IDs (from orderItemIds array)
  async getOrderItemsByIds(orderItemIds: Array<number | string>): Promise<OrderItem[]> {
    const items: OrderItem[] = [];
    for (const id of orderItemIds) {
      try {
        const item = await this.getOrderItemById(id);
        items.push(item);
      } catch (e) {
        console.warn(`Failed to fetch order item ${id}:`, e);
      }
    }
    return items;
  }

  async getOrderItemsByOrderId(orderId: string | number): Promise<OrderItem[]> {
    try {
      const res: AxiosResponse<ApiResponse<any[]>> = await this.api.get(`/order-items/order/${orderId}`);
      return await this.normalizeOrderItems(res.data.data || []);
    } catch (e1) {}
    try {
      const res: AxiosResponse<ApiResponse<any[]>> = await this.api.get(`/orders/${orderId}/items`);
      return await this.normalizeOrderItems(res.data.data || []);
    } catch (e2) {}
    const ord = await this.getOrderById(orderId);
    const ids = (ord as any).orderItemIds as Array<number | string> | undefined;
    if (ids && ids.length) {
      const items: OrderItem[] = [];
      for (const id of ids) {
        try { items.push(await this.getOrderItemById(id)); } catch {}
      }
      return items;
    }
    return [];
  }

  async getOrderItemById(orderItemId: number | string): Promise<OrderItem> {
    const paths = [`/order-items/${orderItemId}`, `/orders/items/${orderItemId}`];
    for (const p of paths) {
      try {
        const res: AxiosResponse<ApiResponse<any>> = await this.api.get(p);
        const raw = res.data.data;
        return (await this.normalizeOrderItems([raw]))[0];
      } catch {}
    }
    throw new Error('Order item not found');
  }

  private async normalizeOrderItems(rawItems: any[]): Promise<OrderItem[]> {
    const items: OrderItem[] = [];
    for (const r of rawItems || []) {
      const bouquetId = r.bouquetId || r.bouquet?.id || r.productId || r.itemBouquetId;
      let product: Product | undefined = undefined;
      if (bouquetId !== undefined && bouquetId !== null) {
        try {
          const bq = await this.getBouquetById(bouquetId);
          product = {
            id: bq.id,
            name: bq.name,
            description: bq.description,
            price: bq.price,
            image: bq.imageUrl,
            imageUrl: bq.imageUrl,
            category: bq.category,
            inStock: bq.isActive,
            quantity: 1,
            tags: [],
            isActive: bq.isActive,
            compositions: bq.compositions,
          } as unknown as Product;
        } catch {}
      }
      items.push({
        id: r.id || r.orderItemId || r.itemId,
        bouquetId,
        product,
        quantity: r.quantity ?? r.qty ?? 1,
        subTotal: r.subTotal ?? r.subtotal ?? r.price ?? undefined,
        isActive: r.isActive ?? true,
      });
    }
    return items;
  }

  private normalizeOrder(raw: any): Order {
    const id = raw?.id ?? raw?.orderId ?? raw?.orderID;
    const userId = raw?.userId ?? raw?.customerId ?? raw?.buyerId;
    const status = raw?.status ?? raw?.orderStatus ?? 'PENDING';
    const totalRaw = raw?.totalPrice ?? raw?.total ?? raw?.total_amount ?? raw?.amountTotal ?? raw?.priceTotal ?? raw?.grandTotal ?? 0;
    const total = typeof totalRaw === 'string' ? Number(totalRaw) : Number(totalRaw ?? 0);
    const created = raw?.createdAt ?? raw?.orderDate ?? raw?.createdOn ?? raw?.createdDate ?? raw?.timestamp ?? raw?.timeStamp ?? raw?.orderTime;
    let createdAt: any = created;
    if (typeof created === 'number') {
      createdAt = new Date(created > 1e12 ? created : created * 1000).toISOString();
    } else if (typeof created === 'string' && /^\d+$/.test(created)) {
      const num = parseInt(created, 10);
      createdAt = new Date(num > 1e12 ? num : num * 1000).toISOString();
    } else if (typeof created === 'string') {
      const parsed = Date.parse(created);
      createdAt = isNaN(parsed) ? new Date().toISOString() : new Date(parsed).toISOString();
    } else if (!created) {
      createdAt = new Date().toISOString();
    }
    const shipping = raw?.shippingAddress;
    let shippingAddress: any = undefined;
    if (shipping && typeof shipping === 'object') {
      shippingAddress = shipping;
    } else if (typeof shipping === 'string') {
      shippingAddress = { street: shipping };
    }
    
    // Map orderItems from backend to items for frontend
    const items = raw?.orderItems || raw?.items;
    
    const ord: Order = {
      id,
      userId,
      items: Array.isArray(items) ? items : undefined,
      total,
      status,
      createdAt,
      shippingAddress,
    } as Order;
    (ord as any).orderItemIds = raw?.orderItemIds;
    return ord;
  }

  async confirmCustomerStatus(orderId: string | number, status: 'DELIVERED' | 'CANCELLED', reason: string = ''): Promise<void> {
    await this.api.patch(`/orders/${orderId}/customer-confirm-status`, { status, reason });
  }

  async getUserDeliveryHistories(userId: number | string, opts?: { status?: string; page?: number; size?: number; direction?: 'ASC' | 'DESC' }): Promise<Paged<DeliveryHistory>> {
    const params: any = {
      page: opts?.page ?? 0,
      size: opts?.size ?? 50,
      direction: opts?.direction ?? 'ASC',
    };
    if (opts?.status) params.status = opts.status;
    const res: AxiosResponse<ApiResponse<Paged<DeliveryHistory>>> = await this.api.get(`/delivery-histories/active/user/${userId}`, { params });
    return res.data.data;
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

  // Google OAuth endpoints
  async getGoogleAuthUrl(): Promise<string> {
    try {
      const response: AxiosResponse<{ authURL: string }> = await this.api.get('/auth/url');
      return response.data.authURL;
    } catch (error: any) {
      console.error('Get Google auth URL error:', error);
      
      if (error.response?.status === 500) {
        throw new Error('Google login is currently unavailable. Please try again later or use email login.');
      } else if (error.response?.status === 401) {
        throw new Error('Google OAuth configuration error. Please contact support.');
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error('Google login is temporarily unavailable. Please try again later.');
      }
    }
  }

  async handleGoogleCallback(code: string): Promise<string> {
    try {
      const response: AxiosResponse<{ token: string }> = await this.api.get(`/auth/callback?code=${code}`);
      return response.data.token;
    } catch (error: any) {
      console.error('Google callback error:', error);
      
      if (error.response?.status === 400) {
        throw new Error('Invalid authorization code. Please try logging in again.');
      } else if (error.response?.status === 401) {
        throw new Error('Google OAuth configuration error. Please contact support.');
      } else if (error.response?.status === 500) {
        throw new Error('Google login failed. Please try again.');
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNABORTED') {
        throw new Error('Network error. Please check your connection and try again.');
      } else {
        throw new Error('Google login failed. Please try again.');
      }
    }
  }

  // Exchange Google access token (ya29...) for our app JWT
  async completeGoogleLogin(googleAccessToken: string): Promise<string> {
    try {
      const response: AxiosResponse<{ token: string } | { data?: string; jwt?: string }> = await axios.get(
        `${API_BASE_URL}/auth/success`,
        {
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
          },
          timeout: 60000,
        }
      );
      const data: any = response.data || {};
      // Try multiple shapes defensively
      return data.token || data.jwt || data.data || '';
    } catch (error: any) {
      console.error('Google success exchange error:', error);
      if (error.response?.status === 401) {
        throw new Error('Google token is invalid or expired. Please try logging in again.');
      }
      throw new Error('Google login failed during token exchange. Please try again.');
    }
  }

  // Feedback endpoints
  async getActiveFeedbacksByBouquet(bouquetId: number, page = 0, size = 50, sortBy = 'createdAt', sortDir: 'asc' | 'desc' = 'desc') {
    const response: AxiosResponse<ApiResponse<Paged<Feedback>>> = await this.api.get(
      `/feedbacks/bouquet/${bouquetId}/active`,
      { params: { page, size, sortBy, sortDir } }
    );
    return response.data.data;
  }

  async createFeedback(payload: { userId: number; bouquetId: number; orderItemId?: number; rating: number; comment: string; isActive?: boolean; }) {
    const response: AxiosResponse<ApiResponse<Feedback>> = await this.api.post('/feedbacks', payload);
    return response.data.data;
  }

  async updateFeedback(feedbackId: number, body: { rating: number; comment: string; }): Promise<Feedback> {
    const response: AxiosResponse<ApiResponse<Feedback>> = await this.api.put(`/feedbacks/${feedbackId}`, body);
    return response.data.data;
  }

  async softDeleteFeedback(feedbackId: number): Promise<void> {
    await this.api.delete(`/feedbacks/${feedbackId}`, { data: { isActive: false } });
  }

  async getActiveFeedbacksByUser(userId: number, page = 0, size = 50, sortBy = 'createdAt', sortDir: 'asc' | 'desc' = 'desc') {
    const response: AxiosResponse<ApiResponse<Paged<Feedback>>> = await this.api.get(
      `/feedbacks/user/${userId}/active`,
      { params: { page, size, sortBy, sortDir } }
    );
    return response.data.data;
  }

  async getFeedbacksByUser(userId: number, page = 0, size = 50, sortBy = 'createdAt', sortDir: 'asc' | 'desc' = 'desc') {
    const response: AxiosResponse<ApiResponse<Paged<Feedback>>> = await this.api.get(
      `/feedbacks/user/${userId}`,
      { params: { page, size, sortBy, sortDir } }
    );
    return response.data.data;
  }

  // Place order (v1 payload)
  async placeOrder(payload: any): Promise<any> {
    const token = localStorage.getItem('token');
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    try {
      const response: AxiosResponse<ApiResponse<any>> = await axios.post(`${API_BASE_URL}/orders`, payload, { headers, timeout: 60000 });
      return (response.data && (response.data as any).data) as any;
    } catch (err: any) {
      if (err?.response?.status === 404) {
        const response: AxiosResponse<ApiResponse<any>> = await axios.post(`${API_BASE_URL}/orders/`, payload, { headers, timeout: 60000 });
        return (response.data && (response.data as any).data) as any;
      }
      throw err;
    }
  }

  // Payments
  async startPayment(orderId: number | string): Promise<string> {
    // Uses the authorized axios instance; JWT added by interceptor
    const res: AxiosResponse<any> = await this.api.post('/payment', { orderId });
    // Try to extract checkoutUrl defensively across possible shapes
    const data: any = res?.data;
    const checkoutUrl = data?.data?.checkoutUrl || data?.checkoutUrl || data?.data?.url || data?.url || '';
    return checkoutUrl;
  }

  // Promotions
  async getPromotionByCode(code: string): Promise<Promotion> {
    try {
      const response: AxiosResponse<ApiResponse<Promotion>> = await this.api.get(`/promotions/code/${encodeURIComponent(code)}`);
      return response.data.data;
    } catch (error: any) {
      // Provide clearer error messages for common cases
      const serverMessage: string = error?.response?.data?.message || '';
      if (error.response?.status === 403) {
        throw new Error('You are not allowed to use this promotion. Please log in and try again.');
      }
      if (error.response?.status === 404) {
        if (serverMessage.toLowerCase().includes('expired')) {
          throw new Error('Promotion has expired.');
        }
        throw new Error('Promotion not found.');
      }
      if (error.response?.status === 400) {
        throw new Error('Invalid promotion code.');
      }
      throw error;
    }
  }
}

export const apiService = new ApiService(); 