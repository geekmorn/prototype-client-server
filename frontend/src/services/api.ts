import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  User, 
  UserCreate, 
  UserUpdate, 
  UserLogin, 
  Token,
  Group,
  GroupCreate,
  GroupUpdate,
  GroupWithMembers,
  GroupMemberCreate,
  GroupMember,
  Expense,
  ExpenseCreate,
  ExpenseUpdate,
  ExpenseSummary,
  BalanceSummary
} from '../types';

// Global reference to resetAuth function - will be set by AuthProvider
let globalResetAuth: (() => void) | null = null;

export const setGlobalResetAuth = (resetAuth: () => void) => {
  globalResetAuth = resetAuth;
};

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: 'http://0.0.0.0:8000',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log(`[API] Adding token to request: ${config.method?.toUpperCase()} ${config.url}`);
        } else {
          console.log(`[API] No token found for request: ${config.method?.toUpperCase()} ${config.url}`);
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Only redirect to login for 401 errors on protected routes
        // Don't redirect if we're already on login/signup pages
        if (error.response?.status === 401) {
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/signup') {
            // Use global resetAuth if available, otherwise fallback to manual cleanup
            if (globalResetAuth) {
              globalResetAuth();
            } else {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async signup(userData: UserCreate): Promise<User> {
    const response: AxiosResponse<User> = await this.client.post('/users/signup', userData);
    return response.data;
  }

  async login(credentials: UserLogin): Promise<Token> {
    const response: AxiosResponse<Token> = await this.client.post('/users/login', credentials);
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response: AxiosResponse<User> = await this.client.get('/users/me');
    return response.data;
  }

  async updateCurrentUser(userData: UserUpdate): Promise<User> {
    const response: AxiosResponse<User> = await this.client.put('/users/me', userData);
    return response.data;
  }

  async getUser(userId: number): Promise<User> {
    const response: AxiosResponse<User> = await this.client.get(`/users/${userId}`);
    return response.data;
  }

  async searchUsers(nameSearch?: string): Promise<User[]> {
    const response: AxiosResponse<User[]> = await this.client.get('/users/', {
      params: { name_search: nameSearch }
    });
    return response.data;
  }

  // Group endpoints
  async createGroup(groupData: GroupCreate): Promise<GroupWithMembers> {
    const response: AxiosResponse<GroupWithMembers> = await this.client.post('/groups', groupData);
    return response.data;
  }

  async getUserGroups(): Promise<Group[]> {
    const response: AxiosResponse<Group[]> = await this.client.get('/groups');
    return response.data;
  }

  async getGroup(groupId: number): Promise<GroupWithMembers> {
    const response: AxiosResponse<GroupWithMembers> = await this.client.get(`/groups/${groupId}`);
    return response.data;
  }

  async updateGroup(groupId: number, groupData: GroupUpdate): Promise<Group> {
    const response: AxiosResponse<Group> = await this.client.put(`/groups/${groupId}`, groupData);
    return response.data;
  }

  async deleteGroup(groupId: number): Promise<void> {
    await this.client.delete(`/groups/${groupId}`);
  }

  async addGroupMember(groupId: number, memberData: GroupMemberCreate): Promise<{ message: string }> {
    const response: AxiosResponse<{ message: string }> = await this.client.post(`/groups/${groupId}/members`, memberData);
    return response.data;
  }

  async removeGroupMember(groupId: number, userId: number): Promise<void> {
    await this.client.delete(`/groups/${groupId}/members/${userId}`);
  }

  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    const response: AxiosResponse<GroupMember[]> = await this.client.get(`/groups/${groupId}/members`);
    return response.data;
  }

  // Expense endpoints
  async createExpense(expenseData: ExpenseCreate): Promise<Expense> {
    const response: AxiosResponse<Expense> = await this.client.post('/expenses', expenseData);
    return response.data;
  }

  async getExpense(expenseId: number): Promise<Expense> {
    const response: AxiosResponse<Expense> = await this.client.get(`/expenses/${expenseId}`);
    return response.data;
  }

  async updateExpense(expenseId: number, expenseData: ExpenseUpdate): Promise<Expense> {
    const response: AxiosResponse<Expense> = await this.client.put(`/expenses/${expenseId}`, expenseData);
    return response.data;
  }

  async deleteExpense(expenseId: number): Promise<void> {
    await this.client.delete(`/expenses/${expenseId}`);
  }

  async getGroupExpenses(groupId: number, limit: number = 100, offset: number = 0): Promise<Expense[]> {
    const response: AxiosResponse<Expense[]> = await this.client.get(`/expenses/groups/${groupId}`, {
      params: { limit, offset }
    });
    return response.data;
  }

  async getGroupExpenseSummary(groupId: number): Promise<ExpenseSummary> {
    const response: AxiosResponse<ExpenseSummary> = await this.client.get(`/expenses/groups/${groupId}/summary`);
    return response.data;
  }

  async getGroupBalanceSummary(groupId: number): Promise<BalanceSummary> {
    const response: AxiosResponse<BalanceSummary> = await this.client.get(`/expenses/groups/${groupId}/balance`);
    return response.data;
  }

  // Debug method to test token in headers
  async testTokenHeaders(): Promise<{ hasToken: boolean; tokenPreview: string | null }> {
    const token = localStorage.getItem('token');
    return {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : null
    };
  }
}

export const apiClient = new ApiClient();
export default apiClient;
