"use client";

import React, { useEffect, useState, createContext, useContext, startTransition } from "react";
import { MotionConfig } from "framer-motion";
import toast from "react-hot-toast";

type Theme = "light" | "dark";

type ThemeContextProviderProps = {
  children: React.ReactNode;
};

type ThemeContextType = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export default function ThemeContextProvider({
  children,
}: ThemeContextProviderProps) {
  // Always start "light" on SSR so server/client HTML matches during hydration
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    // Sync after hydration via startTransition so the update is non-urgent
    // and does not count as a direct synchronous setState inside an effect.
    const stored = window.localStorage.getItem("theme") as Theme | null;
    startTransition(() => setTheme(stored ?? "dark"));
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      window.localStorage.setItem("theme", "dark");
      toast("Eyes in the dark!", {
        icon: "🌚",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
        position: "top-left",
      });
    } else {
      setTheme("light");
      window.localStorage.setItem("theme", "light");
      toast("Illuminate your screen!", {
        icon: "☀️",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
        position: "top-left",
      });
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <ThemeContext.Provider value={{ theme, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    </MotionConfig>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error("useTheme must be used within a ThemeContextProvider");
  }

  return context;
}
