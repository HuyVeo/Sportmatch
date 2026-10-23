"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

type DiscoverIntroContextValue = {
  hasSeenIntro: boolean;
  setHasSeenIntro: Dispatch<SetStateAction<boolean>>;
};

const DiscoverIntroContext =
  createContext<DiscoverIntroContextValue | null>(null);

export function DiscoverIntroProvider({ children }: { children: ReactNode }) {
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const value = useMemo(
    () => ({ hasSeenIntro, setHasSeenIntro }),
    [hasSeenIntro],
  );

  return (
    <DiscoverIntroContext.Provider value={value}>
      {children}
    </DiscoverIntroContext.Provider>
  );
}

export function useDiscoverIntro() {
  const context = useContext(DiscoverIntroContext);
  if (!context) {
    throw new Error(
      "useDiscoverIntro must be used within a DiscoverIntroProvider.",
    );
  }
  return context;
}
