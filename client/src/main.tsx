import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { WalletProvider } from "./providers/WalletProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "next-themes";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark">
      <WalletProvider>
        <App />
      </WalletProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
