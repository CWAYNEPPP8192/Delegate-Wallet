import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  WalletConnection, 
  connectMetaMask, 
  getChainId, 
  subscribeToAccountsChanged, 
  subscribeToChainChanged,
  getBalance
} from "../lib/wallet";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface WalletContextType {
  isConnected: boolean;
  connection: WalletConnection | null;
  chainId: string | null;
  address: string | null;
  balance: string;
  connectWallet: () => Promise<boolean>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType>({
  isConnected: false,
  connection: null,
  chainId: null,
  address: null,
  balance: "0",
  connectWallet: async () => false,
  disconnectWallet: () => {},
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connection, setConnection] = useState<WalletConnection | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [balance, setBalance] = useState("0");
  const { toast } = useToast();

  const updateBalance = async (address: string) => {
    const newBalance = await getBalance(address);
    setBalance(newBalance);
  };

  const connectWallet = async (): Promise<boolean> => {
    try {
      const conn = await connectMetaMask();
      if (!conn) {
        throw new Error("Failed to connect to MetaMask");
      }
      
      setConnection(conn);
      setIsConnected(true);
      
      const currentChainId = await getChainId();
      setChainId(currentChainId);
      
      await updateBalance(conn.address);
      
      // Register user in our system
      await apiRequest("POST", "/api/users", {
        address: conn.address,
      });
      
      toast({
        title: "Connected",
        description: "Your wallet has been connected successfully.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error.message || "Could not connect to wallet",
      });
      return false;
    }
  };

  const disconnectWallet = () => {
    setConnection(null);
    setIsConnected(false);
    setChainId(null);
    setBalance("0");
    
    toast({
      title: "Disconnected",
      description: "Your wallet has been disconnected.",
    });
  };

  useEffect(() => {
    // Try auto-connecting if MetaMask is already unlocked
    const tryAutoConnect = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        await connectWallet();
      }
    };
    
    tryAutoConnect();
    
    // Subscribe to account and chain changes
    let unsubscribeAccounts: () => void;
    let unsubscribeChain: () => void;
    
    if (isConnected && connection) {
      // Update balance periodically
      const balanceTimer = setInterval(() => {
        updateBalance(connection.address);
      }, 30000); // Every 30 seconds
      
      // Subscribe to account changes
      unsubscribeAccounts = subscribeToAccountsChanged(async (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (connection && accounts[0] !== connection.address) {
          // Account changed
          await connectWallet();
        }
      });
      
      // Subscribe to chain changes
      unsubscribeChain = subscribeToChainChanged(async (newChainId) => {
        setChainId(newChainId);
        
        if (connection) {
          await updateBalance(connection.address);
        }
        
        toast({
          title: "Network Changed",
          description: `Switched to chain ID: ${newChainId}`,
        });
      });
      
      return () => {
        clearInterval(balanceTimer);
        if (unsubscribeAccounts) unsubscribeAccounts();
        if (unsubscribeChain) unsubscribeChain();
      };
    }
  }, [isConnected, connection]);

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        connection,
        chainId,
        address: connection?.address || null,
        balance,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
