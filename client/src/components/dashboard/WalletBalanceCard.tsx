import { Card, CardContent } from "@/components/ui/card";
import { useWallet } from "@/providers/WalletProvider";
import { TrendingUp } from "lucide-react";

export function WalletBalanceCard() {
  const { balance } = useWallet();
  const ethPrice = 2275.32; // In a production app, would fetch from an API
  const usdValue = Number(balance) * ethPrice;

  return (
    <Card className="bg-card rounded-xl p-5 border border-border">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-muted-foreground text-sm font-medium">Total Balance</h3>
          <div className="bg-primary/20 text-primary text-xs font-medium px-2 py-1 rounded-full">
            Group Wallet
          </div>
        </div>
        <div className="mb-4">
          <p className="text-3xl font-bold">{Number(balance).toFixed(2)} ETH</p>
          <p className="text-muted-foreground text-sm">≈ ${usdValue.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD</p>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-green-400 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1" />
            +2.4%
          </span>
          <span className="text-muted-foreground">Last 24h</span>
        </div>
      </CardContent>
    </Card>
  );
}
