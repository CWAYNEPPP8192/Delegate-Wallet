import { useWallet } from "@/providers/WalletProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { shortenAddress } from "@/lib/wallet";

export function WalletStatus() {
  const { isConnected, address, balance, connectWallet, disconnectWallet } = useWallet();

  if (!isConnected) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Wallet not connected</h3>
            <Button onClick={connectWallet}>Connect Wallet</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">Connected Wallet</h3>
            <p className="text-muted-foreground">{shortenAddress(address!)}</p>
            <p className="font-medium text-lg mt-2">{Number(balance).toFixed(4)} ETH</p>
          </div>
          <Button variant="outline" onClick={disconnectWallet}>Disconnect</Button>
        </div>
      </CardContent>
    </Card>
  );
}
