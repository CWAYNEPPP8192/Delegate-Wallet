import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { TransactionHistory } from "@/components/transactions/TransactionHistory";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@/providers/WalletProvider";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Download, Filter, Search } from "lucide-react";

// Mock data for transaction activity chart
const transactionData = [
  { name: 'Jan', sent: 1.2, received: 0.5 },
  { name: 'Feb', sent: 2.8, received: 1.9 },
  { name: 'Mar', sent: 1.8, received: 2.3 },
  { name: 'Apr', sent: 3.5, received: 0.8 },
  { name: 'May', sent: 2.1, received: 2.2 },
  { name: 'Jun', sent: 1.5, received: 3.1 },
  { name: 'Jul', sent: 2.9, received: 1.2 },
];

export default function Transactions() {
  const { address } = useWallet();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  
  const { data: teams } = useQuery({
    queryKey: ['/api/teams', { userAddress: address }],
    enabled: !!address,
  });
  
  const teamId = teams?.[0]?.id;
  
  const { data: transactions, isLoading } = useQuery({
    queryKey: [`/api/transactions`, { teamId }],
    enabled: !!teamId,
  });

  // Calculate some stats
  const totalSent = transactions?.reduce((sum, tx) => 
    tx.fromAddress === address ? sum + parseFloat(tx.amount) : sum, 0) || 0;
    
  const totalReceived = transactions?.reduce((sum, tx) => 
    tx.toAddress === address ? sum + parseFloat(tx.amount) : sum, 0) || 0;

  const netFlow = totalReceived - totalSent;

  // Filter transactions based on search and filter
  const filteredTransactions = transactions?.filter(tx => {
    const matchesSearch = searchQuery === "" || 
      tx.transactionHash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.fromAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.toAddress.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesFilter = filter === "all" || 
      (filter === "sent" && tx.fromAddress === address) ||
      (filter === "received" && tx.toAddress === address);
      
    return matchesSearch && matchesFilter;
  }) || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Transactions</h1>
          <p className="text-muted-foreground">Track all wallet activity in one place</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-sm mb-1">Total Sent</p>
            <h3 className="text-2xl font-bold">{totalSent.toFixed(2)} ETH</h3>
            <p className="text-sm text-muted-foreground">
              Across {transactions?.filter(tx => tx.fromAddress === address).length || 0} transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-sm mb-1">Total Received</p>
            <h3 className="text-2xl font-bold">{totalReceived.toFixed(2)} ETH</h3>
            <p className="text-sm text-muted-foreground">
              Across {transactions?.filter(tx => tx.toAddress === address).length || 0} transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground text-sm mb-1">Net Flow</p>
            <h3 className={`text-2xl font-bold ${netFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {netFlow >= 0 ? '+' : ''}{netFlow.toFixed(2)} ETH
            </h3>
            <p className="text-sm text-muted-foreground">
              Based on all transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Chart */}
      <Card className="mb-8">
        <CardHeader className="border-b border-border">
          <h3 className="font-semibold">Transaction Activity</h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={transactionData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="received" 
                  stackId="1" 
                  stroke="#10B981" 
                  fill="#10B981" 
                  fillOpacity={0.3} 
                />
                <Area 
                  type="monotone" 
                  dataKey="sent" 
                  stackId="1" 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-center mt-2 space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#10B981] mr-2"></div>
              <span className="text-sm">Received</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-[#3B82F6] mr-2"></div>
              <span className="text-sm">Sent</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction List */}
      <Card>
        <CardHeader className="border-b border-border">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h3 className="font-semibold">Transaction History</h3>
            
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search by address or tx hash..." 
                  className="pl-9 w-full md:w-80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select defaultValue="all" onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Transactions</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <TransactionHistory 
            transactions={filteredTransactions}
            isLoading={isLoading}
            userAddress={address || ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
