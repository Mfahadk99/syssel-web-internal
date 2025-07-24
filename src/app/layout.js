"use client";
import { Geist, Geist_Mono, Cabin } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar/Sidebar";
import { usePathname } from "next/navigation";
import Providers from "./providers";
import { UserProvider } from "./context/UserContext";
import ProtectedRoute from "./components/Reusable/ProtectedRoute";

const cabin = Cabin({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cabin",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const authPages = ["/signin", "/signup", "/forgot-pass"];
  const isAuthPage = authPages.includes(pathname);

  return (
    <html lang="en">
      <body
        className={`${cabin.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <UserProvider>
            <div className="flex">
              <Sidebar />
              <div className="w-full overflow-hidden">
                <ProtectedRoute>{children}</ProtectedRoute>
              </div>
            </div>
          </UserProvider>
        </Providers>
      </body>
    </html>
  );
}
