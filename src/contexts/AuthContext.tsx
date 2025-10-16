import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseAuthUser } from 'firebase/auth'; // Düzeltildi
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore'; // Düzeltildi
import { auth, db } from '../firebase';

export interface User extends FirebaseAuthUser {
  role?: string; name?: string; phone?: string;
  school?: string; address?: string; restaurantId?: string;
}

interface AuthContextType { currentUser: User | null; loading: boolean; }

const AuthContext = createContext<AuthContextType>({ currentUser: null, loading: true });
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const firestoreData = userDocSnap.data() as DocumentData;
          setCurrentUser({ ...user, ...firestoreData });
        } else {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = { currentUser, loading };
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
