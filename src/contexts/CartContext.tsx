import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { collection, onSnapshot, addDoc, doc, deleteDoc, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './AuthContext';

// Data Interfaces
interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  loadingCart: boolean;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  loadingCart: true,
});

export const useCart = () => useContext(CartContext);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loadingCart, setLoadingCart] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setCartItems([]);
      setLoadingCart(false);
      return;
    }

    const cartRef = collection(db, 'users', currentUser.uid, 'cart');
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CartItem));
      setCartItems(items);
      setLoadingCart(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const addToCart = useCallback(async (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => {
    if (!currentUser) throw new Error("Giriş yapmalısınız.");

    const cartRef = collection(db, 'users', currentUser.uid, 'cart');
    const q = query(cartRef, where("menuItemId", "==", item.menuItemId));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Item exists, update quantity
      const existingDoc = querySnapshot.docs[0];
      const newQuantity = existingDoc.data().quantity + (item.quantity || 1);
      await updateDoc(doc(db, 'users', currentUser.uid, 'cart', existingDoc.id), { quantity: newQuantity });
    } else {
      // Item does not exist, add new
      await addDoc(cartRef, { ...item, quantity: item.quantity || 1 });
    }
  }, [currentUser]);

  const removeFromCart = useCallback(async (itemId: string) => {
    if (!currentUser) throw new Error("Giriş yapmalısınız.");
    await deleteDoc(doc(db, 'users', currentUser.uid, 'cart', itemId));
  }, [currentUser]);

  const clearCart = useCallback(async () => {
    if (!currentUser) throw new Error("Giriş yapmalısınız.");
    cartItems.forEach(item => {
        deleteDoc(doc(db, 'users', currentUser.uid, 'cart', item.id));
    });
  }, [currentUser, cartItems]);

  const value = { cartItems, addToCart, removeFromCart, clearCart, loadingCart };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
