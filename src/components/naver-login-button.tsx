"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export function NaverLoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      // Initiates the Auth.js Naver login flow
      // Custom callback URL can be provided here if needed
      await signIn("naver", { callbackUrl: "/" });
    } catch (error) {
      console.error("Naver login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      disabled={isLoading}
      onClick={handleLogin}
      className="flex w-full items-center justify-center gap-2 rounded-md bg-[#03C75A] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#02b350] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {isLoading ? (
        <span className="animate-spin text-white">⟳</span>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M16.0396 11.2338L8.6049 0H0V24H7.96207V12.7662L15.3968 24H24V0H16.0396V11.2338Z"
            fill="currentColor"
          />
        </svg>
      )}
      <span>Log in with Naver</span>
    </button>
  );
}
