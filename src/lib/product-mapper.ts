import { Product } from '@/types/product';

// Helper to map database product to UI product format
export const mapDbProductToUI = (dbProduct: any): Product & { 
  image: string; 
  category: string; 
  inStock: boolean;
  rating?: number;
  reviews?: number;
  tags?: string[];
} => {
  return {
    ...dbProduct,
    image: dbProduct.image_url || '/placeholder.svg',
    image_url: dbProduct.image_url || '/placeholder.svg',
    category: dbProduct.category_id || 'general',
    category_id: dbProduct.category_id,
    inStock: dbProduct.in_stock ?? true,
    in_stock: dbProduct.in_stock ?? true,
    rating: 4.5, // Default rating
    reviews: Math.floor(Math.random() * 100) + 10, // Default reviews
    tags: [],
  };
};
