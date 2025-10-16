import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseAuthUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
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
      try {
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const firestoreData = userDocSnap.data() as DocumentData;
            const appUser: User = {
              ...user,
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              ...firestoreData,
            };
            setCurrentUser(appUser);
          } else {
            // User exists in Auth, but not in Firestore database.
            // This can happen during sign-up before the user document is created.
            setCurrentUser(user as User);
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Authentication Error:", error);
        // If there's an error, we should still stop loading and maybe clear the user.
        setCurrentUser(null);
      } finally {
        // This will run regardless of whether there was an error or not.
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const value = { currentUser, loading };
  
  // Render children immediately. The children components can use the 'loading'
  // state from the context to show loading indicators.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
