import React from "react";
import { Sidebar } from "./Sidebar";
import { useWallet } from "@/providers/WalletProvider";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Plus } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isConnected } = useWallet();
  const [location, setLocation] = useLocation();

  const getHeaderTitle = (): string => {
    switch (location) {
      case "/":
        return "Group Wallet Dashboard";
      case "/team-members":
        return "Team Members";
      case "/delegations":
        return "Delegations";
      case "/transactions":
        return "Transactions";
      case "/settings":
        return "Settings";
      default:
        return "DelegateWallet";
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col md:flex-row h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex h-full items-center justify-center">
            <div className="max-w-md text-center p-6">
              <h2 className="text-2xl font-bold mb-4">Please Connect Your Wallet</h2>
              <p className="text-muted-foreground mb-6">
                You need to connect your MetaMask wallet to access the application.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{getHeaderTitle()}</h2>
            <div className="flex items-center space-x-4">
              {(location === "/" || location === "/delegations") && (
                <Button 
                  onClick={() => setLocation("/delegations")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Delegation
                </Button>
              )}
              <div className="relative">
                <button className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-lg font-medium">
                  DW
                </button>
              </div>
            </div>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
