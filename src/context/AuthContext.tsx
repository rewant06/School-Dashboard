"use client"; // Marking this file as a client component.

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@/lib/firebase"; // Import your Firebase app configuration.

type AuthContextType = {
  user: User | null; // The currently logged-in user or null if not authenticated.
  loading: boolean; // Whether the authentication state is still loading.
};

const AuthContext = createContext<AuthContextType | undefined>(undefined); // Creating the AuthContext.

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null); // State to store the authenticated user.
  const [loading, setLoading] = useState<boolean>(true); // State to track whether the authentication state is loading.

  useEffect(() => {
    const auth = getAuth(app); // Get the Firebase Auth instance.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update the user state when the authentication state changes.
      setLoading(false); // Set loading to false once the authentication state is determined.
    });

    return () => unsubscribe(); // Cleanup the subscription on component unmount.
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}> {/* Provide the user and loading state to child components */}
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext); // Access the AuthContext.
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider"); // Throw an error if used outside the AuthProvider.
  }
  return context;
};