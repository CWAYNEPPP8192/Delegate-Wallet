import OpenAI from "openai";

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Interface for the spending analysis response
export interface SpendingAnalysis {
  totalSpent: number;
  categories: {
    category: string;
    amount: number;
    percentage: number;
  }[];
  insights: string[];
  recommendations: string[];
}

// Interface for the delegation suggestion response
export interface DelegationSuggestion {
  suggestedDelegatee: string;
  suggestedPermissionLevel: string;
  suggestedSpendingLimit: string;
  rationale: string;
}

export const aiService = {
  /**
   * Analyze spending patterns from transaction history
   */
  async analyzeSpending(
    transactions: any[],
    timeframe: string = "past month"
  ): Promise<SpendingAnalysis> {
    try {
      // Create a prompt for the spending analysis
      const transactionData = JSON.stringify(
        transactions.map((tx) => ({
          amount: tx.amount,
          token: tx.tokenType,
          type: tx.transactionType,
          timestamp: tx.timestamp,
          status: tx.status,
        }))
      );

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an AI financial advisor for a web3 wallet team. Analyze transaction data and provide insights and recommendations.
            Respond with a JSON object containing: 
            1. totalSpent (number)
            2. categories (array of objects with category, amount, and percentage) 
            3. insights (array of strings with observations)
            4. recommendations (array of strings with actionable advice)`,
          },
          {
            role: "user",
            content: `Here are my transactions for the ${timeframe}. Please analyze my spending patterns and provide insights: ${transactionData}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const analysisText = response.choices[0].message.content;
      return JSON.parse(analysisText as string) as SpendingAnalysis;
    } catch (error) {
      console.error("Error analyzing spending:", error);
      // Return a default response in case of error
      return {
        totalSpent: 0,
        categories: [],
        insights: ["Unable to analyze transactions at this time."],
        recommendations: ["Try again later."],
      };
    }
  },

  /**
   * Generate smart delegation suggestions based on team activity
   */
  async suggestDelegations(
    teamMembers: any[],
    existingDelegations: any[],
    transactions: any[]
  ): Promise<DelegationSuggestion[]> {
    try {
      const teamData = JSON.stringify({
        members: teamMembers,
        delegations: existingDelegations,
        recentTransactions: transactions.slice(0, 20), // Use the 20 most recent transactions
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an AI advisor for a web3 wallet team. You'll analyze team activity and suggest optimal delegations.
            Respond with a JSON array of suggestions, each containing:
            1. suggestedDelegatee (address or name)
            2. suggestedPermissionLevel (admin, department_lead, team_member)
            3. suggestedSpendingLimit (string with amount and token)
            4. rationale (string explaining the reasoning)
            
            Limit your suggestions to 3 most important ones.`,
          },
          {
            role: "user",
            content: `Here's data about my team, current delegations, and recent transactions. Please suggest optimal delegations to improve our efficiency: ${teamData}`,
          },
        ],
        response_format: { type: "json_object" },
      });

      const suggestionText = response.choices[0].message.content;
      const suggestions = JSON.parse(suggestionText as string);
      return Array.isArray(suggestions.suggestions) 
        ? suggestions.suggestions 
        : (suggestions.delegations || []);
    } catch (error) {
      console.error("Error generating delegation suggestions:", error);
      return [];
    }
  },

  /**
   * Review a delegation before confirming
   */
  async reviewDelegation(delegationData: any): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an AI security advisor for a web3 wallet. Review delegation permissions for potential issues.`,
          },
          {
            role: "user",
            content: `I'm about to create the following delegation. Please review it for any security concerns or unusual settings: ${JSON.stringify(
              delegationData
            )}`,
          },
        ],
      });

      return response.choices[0].message.content || 
        "No issues found with this delegation.";
    } catch (error) {
      console.error("Error reviewing delegation:", error);
      return "Unable to review delegation at this time.";
    }
  },

  /**
   * Generate content for an automated report
   */
  async generateTeamReport(
    teamId: number,
    transactions: any[],
    delegations: any[],
    teamMembers: any[]
  ): Promise<string> {
    try {
      const teamData = JSON.stringify({
        transactions: transactions.slice(0, 50), // Last 50 transactions
        delegations,
        members: teamMembers,
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: `You are an AI financial analyst. Create a concise weekly report for a web3 team's wallet activity.`,
          },
          {
            role: "user",
            content: `Generate a weekly team report based on this data: ${teamData}`,
          },
        ],
      });

      return response.choices[0].message.content || 
        "Unable to generate report at this time.";
    } catch (error) {
      console.error("Error generating team report:", error);
      return "Unable to generate team report at this time.";
    }
  },
};