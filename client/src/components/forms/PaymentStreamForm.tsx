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
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useWallet } from "@/providers/WalletProvider";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Upload } from "lucide-react";

const formSchema = z.object({
  recipientAddress: z.string().min(42, "Please enter a valid Ethereum address"),
  tokenType: z.string(),
  totalAmount: z.string().min(1, "Please enter an amount"),
  startDate: z.string(),
  endDate: z.string(),
  flowRate: z.string().min(1, "Please set a flow rate"),
  note: z.string().optional(),
});

export function PaymentStreamForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { address } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flowRatePerDay, setFlowRatePerDay] = useState(0.04);
  
  // Calculate USD value based on ETH price (mock - would come from API)
  const ethPrice = 2275.32;
  const usdPerDay = flowRatePerDay * ethPrice;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipientAddress: "",
      tokenType: "ETH",
      totalAmount: "1.2",
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      flowRate: "0.04",
      note: "",
    },
  });

  const createPaymentStreamMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      return apiRequest("POST", "/api/payment-streams", {
        teamId: 1, // TODO: Replace with actual team selection
        senderAddress: address,
        recipientAddress: values.recipientAddress,
        tokenType: values.tokenType,
        totalAmount: values.totalAmount,
        flowRate: values.flowRate,
        startDate: new Date(values.startDate),
        endDate: new Date(values.endDate),
        note: values.note,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Payment stream created successfully",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/payment-streams'] });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create payment stream",
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      await createPaymentStreamMutation.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSliderChange = (value: number[]) => {
    const newRate = (value[0] / 100) * 0.1; // Scale between 0 and 0.1 ETH per day
    setFlowRatePerDay(newRate);
    form.setValue("flowRate", newRate.toString());
  };

  return (
    <Card className="bg-card rounded-xl border border-border">
      <CardHeader className="py-5 px-5 border-b border-border">
        <h3 className="font-semibold">Set Up Payment Stream</h3>
      </CardHeader>
      <CardContent className="p-5">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="recipientAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipient</FormLabel>
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
                name="tokenType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Token</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select token" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="DAI">DAI</SelectItem>
                        <SelectItem value="WETH">WETH</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="totalAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Amount</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.1"
                        min="0"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-4">
                  <FormItem>
                    <FormLabel>Stream Duration</FormLabel>
                    <FormLabel className="text-xs text-muted-foreground">Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                  
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field: endDateField }) => (
                      <FormItem>
                        <FormLabel className="invisible">End</FormLabel>
                        <FormLabel className="text-xs text-muted-foreground">End Date</FormLabel>
                        <FormControl>
                          <Input 
                            type="date" 
                            {...endDateField} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            />
            
            <FormField
              control={form.control}
              name="flowRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flow Rate</FormLabel>
                  <FormControl>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">{flowRatePerDay.toFixed(4)} ETH per day</span>
                        <span className="text-sm text-primary">≈ ${usdPerDay.toFixed(2)} / day</span>
                      </div>
                      <Slider
                        defaultValue={[40]}
                        max={100}
                        step={1}
                        onValueChange={handleSliderChange}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Slower</span>
                        <span>Faster</span>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Add Note (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Purpose of this payment stream..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                {isSubmitting ? "Creating..." : "Start Payment Stream"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
