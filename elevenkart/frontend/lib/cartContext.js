import { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

const initialState = {
  cartItems: [],
  wishlistItems: [],
  isOpen: false,
};

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingCartItem = state.cartItems.find(
        item => item.id === action.payload.id && 
        JSON.stringify(item.variant) === JSON.stringify(action.payload.variant)
      );

      if (existingCartItem) {
        return {
          ...state,
          cartItems: state.cartItems.map(item =>
            item.id === action.payload.id && 
            JSON.stringify(item.variant) === JSON.stringify(action.payload.variant)
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      } else {
        return {
          ...state,
          cartItems: [...state.cartItems, action.payload],
        };
      }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cartItems: state.cartItems.filter(
          item => !(item.id === action.payload.id && 
          JSON.stringify(item.variant) === JSON.stringify(action.payload.variant))
        ),
      };

    case 'UPDATE_CART_ITEM_QUANTITY':
      return {
        ...state,
        cartItems: state.cartItems.map(item =>
          item.id === action.payload.id && 
          JSON.stringify(item.variant) === JSON.stringify(action.payload.variant)
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };

    case 'CLEAR_CART':
      return {
        ...state,
        cartItems: [],
      };

    case 'ADD_TO_WISHLIST':
      const existingWishlistItem = state.wishlistItems.find(
        item => item.id === action.payload.id
      );

      if (!existingWishlistItem) {
        return {
          ...state,
          wishlistItems: [...state.wishlistItems, action.payload],
        };
      }
      return state;

    case 'REMOVE_FROM_WISHLIST':
      return {
        ...state,
        wishlistItems: state.wishlistItems.filter(
          item => item.id !== action.payload.id
        ),
      };

    case 'CLEAR_WISHLIST':
      return {
        ...state,
        wishlistItems: [],
      };

    case 'TOGGLE_CART':
      return {
        ...state,
        isOpen: !state.isOpen,
      };

    case 'CLOSE_CART':
      return {
        ...state,
        isOpen: false,
      };

    case 'LOAD_CART':
      return {
        ...state,
        cartItems: action.payload.cartItems || [],
        wishlistItems: action.payload.wishlistItems || [],
      };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('elevenkart-cart');
    const savedWishlist = localStorage.getItem('elevenkart-wishlist');

    if (savedCart || savedWishlist) {
      dispatch({
        type: 'LOAD_CART',
        payload: {
          cartItems: savedCart ? JSON.parse(savedCart) : [],
          wishlistItems: savedWishlist ? JSON.parse(savedWishlist) : [],
        },
      });
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('elevenkart-cart', JSON.stringify(state.cartItems));
  }, [state.cartItems]);

  useEffect(() => {
    localStorage.setItem('elevenkart-wishlist', JSON.stringify(state.wishlistItems));
  }, [state.wishlistItems]);

  const addToCart = (product, quantity = 1, variant = null) => {
    const cartItem = {
      id: product._id || product.id,
      name: product.name,
      price: variant ? variant.price : product.price,
      image: product.mainImage,
      sku: product.sku,
      variant: variant,
      quantity: quantity,
      stock: variant ? variant.stock : product.stock,
    };

    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (product, variant = null) => {
    dispatch({ 
      type: 'REMOVE_FROM_CART', 
      payload: { id: product.id || product._id, variant } 
    });
    toast.success(`${product.name} removed from cart!`);
  };

  const updateCartItemQuantity = (product, quantity, variant = null) => {
    if (quantity <= 0) {
      removeFromCart(product, variant);
      return;
    }

    dispatch({
      type: 'UPDATE_CART_ITEM_QUANTITY',
      payload: { id: product.id || product._id, quantity, variant },
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.success('Cart cleared!');
  };

  const addToWishlist = (product) => {
    const wishlistItem = {
      id: product._id || product.id,
      name: product.name,
      price: product.price,
      image: product.mainImage,
      sku: product.sku,
    };

    dispatch({ type: 'ADD_TO_WISHLIST', payload: wishlistItem });
    toast.success(`${product.name} added to wishlist!`);
  };

  const removeFromWishlist = (product) => {
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: { id: product.id || product._id } });
    toast.success(`${product.name} removed from wishlist!`);
  };

  const clearWishlist = () => {
    dispatch({ type: 'CLEAR_WISHLIST' });
    toast.success('Wishlist cleared!');
  };

  const toggleCart = () => {
    dispatch({ type: 'TOGGLE_CART' });
  };

  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };

  const getCartTotal = () => {
    return state.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return state.cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const isInCart = (product, variant = null) => {
    return state.cartItems.some(
      item => item.id === (product._id || product.id) && 
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );
  };

  const isInWishlist = (product) => {
    return state.wishlistItems.some(item => item.id === (product._id || product.id));
  };

  const getCartItem = (product, variant = null) => {
    return state.cartItems.find(
      item => item.id === (product._id || product.id) && 
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );
  };

  const value = {
    cartItems: state.cartItems,
    wishlistItems: state.wishlistItems,
    isOpen: state.isOpen,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    toggleCart,
    closeCart,
    getCartTotal,
    getCartItemsCount,
    isInCart,
    isInWishlist,
    getCartItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};