import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";

interface User {
  email: string;
}

interface StoredUser extends User {
  password: string;
}

interface AuthResult {
  success: boolean;
  error?: string;
}

interface AuthContextValue {
  user: User | null;
  signUp: (email: string, password: string) => AuthResult;
  login: (email: string, password: string) => AuthResult;
  logout: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isStoredUser(value: unknown): value is StoredUser {
  return (
    typeof value === "object" &&
    value !== null &&
    "email" in value &&
    "password" in value &&
    typeof value.email === "string" &&
    typeof value.password === "string"
  );
}

function getStoredUsers(): StoredUser[] {
  const users = JSON.parse(localStorage.getItem("users") || "[]") as unknown;

  return Array.isArray(users) ? users.filter(isStoredUser) : [];
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(() => {
    const currentUserEmail = localStorage.getItem("currentUserEmail");

    return currentUserEmail ? { email: currentUserEmail } : null;
  });

  function signUp(email: string, password: string): AuthResult {
    const users = getStoredUsers();

    if (users.find((u) => u.email === email)) {
      return { success: false, error: "Email already exists" };
    }
    const newUser = { email, password };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUserEmail", email);

    setUser({ email });

    return { success: true };
  }

  function login(email: string, password: string): AuthResult {
    const users = getStoredUsers();
    const user = users.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return { success: false, error: "Invalid email or password" };
    }

    localStorage.setItem("currentUserEmail", email);
    setUser({ email });

    return { success: true };
  }

  function logout() {
    localStorage.removeItem("currentUserEmail");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signUp, user, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
