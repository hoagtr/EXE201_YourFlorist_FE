export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  quantity: number;
  tags: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  address: string | Address;
  phone?: string;
  gender?: string;
  loyaltyPoints?: number;
  accountStatus?: string;
  role?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  shippingAddress: Address;
}

export interface Category {
  id?: string;
  categoryId?: number;
  name: string;
  description: string;
  image?: string;
  isActive?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
} 