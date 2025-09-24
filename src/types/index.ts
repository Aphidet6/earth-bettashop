// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  createdAt: Date;
  updatedAt: Date;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  shippingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}

// Address Types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}