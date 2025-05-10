import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/providers/WalletProvider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Layers, 
  Shield, 
  TrendingDown,
  Plus
} from "lucide-react";

export function RecentActivityCard() {
  const { address } = useWallet();
  
  const { data: teams } = useQuery({
    queryKey: ['/api/teams', { userAddress: address }],
    enabled: !!address,
  });
  
  const teamId = teams?.[0]?.id;
  
  const { data: transactions, isLoading } = useQuery({
    queryKey: [`/api/transactions`, { teamId }],
    enabled: !!teamId,
  });

  // Mock transactions since we don't have real data yet
  const activities = [
    {
      id: 1,
      type: "payment_received",
      title: "Payment Received",
      description: "From Ethereum Foundation",
      user: { initials: "SK", name: "Sarah Kim" },
      amount: "+5.00 ETH",
      amountClass: "text-green-400",
      time: "10 minutes ago",
      icon: <Plus className="h-5 w-5 text-green-400" />,
      iconBg: "bg-green-900/30",
    },
    {
      id: 2,
      type: "permission_delegated",
      title: "Permission Delegated",
      description: "Marketing budget to Tom Miller",
      badge: "1.5 ETH Monthly Limit",
      badgeClass: "bg-blue-900/30 text-blue-400",
      time: "2 hours ago",
      icon: <Layers className="h-5 w-5 text-blue-400" />,
      iconBg: "bg-blue-900/30",
    },
    {
      id: 3,
      type: "contract_interaction",
      title: "Contract Interaction",
      description: "DEX Swap: ETH → USDC",
      user: { initials: "JL", name: "James Lee" },
      amount: "-0.75 ETH",
      amountClass: "text-red-400",
      time: "Yesterday, 4:30 PM",
      icon: <TrendingDown className="h-5 w-5 text-red-400" />,
      iconBg: "bg-red-900/30",
    },
    {
      id: 4,
      type: "session_access",
      title: "Session Access Created",
      description: "For external designer - Nikki Chen",
      badge: "24 Hour Access",
      badgeClass: "bg-yellow-900/30 text-yellow-400",
      time: "2 days ago",
      icon: <Shield className="h-5 w-5 text-yellow-400" />,
      iconBg: "bg-yellow-900/30",
    },
  ];

  return (
    <Card className="bg-card rounded-xl border border-border">
      <CardHeader className="flex items-center justify-between py-5 px-5 border-b border-border">
        <h3 className="font-semibold">Recent Activities</h3>
        <button className="text-xs text-muted-foreground hover:text-foreground">View All</button>
      </CardHeader>
      <CardContent className="p-5">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted mr-3"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-start">
                  <div className={`w-10 h-10 rounded-full ${activity.iconBg} flex items-center justify-center mr-3`}>
                    {activity.icon}
                  </div>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    
                    {activity.user && (
                      <div className="flex items-center mt-1">
                        <Avatar className={`w-6 h-6 bg-purple-700 mr-1`}>
                          <AvatarFallback>{activity.user.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{activity.user.name} initiated</span>
                      </div>
                    )}
                    
                    {activity.badge && (
                      <Badge variant="outline" className={`mt-1 ${activity.badgeClass}`}>
                        {activity.badge}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  {activity.amount && (
                    <p className={`font-medium ${activity.amountClass}`}>{activity.amount}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
