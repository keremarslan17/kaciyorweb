
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

interface CartState {
  restaurantId: string | null;
  restaurantName: string | null;
  items: CartItem[];
}

interface CartContextType {
  cart: CartItem[]; // EXPOSE THE CART ITEMS DIRECTLY
  cartState: CartState;
  addToCart: (item: Omit<CartItem, 'quantity'>, restaurantInfo: { id: string; name: string }) => void;
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
  const [cartState, setCartState] = useState<CartState>({ restaurantId: null, restaurantName: null, items: [] });
  const { user } = useAuth();

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

  const addToCart = (item: Omit<CartItem, 'quantity'>, restaurantInfo: { id: string; name: string }) => {
    if (cartState.restaurantId && cartState.restaurantId !== restaurantInfo.id) {
      if (window.confirm(`Farklı bir restorandan ürün ekleyemezsiniz. Mevcut sepet (${cartState.restaurantName}) silinsin mi?`)) {
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

  const checkout = async () => {
    if (!user || cartState.items.length === 0) throw new Error("User not logged in or cart is empty");
    const total = cartState.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderData = {
      userId: user.uid,
      restaurantId: cartState.restaurantId,
      restaurantName: cartState.restaurantName,
      items: cartState.items,
      total,
      createdAt: serverTimestamp(),
      status: 'pending', 
    };
    await addDoc(collection(db, 'orders'), orderData);
    clearCart();
  };

  return (
    <CartContext.Provider value={{ cart: cartState.items, cartState, addToCart, removeFromCart, updateQuantity, clearCart, checkout }}>
      {children}
    </CartContext.Provider>
  );
};
