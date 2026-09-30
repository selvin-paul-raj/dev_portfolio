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

function persistTheme(theme: Theme) {
  try {
    window.localStorage.setItem("theme", theme);
  } catch {
    // Storage can be unavailable (private mode, blocked cookies); the theme still applies for this visit.
  }
}

export default function ThemeContextProvider({
  children,
}: ThemeContextProviderProps) {
  // Always start "light" on SSR so server/client HTML matches during hydration
  const [theme, setTheme] = useState<Theme>("light");
  // The blocking inline script in layout.tsx already set the correct `dark`
  // class before paint — this gate stops the mount-time render (theme="light")
  // from stripping that class out before localStorage has been read.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Sync after hydration via startTransition so the update is non-urgent
    // and does not count as a direct synchronous setState inside an effect.
    // The inline script is the source of truth for the initial theme.
    const initial: Theme = document.documentElement.classList.contains("dark") ? "dark" : "light";
    startTransition(() => {
      setHydrated(true);
      setTheme(initial);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme, hydrated]);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      persistTheme("dark");
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
      persistTheme("light");
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
