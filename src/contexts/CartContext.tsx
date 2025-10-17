
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot, collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  checkout: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      const localCart = localStorage.getItem('localCart');
      if (localCart) setCartItems(JSON.parse(localCart));
      return;
    }

    const cartRef = doc(db, 'carts', user.uid);
    const unsubscribe = onSnapshot(cartRef, (docSnap) => {
      if (docSnap.exists()) {
        setCartItems(docSnap.data().items || []);
      } else {
        setCartItems([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const updateCartInFirestore = async (items: CartItem[]) => {
    if (user) {
      const cartRef = doc(db, 'carts', user.uid);
      await setDoc(cartRef, { items });
    } else {
      localStorage.setItem('localCart', JSON.stringify(items));
    }
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    const newItems = [...cartItems];
    const existingItemIndex = newItems.findIndex(i => i.id === item.id);
    if (existingItemIndex > -1) {
      newItems[existingItemIndex].quantity += 1;
    } else {
      newItems.push({ ...item, quantity: 1 });
    }
    setCartItems(newItems);
    updateCartInFirestore(newItems);
  };

  const removeFromCart = (id: string) => {
    const newItems = cartItems.filter(item => item.id !== id);
    setCartItems(newItems);
    updateCartInFirestore(newItems);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const newItems = cartItems.map(item => (item.id === id ? { ...item, quantity } : item));
    setCartItems(newItems);
    updateCartInFirestore(newItems);
  };

  const clearCart = () => {
    setCartItems([]);
    updateCartInFirestore([]);
  };

  const checkout = async () => {
    if (!user || cartItems.length === 0) {
      throw new Error("User not logged in or cart is empty");
    }

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    
    const orderData = {
      userId: user.uid,
      items: cartItems,
      total,
      createdAt: serverTimestamp(),
      status: 'pending', 
    };

    try {
      await addDoc(collection(db, 'orders'), orderData);
      clearCart();
    } catch (error) {
      console.error("Error creating order: ", error);
      throw error;
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, checkout }}>
      {children}
    </CartContext.Provider>
  );
};
