import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from '@/hooks/use-toast';
import { Product, ProductWithImages } from '@/services/productService';

export interface CartItem {
  id: string;
  product: ProductWithImages;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: ProductWithImages, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'mzad_cart_items';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  
  // Load cart from local storage on initial load
  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        setItems(JSON.parse(storedCart));
      } catch (error) {
        console.error('Failed to parse cart data from localStorage:', error);
      }
    }
  }, []);
  
  // Save cart to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);
  
  const addToCart = (product: ProductWithImages, quantity: number = 1) => {
    // Don't allow adding auction items to cart
    if (product.is_auction) {
      toast({
        title: "Can't add to cart",
        description: "Auction items must be bid on, not added to cart.",
        variant: "destructive",
      });
      return;
    }
    
    setItems(currentItems => {
      // Check if item is already in cart
      const existingItem = currentItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Increase quantity if item exists
        const updatedItems = currentItems.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + quantity } 
            : item
        );
        toast({
          title: "Updated cart",
          description: `${product.title} quantity updated in your cart.`,
        });
        return updatedItems;
      } else {
        // Add new item
        toast({
          title: "Added to cart",
          description: `${product.title} added to your cart.`,
        });
        return [...currentItems, { id: product.id, product, quantity }];
      }
    });
  };
  
  const removeFromCart = (id: string) => {
    setItems(currentItems => {
      const item = currentItems.find(item => item.id === id);
      const newItems = currentItems.filter(item => item.id !== id);
      
      if (item) {
        toast({
          title: "Removed from cart",
          description: `${item.product.title} removed from your cart.`,
        });
      }
      
      return newItems;
    });
  };
  
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    
    setItems(currentItems => 
      currentItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  const clearCart = () => {
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    });
  };
  
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  
  const subtotal = items.reduce((total, item) => {
    const price = Number(item.product.price || 0);
    return total + (price * item.quantity);
  }, 0);
  
  return (
    <CartContext.Provider 
      value={{ 
        items, 
        addToCart, 
        removeFromCart, 
        updateQuantity, 
        clearCart, 
        itemCount, 
        subtotal 
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
