export interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  image: string;
  imageUrl?: string; // For bouquet API compatibility
  category: string | Category;
  inStock: boolean;
  quantity: number;
  tags: string[];
  isActive?: boolean;
  compositions?: BouquetComposition[];
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
  id: string | number;
  userId: string | number;
  items?: OrderItem[];
  total: number;
  status: string;
  createdAt: string | Date;
  shippingAddress?: Address | string;
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

export interface Flower {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  isActive?: boolean;
}

export interface BouquetComposition {
  id: number;
  flowerId: number;
  minQuantity: number;
  maxQuantity: number;
  quantity: number;
  isActive: boolean;
  // Optional enriched data fetched client-side
  flower?: Flower;
  unitPrice?: number;
  defaultQuantity?: number;
}

export interface BouquetApiResponse {
  message: string;
  status: string;
  data: BouquetData;
}

export interface BouquetData {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  isActive: boolean;
  compositions: BouquetComposition[];
  category: Category;
}

export interface Feedback {
  id?: number;
  userId: number;
  bouquetId: number;
  orderItemId?: number;
  rating: number; // 1-5
  comment: string;
  isActive?: boolean;
  createdAt?: string;
  userName?: string;
}

export interface Paged<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
}

export interface OrderItem {
  id: number | string;
  bouquetId: number | string;
  product?: Product;
  quantity: number;
  subTotal?: number;
  isActive?: boolean;
}

export interface DeliveryHistory {
  id: number;
  orderId: number;
  status: string;
  note?: string;
  createdAt: string | Date;
} 

export interface Promotion {
  id: number;
  code: string;
  discountPercentage: number; // 0-100
  validFrom?: string;
  validTo?: string;
  isActive?: boolean;
}