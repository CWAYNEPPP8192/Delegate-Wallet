import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { BrainCircuit, CheckCircle, Info, AlertTriangle, XCircle } from "lucide-react";

interface AIReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  delegationData: any;
  onConfirm: () => void;
}

export function AIReviewDialog({
  isOpen,
  onClose,
  delegationData,
  onConfirm,
}: AIReviewDialogProps) {
  const [review, setReview] = useState<string | null>(null);
  const [securityScore, setSecurityScore] = useState<number | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);

  // AI review mutation
  const reviewMutation = useMutation<{ review: string }, Error, any>({
    mutationFn: async (data) => {
      const response = await apiRequest("POST", "/api/ai/review-delegation", data);
      return await response.json() as { review: string };
    },
    onSuccess: (data) => {
      setIsReviewing(false);
      setReview(data.review);

      // Extract security score if it's in the response
      const scoreRegex = /security\s+score[:\s]+(\d+)\/100/i;
      const match = data.review.match(scoreRegex);
      if (match && match[1]) {
        setSecurityScore(parseInt(match[1], 10));
      } else {
        // If no explicit score, estimate based on sentiment
        const hasWarnings = data.review.toLowerCase().includes("warning") || 
                           data.review.toLowerCase().includes("concern");
        const hasRisks = data.review.toLowerCase().includes("risk") ||
                        data.review.toLowerCase().includes("vulnerable");
                        
        if (hasRisks) {
          setSecurityScore(60);
        } else if (hasWarnings) {
          setSecurityScore(75);
        } else {
          setSecurityScore(90);
        }
      }
    },
    onError: () => {
      setIsReviewing(false);
      setReview("Unable to perform AI security review at this time. Please review the delegation settings yourself.");
      setSecurityScore(null);
    },
  });

  // Start review when dialog opens
  const startReview = () => {
    if (!isReviewing && !review && delegationData) {
      setIsReviewing(true);
      reviewMutation.mutate(delegationData);
    }
  };

  // Get security badge based on score
  const getSecurityBadge = () => {
    if (securityScore === null) return null;
    
    if (securityScore >= 80) {
      return (
        <Badge className="bg-green-900/30 text-green-400 border-green-800/30">
          <CheckCircle className="h-3 w-3 mr-1" />
          Secure
        </Badge>
      );
    } else if (securityScore >= 60) {
      return (
        <Badge className="bg-yellow-900/30 text-yellow-400 border-yellow-800/30">
          <Info className="h-3 w-3 mr-1" />
          Caution
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-red-900/30 text-red-400 border-red-800/30">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Warning
        </Badge>
      );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" onOpenAutoFocus={() => startReview()}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-500/10 rounded-md mr-3">
                <BrainCircuit className="h-5 w-5 text-indigo-500" />
              </div>
              <DialogTitle>AI Security Review</DialogTitle>
            </div>
            {securityScore !== null && getSecurityBadge()}
          </div>
          <DialogDescription>
            Our AI assistant has analyzed your delegation settings for potential security concerns.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {isReviewing ? (
            <div className="flex justify-center py-10">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full border-4 border-t-indigo-500 border-r-indigo-500/50 border-b-indigo-500/30 border-l-indigo-500/10 animate-spin mb-3"></div>
                <p className="text-sm font-medium">Analyzing security implications...</p>
                <p className="text-xs text-muted-foreground mt-1">This may take a moment</p>
              </div>
            </div>
          ) : (
            <div className="bg-muted/50 rounded-lg p-4 border border-border">
              {review ? (
                <>
                  <div className="flex items-start">
                    <div className="bg-indigo-500/10 p-1.5 rounded-md mr-3">
                      <BrainCircuit className="h-5 w-5 text-indigo-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Security Analysis</p>
                      <div className="mt-2 text-sm space-y-2 whitespace-pre-line">
                        {review.split('\n').map((line, idx) => (
                          <p key={idx}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {securityScore !== null && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="font-medium mb-2">Security Score</p>
                      <div className="w-full bg-muted rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            securityScore >= 80 
                              ? 'bg-green-500' 
                              : securityScore >= 60 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                          }`} 
                          style={{ width: `${securityScore}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-red-400">High Risk</span>
                        <span className="text-yellow-400">Caution</span>
                        <span className="text-green-400">Secure</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <XCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p>No review available.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            This AI assessment is a guide. Please review settings carefully.
          </p>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={onConfirm}
              disabled={isReviewing}
            >
              Confirm Delegation
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}