import { createContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";
import { getRoleByEmail } from "../helpers/roleHelpers";

type UserRole = "client" | "admin";

interface AppUser {
  uid: string;
  email: string | null;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: UserRole;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AppUser>;
  register: (data: RegisterData) => Promise<AppUser>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const getUserProfile = async (uid: string, email: string | null) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();

      return {
        uid,
        email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role || "client",
      } as AppUser;
    }

    return {
      uid,
      email,
      role: "client",
    } as AppUser;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid, firebaseUser.email);
        setUser(profile);
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const register = async (data: RegisterData) => {
    const credentials = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    const role = getRoleByEmail(data.email);

    const newUser: AppUser = {
      uid: credentials.user.uid,
      email: credentials.user.email,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role,
    };

    await setDoc(doc(db, "users", credentials.user.uid), {
      uid: credentials.user.uid,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email,
      role,
      createdAt: new Date().toISOString(),
    });

    setUser(newUser);
    return newUser;
  };

  const login = async (email: string, password: string) => {
    const credentials = await signInWithEmailAndPassword(auth, email, password);
    const profile = await getUserProfile(credentials.user.uid, credentials.user.email);

    setUser(profile);
    return profile;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}