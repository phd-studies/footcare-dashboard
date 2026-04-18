import { createContext, useContext, type ReactNode } from "react";

// Mock Clerk-style auth. Swap with @clerk/clerk-react <ClerkProvider> when keys are available.
type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl: string;
};

type AuthCtx = {
  isSignedIn: boolean;
  user: User | null;
  signOut: () => void;
};

const MOCK_USER: User = {
  id: "user_mock_1",
  firstName: "Eleanor",
  lastName: "Hayes",
  email: "eleanor.hayes@example.com",
  imageUrl: "https://i.pravatar.cc/160?img=47",
};

const Ctx = createContext<AuthCtx>({
  isSignedIn: true,
  user: MOCK_USER,
  signOut: () => {},
});

export function ClerkProvider({ children }: { children: ReactNode }) {
  // If real Clerk keys exist, you'd render Clerk's provider here instead.
  return (
    <Ctx.Provider value={{ isSignedIn: true, user: MOCK_USER, signOut: () => {} }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
export const useUser = () => {
  const { user, isSignedIn } = useContext(Ctx);
  return { user, isSignedIn, isLoaded: true };
};
