import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import { LoaderProvider } from "./context/LoaderContext";
import { SidebarStatusProvider } from "./context/SidebarStatus";

export default function Providers({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <LoaderProvider>
      <SidebarStatusProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster position="top-center" />
          {children}
        </QueryClientProvider>
      </SidebarStatusProvider>
    </LoaderProvider>
  );
}
