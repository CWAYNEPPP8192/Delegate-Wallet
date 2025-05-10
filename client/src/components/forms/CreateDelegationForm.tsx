import { useState } from "react";
import { 
  Form, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useWallet } from "@/providers/WalletProvider";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  createDelegation,
  PERMISSION_TYPES,
  getDurationDate,
  buildSpendingLimitCaveat
} from "@/lib/delegations";
import { Upload } from "lucide-react";

const formSchema = z.object({
  delegateeAddress: z.string().min(42, "Please enter a valid Ethereum address"),
  permissionLevel: z.string(),
  duration: z.string(),
  spendingLimit: z.string(),
  tokenType: z.string(),
  allowTokenTransfers: z.boolean().default(true),
  allowContractInteractions: z.boolean().default(true),
  allowSubDelegation: z.boolean().default(false),
});

export function CreateDelegationForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { address, connection } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      delegateeAddress: "",
      permissionLevel: "team_member",
      duration: "permanent",
      spendingLimit: "2.0",
      tokenType: "ETH",
      allowTokenTransfers: true,
      allowContractInteractions: true,
      allowSubDelegation: false,
    },
  });

  const createDelegationMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      // First create an on-chain delegation with MetaMask
      if (!connection?.signer) {
        throw new Error("Wallet not connected");
      }
      
      const permissions = [];
      if (values.allowTokenTransfers) {
        permissions.push({ type: PERMISSION_TYPES.SEND_TOKEN, value: "true" });
      }
      if (values.allowContractInteractions) {
        permissions.push({ type: PERMISSION_TYPES.CONTRACT_INTERACTION, value: "true" });
      }
      if (values.allowSubDelegation) {
        permissions.push({ type: PERMISSION_TYPES.SUB_DELEGATION, value: "true" });
      }
      
      const validUntil = getDurationDate(values.duration);
      const caveats = [buildSpendingLimitCaveat(values.spendingLimit, values.tokenType)];
      
      // This would create the delegation on-chain in a real implementation
      const delegationInfo = await createDelegation(
        connection.signer,
        values.delegateeAddress,
        permissions,
        caveats,
        validUntil
      );
      
      if (!delegationInfo) {
        throw new Error("Failed to create delegation");
      }
      
      // Now store the delegation in our database
      return apiRequest("POST", "/api/delegations", {
        teamId: 1, // TOTO: Replace with actual team selection
        delegatorAddress: address,
        delegateeAddress: values.delegateeAddress,
        permissionLevel: values.permissionLevel,
        spendingLimit: values.spendingLimit,
        tokenType: values.tokenType,
        duration: values.duration,
        allowedActions: {
          tokenTransfers: values.allowTokenTransfers,
          contractInteractions: values.allowContractInteractions,
          subDelegation: values.allowSubDelegation,
        },
        expiresAt: new Date(validUntil * 1000), // Convert seconds to milliseconds
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Delegation created successfully",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/delegations'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create delegation",
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await createDelegationMutation.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="bg-card rounded-xl border border-border">
      <CardHeader className="py-5 px-5 border-b border-border">
        <h3 className="font-semibold">Create New Delegation</h3>
      </CardHeader>
      <CardContent className="p-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="delegateeAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient Address</FormLabel>
                  <div className="flex">
                    <FormControl>
                      <Input 
                        placeholder="0x..." 
                        className="rounded-r-none" 
                        {...field} 
                      />
                    </FormControl>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      className="rounded-l-none"
                    >
                      <Upload className="h-5 w-5" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="permissionLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Permission Level</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select permission" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="team_member">Team Member</SelectItem>
                        <SelectItem value="department_lead">Department Lead</SelectItem>
                        <SelectItem value="admin">Admin Access</SelectItem>
                        <SelectItem value="custom">Custom...</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="permanent">Permanent</SelectItem>
                        <SelectItem value="24h">24 Hours</SelectItem>
                        <SelectItem value="1w">1 Week</SelectItem>
                        <SelectItem value="1m">1 Month</SelectItem>
                        <SelectItem value="custom">Custom...</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="spendingLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Spending Limit</FormLabel>
                  <div className="flex items-center">
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        {...field}
                      />
                    </FormControl>
                    
                    <Select 
                      defaultValue={form.getValues().tokenType}
                      onValueChange={(value) => form.setValue("tokenType", value)}
                    >
                      <SelectTrigger className="w-[100px] ml-2">
                        <SelectValue placeholder="Token" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="DAI">DAI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4 mt-4">
              <FormLabel>Allowed Actions</FormLabel>
              
              <FormField
                control={form.control}
                name="allowTokenTransfers"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Token Transfers</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="allowContractInteractions"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Contract Interactions</FormLabel>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="allowSubDelegation"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <Checkbox 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                      />
                    </FormControl>
                    <FormLabel className="!mt-0">Allow Sub-delegation</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button 
                type="button" 
                variant="outline"
                onClick={() => form.reset()}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Delegation"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
