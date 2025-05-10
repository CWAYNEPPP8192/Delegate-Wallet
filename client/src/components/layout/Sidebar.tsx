import { Link, useLocation } from "wouter";
import { 
  Shield, 
  Grid, 
  Users, 
  ClipboardList, 
  Banknote, 
  Settings,
  ChevronRight
} from "lucide-react";
import { useWallet } from "@/providers/WalletProvider";
import { shortenAddress } from "@/lib/wallet";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const { address, isConnected, balance } = useWallet();

  const navItems = [
    {
      label: "Overview",
      href: "/",
      icon: <Grid className="h-5 w-5 mr-3" />,
    },
    {
      label: "Team Members",
      href: "/team-members",
      icon: <Users className="h-5 w-5 mr-3" />,
    },
    {
      label: "Delegations",
      href: "/delegations",
      icon: <ClipboardList className="h-5 w-5 mr-3" />,
    },
    {
      label: "Transactions",
      href: "/transactions",
      icon: <Banknote className="h-5 w-5 mr-3" />,
    }
  ];

  const managementItems = [
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5 mr-3" />,
    },
  ];

  return (
    <aside className="bg-card w-full md:w-64 md:h-screen flex-shrink-0 border-r border-border">
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-8">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
            <Shield className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold">DelegateWallet</h1>
        </div>

        <div className="mb-6">
          {/* Connected Wallet Status */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Connected Wallet</span>
            {isConnected ? (
              <span className="flex items-center text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                Active
              </span>
            ) : (
              <span className="flex items-center text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
                Disconnected
              </span>
            )}
          </div>
          
          <div className="bg-background rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full mr-2 flex items-center justify-center text-white text-xs">MM</div>
                <div>
                  <p className="text-sm font-medium">{isConnected ? shortenAddress(address!) : "Not Connected"}</p>
                  <p className="text-xs text-muted-foreground">
                    {isConnected && `${Number(balance).toFixed(4)} ETH`}
                  </p>
                </div>
              </div>
              <button className="text-xs bg-background-dark hover:bg-muted px-2 py-1 rounded transition">
                Switch
              </button>
            </div>
          </div>
        </div>

        <nav>
          <p className="text-xs uppercase text-muted-foreground font-semibold mb-2 ml-2">Dashboard</p>
          <ul className="space-y-1 mb-6">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <a 
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg",
                      location === item.href 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground transition"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                </Link>
              </li>
            ))}
          </ul>

          <p className="text-xs uppercase text-muted-foreground font-semibold mt-6 mb-2 ml-2">Management</p>
          <ul className="space-y-1">
            {managementItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <a 
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg",
                      location === item.href 
                        ? "bg-primary/10 text-primary font-medium" 
                        : "text-muted-foreground hover:bg-muted hover:text-foreground transition"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
