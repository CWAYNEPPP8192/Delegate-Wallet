import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { shortenAddress } from "@/lib/wallet";
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  ChevronsLeft, 
  ChevronsRight, 
  ExternalLink, 
  User 
} from "lucide-react";

interface TransactionHistoryProps {
  transactions: any[];
  isLoading: boolean;
  userAddress: string;
}

export function TransactionHistory({ transactions, isLoading, userAddress }: TransactionHistoryProps) {
  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
        <p>Loading transaction history...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No Transactions Found</h3>
        <p className="text-muted-foreground mb-6">
          There are no transactions matching your search criteria.
        </p>
      </div>
    );
  }

  // Helper function to determine the status badge style
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-800/30">Completed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-900/30 text-yellow-400 border-yellow-800/30">Pending</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-900/30 text-red-400 border-red-800/30">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>From/To</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => {
            const isSent = tx.fromAddress === userAddress;
            const date = new Date(tx.timestamp);
            return (
              <TableRow key={tx.id}>
                <TableCell>
                  <div className="flex items-center">
                    {isSent ? (
                      <div className="w-8 h-8 rounded-full bg-red-900/30 flex items-center justify-center mr-2">
                        <ArrowUpRight className="h-4 w-4 text-red-400" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-900/30 flex items-center justify-center mr-2">
                        <ArrowDownLeft className="h-4 w-4 text-green-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">
                        {isSent ? 'Sent' : 'Received'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.transactionType}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className={isSent ? 'text-red-400' : 'text-green-400'}>
                    <p className="font-medium">
                      {isSent ? '-' : '+'}{tx.amount} {tx.tokenType}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2 bg-blue-800">
                      <AvatarFallback>
                        <User className="h-3 w-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-mono text-sm">
                        {isSent 
                          ? shortenAddress(tx.toAddress) 
                          : shortenAddress(tx.fromAddress)
                        }
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div>
                          <p>{date.toLocaleDateString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {date.toLocaleTimeString()}
                          </p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Transaction time: {date.toLocaleString()}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>
                  {getStatusBadge(tx.status)}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" asChild>
                    <a 
                      href={`https://etherscan.io/tx/${tx.transactionHash}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {transactions.length > 10 && (
        <div className="flex items-center justify-between py-4 px-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium">1</span> to <span className="font-medium">10</span> of{" "}
            <span className="font-medium">{transactions.length}</span> results
          </p>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <ChevronsLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
              <ChevronsRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
