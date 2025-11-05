import type { Timestamp } from 'firebase/firestore';

export type OrderStatus = 'pending' | 'shipped' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  imageCdnUrl?: string;
}

export interface Order {
  id: string;
  userId: string;
  orderDate: Timestamp;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: string;
  customerName: string;
  customerPhone: string;
  shippingMethod: string;
  shippingCost: number;
  orderNote?: string;
  items?: OrderItem[]; // Optional: for client-side convenience
}
