import React, { createContext, useContext } from "react";

export type Theme = {
  theme: "light" | "dark";
  light: { [key: string]: any };
  dark: { [key: string]: any };
};

const context = createContext<Theme | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <context.Provider value={{ theme: "light", light: {}, dark: {} }}>
      {children}
    </context.Provider>
  );
};

export const useTheme = () => {
  const theme = useContext(context);
  return theme;
};
