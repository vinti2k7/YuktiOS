import crypto from 'crypto';
import { DataStore } from '../DataStore';
import { Business, UserRecord, UserSession, PublicUserInfo, UserRole } from '../../../types/authTypes';
import { initialSystemState } from '../../../data/mockData';

export class AuthRepository {
  /**
   * Hash password with PBKDF2 salted hashing
   */
  private static hashPassword(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  }

  /**
   * Ensure default demo business and owner user exist in DataStore
   */
  public static ensureSeedTenants(): void {
    DataStore.updateState((state: any) => {
      if (!state.businesses) state.businesses = [];
      if (!state.users) state.users = [];
      if (!state.sessions) state.sessions = [];

      const demoBizExists = state.businesses.some((b: Business) => b.id === 'biz_demo');
      if (!demoBizExists) {
        const demoBiz: Business = {
          id: 'biz_demo',
          name: 'Apex Industrial Solutions',
          industry: 'Industrial Manufacturing',
          email: 'demo@yuktios.com',
          phone: '+91 98765 43210',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const salt = crypto.randomBytes(16).toString('hex');
        const passwordHash = this.hashPassword('demo123', salt);

        const demoOwner: UserRecord = {
          id: 'user_demo_owner',
          businessId: 'biz_demo',
          name: 'Rohan Satya',
          email: 'demo@yuktios.com',
          passwordHash,
          salt,
          role: 'owner',
          createdAt: new Date().toISOString(),
        };

        state.businesses.push(demoBiz);
        state.users.push(demoOwner);

        // Assign businessId to all seed entities
        state.products = (state.products || []).map((p: any) => ({ ...p, businessId: 'biz_demo' }));
        state.invoices = (state.invoices || []).map((i: any) => ({ ...i, businessId: 'biz_demo' }));
        state.employees = (state.employees || []).map((e: any) => ({ ...e, businessId: 'biz_demo' }));
        state.customers = (state.customers || []).map((c: any) => ({ ...c, businessId: 'biz_demo' }));
        state.supportTickets = (state.supportTickets || []).map((t: any) => ({ ...t, businessId: 'biz_demo' }));
        state.eventLogs = (state.eventLogs || []).map((ev: any) => ({ ...ev, businessId: 'biz_demo' }));
      }

      return state;
    });
  }

  /**
   * Register a new Business and Owner user
   */
  public static registerBusiness(
    businessName: string,
    industry: string,
    ownerName: string,
    email: string,
    password: string
  ): { user: PublicUserInfo; sessionToken: string } {
    this.ensureSeedTenants();

    if (!businessName || !ownerName || !email || !password) {
      throw new Error('All registration fields are required.');
    }

    const state = DataStore.getState() as any;
    const existingUser = state.users?.find((u: UserRecord) => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      throw new Error('An account with this email address already exists.');
    }

    const bizId = `biz_${Date.now()}`;
    const userId = `user_${Date.now()}`;
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(password, salt);

    const newBiz: Business = {
      id: bizId,
      name: businessName,
      industry: industry || 'SME Business',
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newOwner: UserRecord = {
      id: userId,
      businessId: bizId,
      name: ownerName,
      email: email.toLowerCase(),
      passwordHash,
      salt,
      role: 'owner',
      createdAt: new Date().toISOString(),
    };

    // Seed new business with baseline templates
    const seedState = JSON.parse(JSON.stringify(initialSystemState));
    const newProducts = seedState.products.map((p: any) => ({ ...p, businessId: bizId, id: `prod_${bizId}_${p.id}` }));
    const newInvoices = seedState.invoices.map((i: any) => ({ ...i, businessId: bizId, id: `INV-${bizId}-${i.id}` }));
    const newEmployees = seedState.employees.map((e: any) => ({ ...e, businessId: bizId, id: `emp_${bizId}_${e.id}` }));
    const newCustomers = seedState.customers.map((c: any) => ({ ...c, businessId: bizId, id: `cust_${bizId}_${c.id}` }));
    const newTickets = seedState.supportTickets.map((t: any) => ({ ...t, businessId: bizId, id: `TICK-${bizId}-${t.id}` }));
    const newEvents = seedState.eventLogs.map((ev: any) => ({ ...ev, businessId: bizId }));

    DataStore.updateState((currentState: any) => ({
      ...currentState,
      businesses: [...(currentState.businesses || []), newBiz],
      users: [...(currentState.users || []), newOwner],
      products: [...(currentState.products || []), ...newProducts],
      invoices: [...(currentState.invoices || []), ...newInvoices],
      employees: [...(currentState.employees || []), ...newEmployees],
      customers: [...(currentState.customers || []), ...newCustomers],
      supportTickets: [...(currentState.supportTickets || []), ...newTickets],
      eventLogs: [...(currentState.eventLogs || []), ...newEvents],
    }));

    const sessionToken = this.createSession(userId, bizId);

    return {
      user: {
        id: userId,
        businessId: bizId,
        businessName: businessName,
        name: ownerName,
        email: email.toLowerCase(),
        role: 'owner',
      },
      sessionToken,
    };
  }

  /**
   * Authenticate user login
   */
  public static login(email: string, password: string): { user: PublicUserInfo; sessionToken: string } {
    this.ensureSeedTenants();

    const state = DataStore.getState() as any;
    const user = state.users?.find((u: UserRecord) => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('Invalid email or password.');
    }

    const calculatedHash = this.hashPassword(password, user.salt);
    if (calculatedHash !== user.passwordHash) {
      throw new Error('Invalid email or password.');
    }

    const biz = state.businesses?.find((b: Business) => b.id === user.businessId);
    const sessionToken = this.createSession(user.id, user.businessId);

    return {
      user: {
        id: user.id,
        businessId: user.businessId,
        businessName: biz?.name || 'My Business',
        name: user.name,
        email: user.email,
        role: user.role,
      },
      sessionToken,
    };
  }

  /**
   * Create session token
   */
  private static createSession(userId: string, businessId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const session: UserSession = {
      token,
      userId,
      businessId,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 86400000, // 7 days
    };

    DataStore.updateState((state: any) => {
      const activeSessions = (state.sessions || []).filter((s: UserSession) => s.expiresAt > Date.now());
      return {
        ...state,
        sessions: [session, ...activeSessions],
      };
    });

    return token;
  }

  /**
   * Get user session by token
   */
  public static getSessionUser(token: string): PublicUserInfo | null {
    if (!token) return null;
    this.ensureSeedTenants();

    const state = DataStore.getState() as any;
    const session = state.sessions?.find((s: UserSession) => s.token === token && s.expiresAt > Date.now());
    if (!session) return null;

    const user = state.users?.find((u: UserRecord) => u.id === session.userId);
    if (!user) return null;

    const biz = state.businesses?.find((b: Business) => b.id === user.businessId);

    return {
      id: user.id,
      businessId: user.businessId,
      businessName: biz?.name || 'My Business',
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  /**
   * Invalidate session token
   */
  public static logout(token: string): void {
    DataStore.updateState((state: any) => ({
      ...state,
      sessions: (state.sessions || []).filter((s: UserSession) => s.token !== token),
    }));
  }
}
