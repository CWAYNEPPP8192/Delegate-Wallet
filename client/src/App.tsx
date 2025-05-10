import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useWallet } from "./providers/WalletProvider";
import Dashboard from "@/pages/Dashboard";
import TeamMembers from "@/pages/TeamMembers";
import Delegations from "@/pages/Delegations";
import Transactions from "@/pages/Transactions";
import Subscriptions from "@/pages/Subscriptions";
import Settings from "@/pages/Settings";
import { AppShell } from "./components/layout/AppShell";
import { ConnectWalletModal } from "./components/wallet/ConnectWalletModal";
import { useEffect, useState } from "react";

function App() {
  const { isConnected, connectWallet } = useWallet();
  const [showConnectModal, setShowConnectModal] = useState(false);

  useEffect(() => {
    // Check if wallet is not connected and show modal after a short delay
    if (!isConnected) {
      const timer = setTimeout(() => {
        setShowConnectModal(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowConnectModal(false);
    }
  }, [isConnected]);

  return (
    <TooltipProvider>
      <Toaster />
      <AppShell>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/team-members" component={TeamMembers} />
          <Route path="/delegations" component={Delegations} />
          <Route path="/transactions" component={Transactions} />
          <Route path="/subscriptions" component={Subscriptions} />
          <Route path="/settings" component={Settings} />
          <Route component={NotFound} />
        </Switch>
      </AppShell>
      
      {showConnectModal && (
        <ConnectWalletModal 
          isOpen={showConnectModal} 
          onClose={() => setShowConnectModal(false)}
          onConnect={connectWallet}
        />
      )}
    </TooltipProvider>
  );
}

export default App;
