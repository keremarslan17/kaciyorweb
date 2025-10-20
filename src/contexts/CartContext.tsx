
import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot, collection, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { MenuItem } from '../pages/RestaurantMenu'; // Import the rich MenuItem interface

// CartItem is now an extension of MenuItem, with a quantity
export interface CartItem extends MenuItem {
  quantity: number;
}

interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];
}

interface CartContextType {
  cart: CartItem[];
  cartState: CartState;
  addToCart: (item: MenuItem, restaurantInfo: { id: string; name: string }) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  createOrder: (tableNumber: string) => Promise<string | null>; // Returns QR Code data or null
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
  const [cartState, setCartState] = useState<CartState>({ restaurantId: null, restaurantName: null, items: [] });
  const { user, userProfile } = useAuth(); // Assuming userProfile contains loyalty balances

  useEffect(() => {
    if (!user) {
      const localCart = localStorage.getItem('localCart');
      if (localCart) setCartState(JSON.parse(localCart));
      return;
    }

    const cartRef = doc(db, 'carts', user.uid);
    const unsubscribe = onSnapshot(cartRef, (docSnap) => {
      if (docSnap.exists()) {
        setCartState(docSnap.data() as CartState);
      } else {
        setCartState({ restaurantId: null, restaurantName: null, items: [] });
      }
    });

    return () => unsubscribe();
  }, [user]);

  const updateCartInFirestore = async (newCartState: CartState) => {
    if (user) {
      await setDoc(doc(db, 'carts', user.uid), newCartState);
    } else {
      localStorage.setItem('localCart', JSON.stringify(newCartState));
    }
  };

  const clearCart = () => {
    const newState = { restaurantId: null, restaurantName: null, items: [] };
    setCartState(newState);
    updateCartInFirestore(newState);
  };

  const addToCart = (item: MenuItem, restaurantInfo: { id: string; name: string }) => {
    if (cartState.restaurantId && cartState.restaurantId !== restaurantInfo.id) {
      if (window.confirm(`Sepetinizde başka bir restorana ait ürünler bulunmaktadır (${cartState.restaurantName}). Sepetinizi temizleyip bu ürünü eklemek ister misiniz?`)) {
        const newState = { restaurantId: restaurantInfo.id, restaurantName: restaurantInfo.name, items: [{ ...item, quantity: 1 }] };
        setCartState(newState);
        updateCartInFirestore(newState);
      }
      return;
    }

    const newItems = [...cartState.items];
    const existingItemIndex = newItems.findIndex(i => i.id === item.id);
    if (existingItemIndex > -1) {
      newItems[existingItemIndex].quantity += 1;
    } else {
      newItems.push({ ...item, quantity: 1 });
    }
    
    const newState = { restaurantId: restaurantInfo.id, restaurantName: restaurantInfo.name, items: newItems };
    setCartState(newState);
    updateCartInFirestore(newState);
  };

  const removeFromCart = (id: string) => {
    const newItems = cartState.items.filter(item => item.id !== id);
    if (newItems.length === 0) {
      clearCart();
    } else {
      const newState = { ...cartState, items: newItems };
      setCartState(newState);
      updateCartInFirestore(newState);
    }
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    const newItems = cartState.items.map(item => (item.id === id ? { ...item, quantity } : item));
    const newState = { ...cartState, items: newItems };
    setCartState(newState);
    updateCartInFirestore(newState);
  };

  const createOrder = async (tableNumber: string): Promise<string | null> => {
    if (!user || cartState.items.length === 0 || !cartState.restaurantId) {
        alert("Sipariş oluşturmak için sepetinizde ürün olmalı ve giriş yapmalısınız.");
        return null;
    }

    try {
        const total = cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        
        const orderData = {
            userId: user.uid,
            userName: userProfile?.name || user.email,
            restaurantId: cartState.restaurantId,
            restaurantName: cartState.restaurantName,
            items: cartState.items,
            total,
            tableNumber,
            createdAt: serverTimestamp(),
            status: 'pending_confirmation', // Garsonun onayını bekliyor
        };
        
        const orderRef = await addDoc(collection(db, 'orders'), orderData);
        
        // QR Kod için sipariş ID'sini döndür
        const qrData = JSON.stringify({ orderId: orderRef.id, restaurantId: cartState.restaurantId });
        
        // Sipariş oluşturulduktan sonra sepeti temizle
        await clearCart();

        return qrData;

    } catch (error) {
        console.error("Error creating order:", error);
        alert("Sipariş oluşturulurken bir hata oluştu.");
        return null;
    }
  };

  return (
    <CartContext.Provider value={{ cart: cartState.items, cartState, addToCart, removeFromCart, updateQuantity, clearCart, createOrder }}>
      {children}
    </CartContext.Provider>
  );
};
