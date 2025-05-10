import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface ConnectWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => Promise<boolean>;
}

export function ConnectWalletModal({ isOpen, onClose, onConnect }: ConnectWalletModalProps) {
  const handleConnectMetaMask = async () => {
    const success = await onConnect();
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card rounded-xl max-w-md w-full overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold">Connect Your Wallet</DialogTitle>
            <button className="text-muted-foreground hover:text-foreground" onClick={onClose}>
              <X className="h-5 w-5" />
            </button>
          </div>
        </DialogHeader>
        
        <DialogDescription className="text-muted-foreground text-sm mb-4">
          Connect your wallet to enable delegation features and group wallet functionality.
        </DialogDescription>
        
        <div className="space-y-3 mb-5">
          <button 
            onClick={handleConnectMetaMask}
            className="w-full flex items-center justify-between bg-gradient-to-r from-orange-500/10 to-yellow-500/10 hover:from-orange-500/20 hover:to-yellow-500/20 p-3 rounded-lg border border-orange-500/20 transition"
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-md mr-3 flex items-center justify-center text-white text-xs">MM</div>
              <span className="font-medium">MetaMask</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button className="w-full flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 p-3 rounded-lg border border-blue-500/20 transition">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-md mr-3 flex items-center justify-center text-white text-xs">WC</div>
              <span className="font-medium">WalletConnect</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button className="w-full flex items-center justify-between bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 p-3 rounded-lg border border-blue-500/20 transition">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-md mr-3 flex items-center justify-center text-white text-xs">CB</div>
              <span className="font-medium">Coinbase Wallet</span>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <DialogFooter className="text-center">
          <p className="text-xs text-muted-foreground">
            By connecting your wallet, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-primary hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
