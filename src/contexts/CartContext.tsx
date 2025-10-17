
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

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
    let unsubscribe: () => void = () => {};

    if (user) {
      const cartRef = doc(db, 'carts', user.uid);
      unsubscribe = onSnapshot(cartRef, (docSnap) => {
        if (docSnap.exists()) {
          const source = docSnap.metadata.hasPendingWrites ? "Local" : "Server";
          console.log(`Cart data came from ${source}`);
          const data = docSnap.data() as { items: CartItem[] };
          setCartItems(data.items || []);
        } else {
          setCartItems([]);
        }
      });
    } else {
      // Handle non-logged in user cart, maybe from localStorage
      const localCart = localStorage.getItem('localCart');
      if (localCart) {
        setCartItems(JSON.parse(localCart));
      }
    }

    return () => unsubscribe();
  }, [user]);

  const updateFirestoreCart = async (newCartItems: CartItem[]) => {
    if (user) {
      const cartRef = doc(db, 'carts', user.uid);
      await setDoc(cartRef, { items: newCartItems }, { merge: true });
    } else {
      localStorage.setItem('localCart', JSON.stringify(newCartItems));
    }
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      let newItems;
      if (existingItem) {
        newItems = prevItems.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        newItems = [...prevItems, { ...item, quantity: 1 }];
      }
      updateFirestoreCart(newItems);
      return newItems;
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => item.id !== id);
      updateFirestoreCart(newItems);
      return newItems;
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id);
      return;
    }
    setCartItems(prevItems => {
      const newItems = prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      updateFirestoreCart(newItems);
      return newItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    if (user) {
        const cartRef = doc(db, 'carts', user.uid);
        setDoc(cartRef, { items: [] });
    } else {
        localStorage.removeItem('localCart');
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
