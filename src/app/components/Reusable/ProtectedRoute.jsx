"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import useAuthStore from "../../store/useAuthStore";

const PUBLIC_ROUTES = [
  "/signin",
  "/signup",
  "/confirm-email",
  "/buyer-signup",
  "/provider-signup",
];

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const isAuthenticated = localStorage.getItem("auth-storage");

  console.log(isAuthenticated, "isAuthenticatedddddddddddddddd");

  useEffect(() => {
    if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
      router.push("/signin");
    }
  }, [isAuthenticated, pathname, router]);

  if (!isAuthenticated && !PUBLIC_ROUTES.includes(pathname)) {
    return null;
  }

  return children;
}
