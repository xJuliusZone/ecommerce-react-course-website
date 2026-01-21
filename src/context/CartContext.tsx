import { createContext, useState, useContext } from "react";
import type { ReactNode } from "react";
import { getProductById, type Product } from "../data/products";

export interface CartItem {
  id: number;
  quantity: number;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}

interface CartContextValue {
  cartItems: CartItem[];
  addToCart: (productId: number) => void;
  getCartItemsWithProducts: () => CartItemWithProduct[];
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  getCartTotal: () => number;
  clearCart: () => void;
}

interface CartProviderProps {
  children: ReactNode;
}

const CartContext = createContext<CartContextValue | null>(null);

export default function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  function addToCart(productId: number) {
    const existing = cartItems.find((item) => item.id === productId);
    if (existing) {
      const currentQuantity = existing.quantity;
      const updatedCartItems = cartItems.map((item) =>
        item.id === productId
          ? { id: productId, quantity: currentQuantity + 1 }
          : item
      );
      setCartItems(updatedCartItems);
    } else {
      setCartItems([...cartItems, { id: productId, quantity: 1 }]);
    }
  }

  function getCartItemsWithProducts(): CartItemWithProduct[] {
    return cartItems
      .map((item) => ({
        ...item,
        product: getProductById(item.id),
      }))
      .filter((item): item is CartItemWithProduct => Boolean(item.product));
  }

  function removeFromCart(productId: number) {
    setCartItems(cartItems.filter((item) => item.id !== productId));
  }

  function updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(
      cartItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }

  function getCartTotal() {
    const total = cartItems.reduce((total, item) => {
      const product = getProductById(item.id);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
    return total;
  }

  function clearCart() {
    setCartItems([]);
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        getCartItemsWithProducts,
        removeFromCart,
        updateQuantity,
        getCartTotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
