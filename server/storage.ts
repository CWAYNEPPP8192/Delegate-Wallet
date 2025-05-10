import { 
  User, InsertUser,
  Team, InsertTeam,
  TeamMember, InsertTeamMember,
  Delegation, InsertDelegation,
  PaymentStream, InsertPaymentStream,
  Transaction, InsertTransaction
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  listUsers(): Promise<User[]>;

  // Team methods
  getTeam(id: number): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  listTeams(): Promise<Team[]>;
  listTeamsByUser(userAddress: string): Promise<Team[]>;

  // TeamMember methods
  getTeamMember(id: number): Promise<TeamMember | undefined>;
  createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember>;
  listTeamMembers(teamId: number): Promise<TeamMember[]>;
  
  // Delegation methods
  getDelegation(id: number): Promise<Delegation | undefined>;
  createDelegation(delegation: InsertDelegation): Promise<Delegation>;
  listDelegations(teamId: number): Promise<Delegation[]>;
  listDelegationsForUser(address: string): Promise<Delegation[]>;
  updateDelegationStatus(id: number, active: boolean): Promise<Delegation>;
  
  // PaymentStream methods
  getPaymentStream(id: number): Promise<PaymentStream | undefined>;
  createPaymentStream(paymentStream: InsertPaymentStream): Promise<PaymentStream>;
  listPaymentStreams(teamId: number): Promise<PaymentStream[]>;
  updatePaymentStreamStatus(id: number, active: boolean): Promise<PaymentStream>;

  // Transaction methods
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  listTransactions(teamId: number): Promise<Transaction[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private teams: Map<number, Team>;
  private teamMembers: Map<number, TeamMember>;
  private delegations: Map<number, Delegation>;
  private paymentStreams: Map<number, PaymentStream>;
  private transactions: Map<number, Transaction>;
  
  private userId = 1;
  private teamId = 1;
  private teamMemberId = 1;
  private delegationId = 1;
  private paymentStreamId = 1;
  private transactionId = 1;

  constructor() {
    this.users = new Map();
    this.teams = new Map();
    this.teamMembers = new Map();
    this.delegations = new Map();
    this.paymentStreams = new Map();
    this.transactions = new Map();
    
    // Add some initial demo data
    this.initDemoData();
  }

  private initDemoData() {
    // We'll initialize with a demo team and some members once a user connects
  }

  // User methods
  async getUser(address: string): Promise<User | undefined> {
    return this.users.get(address);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: this.userId++,
      address: user.address,
      username: user.username || `User ${this.userId}`,
      avatarUrl: user.avatarUrl,
      createdAt: new Date(),
    };
    this.users.set(user.address, newUser);
    return newUser;
  }

  async listUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // Team methods
  async getTeam(id: number): Promise<Team | undefined> {
    return this.teams.get(id);
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const newTeam: Team = {
      id: this.teamId++,
      name: team.name,
      description: team.description || '',
      createdBy: team.createdBy,
      createdAt: new Date(),
    };
    this.teams.set(newTeam.id, newTeam);
    return newTeam;
  }

  async listTeams(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  async listTeamsByUser(userAddress: string): Promise<Team[]> {
    const memberTeamIds = Array.from(this.teamMembers.values())
      .filter(member => member.userAddress === userAddress)
      .map(member => member.teamId);
    
    const createdTeams = Array.from(this.teams.values())
      .filter(team => team.createdBy === userAddress);
    
    const memberTeams = Array.from(this.teams.values())
      .filter(team => memberTeamIds.includes(team.id));
    
    // Combine and remove duplicates
    return Array.from(new Set([...createdTeams, ...memberTeams]));
  }

  // TeamMember methods
  async getTeamMember(id: number): Promise<TeamMember | undefined> {
    return this.teamMembers.get(id);
  }

  async createTeamMember(teamMember: InsertTeamMember): Promise<TeamMember> {
    const newTeamMember: TeamMember = {
      id: this.teamMemberId++,
      teamId: teamMember.teamId,
      userAddress: teamMember.userAddress,
      role: teamMember.role,
      addedAt: new Date(),
    };
    this.teamMembers.set(newTeamMember.id, newTeamMember);
    return newTeamMember;
  }

  async listTeamMembers(teamId: number): Promise<TeamMember[]> {
    return Array.from(this.teamMembers.values())
      .filter(member => member.teamId === teamId);
  }

  // Delegation methods
  async getDelegation(id: number): Promise<Delegation | undefined> {
    return this.delegations.get(id);
  }

  async createDelegation(delegation: InsertDelegation): Promise<Delegation> {
    const newDelegation: Delegation = {
      id: this.delegationId++,
      teamId: delegation.teamId,
      delegatorAddress: delegation.delegatorAddress,
      delegateeAddress: delegation.delegateeAddress,
      permissionLevel: delegation.permissionLevel,
      spendingLimit: delegation.spendingLimit || '0',
      tokenType: delegation.tokenType || 'ETH',
      duration: delegation.duration || 'permanent',
      allowedActions: delegation.allowedActions || {},
      active: true,
      createdAt: new Date(),
      expiresAt: delegation.expiresAt,
    };
    this.delegations.set(newDelegation.id, newDelegation);
    return newDelegation;
  }

  async listDelegations(teamId: number): Promise<Delegation[]> {
    return Array.from(this.delegations.values())
      .filter(delegation => delegation.teamId === teamId);
  }

  async listDelegationsForUser(address: string): Promise<Delegation[]> {
    return Array.from(this.delegations.values())
      .filter(delegation => 
        delegation.delegatorAddress === address || 
        delegation.delegateeAddress === address
      );
  }

  async updateDelegationStatus(id: number, active: boolean): Promise<Delegation> {
    const delegation = this.delegations.get(id);
    if (!delegation) {
      throw new Error(`Delegation with ID ${id} not found`);
    }
    
    const updatedDelegation = { ...delegation, active };
    this.delegations.set(id, updatedDelegation);
    return updatedDelegation;
  }

  // PaymentStream methods
  async getPaymentStream(id: number): Promise<PaymentStream | undefined> {
    return this.paymentStreams.get(id);
  }

  async createPaymentStream(paymentStream: InsertPaymentStream): Promise<PaymentStream> {
    const newPaymentStream: PaymentStream = {
      id: this.paymentStreamId++,
      teamId: paymentStream.teamId,
      senderAddress: paymentStream.senderAddress,
      recipientAddress: paymentStream.recipientAddress,
      tokenType: paymentStream.tokenType || 'ETH',
      totalAmount: paymentStream.totalAmount,
      flowRate: paymentStream.flowRate,
      startDate: paymentStream.startDate,
      endDate: paymentStream.endDate,
      note: paymentStream.note || '',
      active: true,
      createdAt: new Date(),
    };
    this.paymentStreams.set(newPaymentStream.id, newPaymentStream);
    return newPaymentStream;
  }

  async listPaymentStreams(teamId: number): Promise<PaymentStream[]> {
    return Array.from(this.paymentStreams.values())
      .filter(stream => stream.teamId === teamId);
  }

  async updatePaymentStreamStatus(id: number, active: boolean): Promise<PaymentStream> {
    const paymentStream = this.paymentStreams.get(id);
    if (!paymentStream) {
      throw new Error(`Payment stream with ID ${id} not found`);
    }
    
    const updatedPaymentStream = { ...paymentStream, active };
    this.paymentStreams.set(id, updatedPaymentStream);
    return updatedPaymentStream;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const newTransaction: Transaction = {
      id: this.transactionId++,
      teamId: transaction.teamId,
      delegationId: transaction.delegationId,
      fromAddress: transaction.fromAddress,
      toAddress: transaction.toAddress,
      amount: transaction.amount,
      tokenType: transaction.tokenType || 'ETH',
      transactionHash: transaction.transactionHash,
      transactionType: transaction.transactionType,
      timestamp: new Date(),
      status: transaction.status,
    };
    this.transactions.set(newTransaction.id, newTransaction);
    return newTransaction;
  }

  async listTransactions(teamId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.teamId === teamId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Sort by most recent
  }
}

export const storage = new MemStorage();
