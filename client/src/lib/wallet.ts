import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface EthereumProvider {
  request(args: { method: string; params?: any[] }): Promise<any>;
  on(event: string, callback: (...args: any[]) => void): void;
  removeListener(event: string, callback: (...args: any[]) => void): void;
  chainId: string;
  selectedAddress: string | null;
}

export type WalletConnection = {
  address: string;
  provider: ethers.BrowserProvider;
  signer: ethers.JsonRpcSigner;
};

export async function connectMetaMask(): Promise<WalletConnection | null> {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    
    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts found");
    }

    const signer = await provider.getSigner();
    const address = accounts[0];

    return {
      address,
      provider,
      signer
    };
  } catch (error) {
    console.error("Error connecting to MetaMask:", error);
    return null;
  }
}

export async function getChainId(): Promise<string | null> {
  try {
    if (!window.ethereum) {
      return null;
    }
    return await window.ethereum.request({ method: 'eth_chainId' });
  } catch (error) {
    console.error("Error getting chain ID:", error);
    return null;
  }
}

export async function switchChain(chainId: string): Promise<boolean> {
  try {
    if (!window.ethereum) {
      return false;
    }
    
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
    
    return true;
  } catch (error: any) {
    // Error code 4902 means the chain has not been added to MetaMask
    if (error.code === 4902) {
      // You can add the chain here
      return false;
    }
    console.error("Error switching chain:", error);
    return false;
  }
}

export async function getBalance(address: string): Promise<string> {
  try {
    if (!window.ethereum) {
      return "0";
    }
    
    const provider = new ethers.BrowserProvider(window.ethereum);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error("Error getting balance:", error);
    return "0";
  }
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function subscribeToAccountsChanged(callback: (accounts: string[]) => void): () => void {
  const handler = (accounts: string[]) => {
    callback(accounts);
  };
  
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', handler);
    return () => {
      window.ethereum.removeListener('accountsChanged', handler);
    };
  }
  
  return () => {};
}

export function subscribeToChainChanged(callback: (chainId: string) => void): () => void {
  const handler = (chainId: string) => {
    callback(chainId);
  };
  
  if (window.ethereum) {
    window.ethereum.on('chainChanged', handler);
    return () => {
      window.ethereum.removeListener('chainChanged', handler);
    };
  }
  
  return () => {};
}
