"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface GuestModeContextValue {
  isGuestMode: boolean;
  setGuestMode: (value: boolean) => void;
  clearGuestMode: () => void;
}

const GuestModeContext = createContext<GuestModeContextValue | undefined>(
  undefined
);

const STORAGE_KEY = "vizual_guest_mode";

export function GuestModeProvider({ children }: { children: ReactNode }) {
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      setIsGuestMode(stored === "true");
    } catch (error) {
      console.warn("Unable to read guest mode flag", error);
    }
  }, []);

  const updateGuestMode = useCallback((value: boolean) => {
    setIsGuestMode(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value.toString());
    } catch (error) {
      console.warn("Unable to persist guest mode flag", error);
    }
  }, []);

  const clearGuestMode = useCallback(() => {
    setIsGuestMode(false);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Unable to clear guest mode flag", error);
    }
  }, []);

  const value = useMemo(
    () => ({ isGuestMode, setGuestMode: updateGuestMode, clearGuestMode }),
    [clearGuestMode, isGuestMode, updateGuestMode]
  );

  return (
    <GuestModeContext.Provider value={value}>
      {children}
    </GuestModeContext.Provider>
  );
}

export function useGuestMode() {
  const context = useContext(GuestModeContext);
  if (!context) {
    throw new Error("useGuestMode must be used within GuestModeProvider");
  }
  return context;
}
