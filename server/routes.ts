import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertTeamSchema, 
  insertTeamMemberSchema, 
  insertDelegationSchema, 
  insertPaymentStreamSchema, 
  insertTransactionSchema,
  insertSubscriptionSchema,
  insertSubscriptionCategorySchema
} from "@shared/schema";
import { ZodError } from "zod";
import { aiService } from "./services/aiService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware
  const handleError = (err: any, res: Response) => {
    console.error(err);
    if (err instanceof ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: err.errors });
    }
    res.status(500).json({ message: err.message || 'Internal server error' });
  };

  // API Routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // User routes
  app.post('/api/users', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUser(userData.address);
      
      if (existingUser) {
        return res.json(existingUser);
      }
      
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get('/api/users/:address', async (req, res) => {
    try {
      const user = await storage.getUser(req.params.address);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Team routes
  app.post('/api/teams', async (req, res) => {
    try {
      const teamData = insertTeamSchema.parse(req.body);
      const newTeam = await storage.createTeam(teamData);
      
      // Add the creator as a team member with admin role
      await storage.createTeamMember({
        teamId: newTeam.id,
        userAddress: teamData.createdBy,
        role: 'admin'
      });
      
      res.status(201).json(newTeam);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get('/api/teams', async (req, res) => {
    try {
      const userAddress = req.query.userAddress as string;
      let teams;
      
      if (userAddress) {
        teams = await storage.listTeamsByUser(userAddress);
      } else {
        teams = await storage.listTeams();
      }
      
      res.json(teams);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get('/api/teams/:id', async (req, res) => {
    try {
      const teamId = parseInt(req.params.id);
      const team = await storage.getTeam(teamId);
      
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }
      
      res.json(team);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Team Member routes
  app.post('/api/team-members', async (req, res) => {
    try {
      const memberData = insertTeamMemberSchema.parse(req.body);
      const newMember = await storage.createTeamMember(memberData);
      res.status(201).json(newMember);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get('/api/teams/:teamId/members', async (req, res) => {
    try {
      const teamId = parseInt(req.params.teamId);
      const members = await storage.listTeamMembers(teamId);
      res.json(members);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Delegation routes
  app.post('/api/delegations', async (req, res) => {
    try {
      const delegationData = insertDelegationSchema.parse(req.body);
      const newDelegation = await storage.createDelegation(delegationData);
      res.status(201).json(newDelegation);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get('/api/delegations', async (req, res) => {
    try {
      const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
      const userAddress = req.query.userAddress as string;
      
      let delegations;
      if (teamId) {
        delegations = await storage.listDelegations(teamId);
      } else if (userAddress) {
        delegations = await storage.listDelegationsForUser(userAddress);
      } else {
        return res.status(400).json({ message: 'Either teamId or userAddress is required' });
      }
      
      res.json(delegations);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.patch('/api/delegations/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { active } = req.body;
      
      if (typeof active !== 'boolean') {
        return res.status(400).json({ message: 'Active status must be a boolean' });
      }
      
      const updatedDelegation = await storage.updateDelegationStatus(id, active);
      res.json(updatedDelegation);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Payment Stream routes
  app.post('/api/payment-streams', async (req, res) => {
    try {
      const streamData = insertPaymentStreamSchema.parse(req.body);
      const newStream = await storage.createPaymentStream(streamData);
      res.status(201).json(newStream);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get('/api/payment-streams', async (req, res) => {
    try {
      const teamId = parseInt(req.query.teamId as string);
      const streams = await storage.listPaymentStreams(teamId);
      res.json(streams);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.patch('/api/payment-streams/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { active } = req.body;
      
      if (typeof active !== 'boolean') {
        return res.status(400).json({ message: 'Active status must be a boolean' });
      }
      
      const updatedStream = await storage.updatePaymentStreamStatus(id, active);
      res.json(updatedStream);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Transaction routes
  app.post('/api/transactions', async (req, res) => {
    try {
      const transactionData = insertTransactionSchema.parse(req.body);
      const newTransaction = await storage.createTransaction(transactionData);
      res.status(201).json(newTransaction);
    } catch (err) {
      handleError(err, res);
    }
  });

  app.get('/api/transactions', async (req, res) => {
    try {
      const teamId = parseInt(req.query.teamId as string);
      const transactions = await storage.listTransactions(teamId);
      res.json(transactions);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  // Subscription routes
  app.post('/api/subscriptions', async (req, res) => {
    try {
      const subscriptionData = insertSubscriptionSchema.parse(req.body);
      const newSubscription = await storage.createSubscription(subscriptionData);
      res.status(201).json(newSubscription);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.get('/api/subscriptions', async (req, res) => {
    try {
      const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
      const userAddress = req.query.userAddress as string;
      
      let subscriptions;
      if (teamId) {
        subscriptions = await storage.listSubscriptions(teamId);
      } else if (userAddress) {
        subscriptions = await storage.listSubscriptionsByUser(userAddress);
      } else {
        return res.status(400).json({ message: 'Either teamId or userAddress is required' });
      }
      
      res.json(subscriptions);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.get('/api/subscriptions/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const subscription = await storage.getSubscription(id);
      
      if (!subscription) {
        return res.status(404).json({ message: 'Subscription not found' });
      }
      
      res.json(subscription);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.patch('/api/subscriptions/:id/status', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['active', 'paused', 'cancelled', 'completed'].includes(status)) {
        return res.status(400).json({ 
          message: 'Valid status (active, paused, cancelled, completed) is required' 
        });
      }
      
      const updatedSubscription = await storage.updateSubscriptionStatus(id, status);
      res.json(updatedSubscription);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.post('/api/subscriptions/:id/increment-payment', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedSubscription = await storage.incrementSubscriptionPaymentCount(id);
      res.json(updatedSubscription);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  // Subscription Categories routes
  app.post('/api/subscription-categories', async (req, res) => {
    try {
      const categoryData = insertSubscriptionCategorySchema.parse(req.body);
      const newCategory = await storage.createSubscriptionCategory(categoryData);
      res.status(201).json(newCategory);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.get('/api/subscription-categories', async (req, res) => {
    try {
      const categories = await storage.listSubscriptionCategories();
      res.json(categories);
    } catch (err) {
      handleError(err, res);
    }
  });
  
  app.get('/api/subscription-categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getSubscriptionCategory(id);
      
      if (!category) {
        return res.status(404).json({ message: 'Category not found' });
      }
      
      res.json(category);
    } catch (err) {
      handleError(err, res);
    }
  });

  // AI Features

  // Analyze spending patterns
  app.post('/api/ai/analyze-spending', async (req, res) => {
    try {
      const { teamId, timeframe } = req.body;
      
      if (!teamId) {
        return res.status(400).json({ message: 'Team ID is required' });
      }
      
      const analysis = await aiService.analyzeSpending(parseInt(teamId), timeframe);
      res.json(analysis);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Get smart delegation suggestions
  app.post('/api/ai/suggest-delegations', async (req, res) => {
    try {
      const { teamId } = req.body;
      
      if (!teamId) {
        return res.status(400).json({ message: 'Team ID is required' });
      }
      
      const suggestions = await aiService.suggestDelegations(parseInt(teamId));
      res.json(suggestions);
    } catch (err) {
      handleError(err, res);
    }
  });

  // Review a delegation
  app.post('/api/ai/review-delegation', async (req, res) => {
    try {
      const delegationData = req.body;
      
      if (!delegationData) {
        return res.status(400).json({ message: 'Delegation data is required' });
      }
      
      const review = await aiService.reviewDelegation(delegationData);
      res.json({ review });
    } catch (err) {
      handleError(err, res);
    }
  });

  // Generate team report
  app.post('/api/ai/team-report', async (req, res) => {
    try {
      const { teamId, reportType } = req.body;
      
      if (!teamId) {
        return res.status(400).json({ message: 'Team ID is required' });
      }
      
      const report = await aiService.generateTeamReport(parseInt(teamId), reportType);
      res.json({ report });
    } catch (err) {
      handleError(err, res);
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
