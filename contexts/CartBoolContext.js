import { createContext, useContext, useState } from 'react';

// Create Context
const CartBoolContext = createContext();

// Provider Component
export const BooleanProvider = ({ children }) => {
  const [isBooleanValue, setBooleanValue] = useState(false);

  return (
    <CartBoolContext.Provider value={{ isBooleanValue, setBooleanValue }}>
      {children}
    </CartBoolContext.Provider>
  );
};

// Custom Hook for using context
export const useBooleanValue = () => {
  return useContext(CartBoolContext);
};
