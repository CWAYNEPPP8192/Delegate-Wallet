import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal } from "lucide-react";
import { useWallet } from "@/providers/WalletProvider";
import { Progress } from "@/components/ui/progress";

export function AutomatedPaymentsCard() {
  const { address } = useWallet();
  
  const { data: teams } = useQuery({
    queryKey: ['/api/teams', { userAddress: address }],
    enabled: !!address,
  });
  
  const teamId = teams?.[0]?.id;
  
  const { data: paymentStreams, isLoading } = useQuery({
    queryKey: [`/api/payment-streams`, { teamId }],
    enabled: !!teamId,
  });

  const activePaymentStreams = paymentStreams?.filter(stream => stream.active) || [];
  const totalStreamingPerMonth = activePaymentStreams.reduce((sum, stream) => {
    // Assuming flowRate is in ETH per day
    const monthlyRate = parseFloat(stream.flowRate) * 30;
    return sum + monthlyRate;
  }, 0);

  return (
    <Card className="bg-card rounded-xl p-5 border border-border">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-muted-foreground text-sm font-medium">Automated Payments</h3>
          <button className="text-muted-foreground hover:text-foreground">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
        <div className="mb-4">
          {isLoading ? (
            <div className="h-8 w-12 bg-muted animate-pulse rounded"></div>
          ) : (
            <>
              <p className="text-3xl font-bold">{activePaymentStreams.length}</p>
              <p className="text-muted-foreground text-sm">Active payment streams</p>
            </>
          )}
        </div>
        <div className="w-full bg-muted rounded-full h-2 mb-2">
          <Progress value={65} className="h-2" />
        </div>
        <div className="text-xs text-muted-foreground">
          {totalStreamingPerMonth.toFixed(2)} ETH streaming / month
        </div>
      </CardContent>
    </Card>
  );
}
