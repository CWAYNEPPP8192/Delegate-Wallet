import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/providers/WalletProvider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, RefreshCw, Clock, FileText, CheckCircle, XCircle, PauseCircle } from "lucide-react";

// Component to create a new subscription
function CreateSubscriptionDialog() {
  const [open, setOpen] = useState(false);
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Subscription
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Subscription</DialogTitle>
          <DialogDescription>
            Set up a new delegated subscription payment that will recur based on your settings.
          </DialogDescription>
        </DialogHeader>
        {/* Form will be added here */}
        <div className="py-6">
          <p className="text-center text-sm text-muted-foreground">
            This feature is coming soon
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setOpen(false)}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Component to display a single subscription card
function SubscriptionCard({ subscription }: { subscription: any }) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">
          <CheckCircle className="mr-1 h-3 w-3" /> Active
        </Badge>;
      case 'paused':
        return <Badge variant="outline" className="text-amber-500 border-amber-500">
          <PauseCircle className="mr-1 h-3 w-3" /> Paused
        </Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-red-500 border-red-500">
          <XCircle className="mr-1 h-3 w-3" /> Cancelled
        </Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">
          <CheckCircle className="mr-1 h-3 w-3" /> Completed
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const getNextPaymentText = () => {
    if (!subscription.nextPaymentDue) return 'Not scheduled';
    const date = new Date(subscription.nextPaymentDue);
    
    // If date is today
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    // If date is tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    
    return formatDate(subscription.nextPaymentDue);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{subscription.name}</CardTitle>
            <CardDescription className="mt-1">
              {subscription.providerName || subscription.providerAddress}
            </CardDescription>
          </div>
          {getStatusBadge(subscription.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Amount</div>
            <div className="font-medium">
              {subscription.amount} {subscription.tokenType}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Frequency</div>
            <div className="font-medium flex items-center">
              <RefreshCw className="mr-1 h-3 w-3" />
              {subscription.frequency}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Next Payment</div>
            <div className="font-medium flex items-center">
              <Calendar className="mr-1 h-3 w-3" />
              {getNextPaymentText()}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Payments</div>
            <div className="font-medium">
              {subscription.completedPayments || 0} / {subscription.totalPayments || '∞'}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-3">
        <div className="text-xs text-muted-foreground flex items-center">
          <Clock className="mr-1 h-3 w-3" />
          Started {formatDate(subscription.startDate)}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8">Manage</Button>
        </div>
      </CardFooter>
    </Card>
  );
}

// Main Subscriptions page component
export default function Subscriptions() {
  const { address, isConnected } = useWallet();
  
  // Fetch subscriptions
  const { data: subscriptions, isLoading } = useQuery({
    queryKey: ['/api/subscriptions', { userAddress: address }],
    queryFn: () => fetch(`/api/subscriptions?userAddress=${address}`).then(res => res.json()),
    enabled: !!address && isConnected,
  });
  
  // Mock data for demonstration (until backend is fully connected)
  const mockSubscriptions = [
    {
      id: 1,
      name: "Monthly Hosting Service",
      description: "Cloud server hosting package",
      subscriberAddress: address || "0x123",
      providerAddress: "0x456",
      providerName: "VPS Provider",
      amount: "0.1",
      tokenType: "ETH",
      frequency: "Monthly",
      startDate: "2023-04-01T00:00:00Z",
      nextPaymentDue: "2023-05-01T00:00:00Z",
      totalPayments: 12,
      completedPayments: 2,
      status: "active",
    },
    {
      id: 2,
      name: "Weekly Analytics",
      description: "Data analytics subscription service",
      subscriberAddress: address || "0x123",
      providerAddress: "0x789",
      providerName: "DataMetrics Inc.",
      amount: "0.05",
      tokenType: "ETH",
      frequency: "Weekly",
      startDate: "2023-03-15T00:00:00Z",
      nextPaymentDue: "2023-04-15T00:00:00Z",
      totalPayments: 52,
      completedPayments: 4,
      status: "paused",
    },
    {
      id: 3,
      name: "Content Creator Support",
      description: "Monthly support for your favorite creator",
      subscriberAddress: address || "0x123",
      providerAddress: "0xabc",
      providerName: "Creator Name",
      amount: "0.025",
      tokenType: "ETH",
      frequency: "Monthly",
      startDate: "2023-01-10T00:00:00Z",
      nextPaymentDue: null,
      totalPayments: 6,
      completedPayments: 6,
      status: "completed",
    }
  ];
  
  // Use real data when available, fallback to mock data for development
  const displaySubscriptions = subscriptions || mockSubscriptions;
  
  const activeSubscriptions = displaySubscriptions.filter((s: any) => s.status === 'active');
  const pausedSubscriptions = displaySubscriptions.filter((s: any) => s.status === 'paused');
  const completedSubscriptions = displaySubscriptions.filter((s: any) => 
    s.status === 'completed' || s.status === 'cancelled'
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Subscription Manager</h1>
          <p className="text-muted-foreground mt-1">
            Manage your recurring payments with delegated subscription permissions
          </p>
        </div>
        <CreateSubscriptionDialog />
      </div>
      
      <Separator />
      
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active">
            Active
            {activeSubscriptions.length > 0 && (
              <Badge className="ml-2 bg-primary">{activeSubscriptions.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="paused">
            Paused
            {pausedSubscriptions.length > 0 && (
              <Badge className="ml-2" variant="outline">{pausedSubscriptions.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">
            History
            {completedSubscriptions.length > 0 && (
              <Badge className="ml-2" variant="outline">{completedSubscriptions.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Loading subscriptions...</p>
            </div>
          ) : activeSubscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeSubscriptions.map((subscription: any) => (
                <SubscriptionCard key={subscription.id} subscription={subscription} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">No active subscriptions</h3>
                <p className="text-muted-foreground text-center mt-2 mb-4">
                  You don't have any active subscriptions yet.
                </p>
                <CreateSubscriptionDialog />
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="paused">
          {pausedSubscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pausedSubscriptions.map((subscription: any) => (
                <SubscriptionCard key={subscription.id} subscription={subscription} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center py-8">
                <PauseCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">No paused subscriptions</h3>
                <p className="text-muted-foreground text-center mt-2">
                  You don't have any paused subscriptions at this time.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {completedSubscriptions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedSubscriptions.map((subscription: any) => (
                <SubscriptionCard key={subscription.id} subscription={subscription} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium">No completed subscriptions</h3>
                <p className="text-muted-foreground text-center mt-2">
                  Your subscription history will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="analytics">
          <Card>
            <CardContent className="flex flex-col items-center py-8">
              <h3 className="text-xl font-medium">Subscription Analytics</h3>
              <p className="text-muted-foreground text-center mt-2">
                Subscription analytics will be available here soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}