// User types
export interface User {
  id: number;
  email: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  full_name?: string;
  password: string;
}

export interface UserUpdate {
  full_name?: string;
  email?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

// Group types
export interface Group {
  id: number;
  name: string;
  description?: string;
  created_by_user_id: number;
  created_at: string;
  updated_at: string;
}

export interface GroupCreate {
  name: string;
  description?: string;
}

export interface GroupUpdate {
  name?: string;
  description?: string;
}

export interface GroupMember {
  id: number;
  group_id: number;
  user_id: number;
  joined_at: string;
  user: User;
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
}

export interface GroupMemberCreate {
  user_id: number;
}

// Expense types
export interface Expense {
  id: number;
  group_id: number;
  paid_by_user_id: number;
  amount: string; // API returns as string
  description?: string;
  category?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  paid_by_user: User;
}

export interface ExpenseCreate {
  group_id: number;
  amount: number;
  description?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface ExpenseUpdate {
  amount?: number;
  description?: string;
  category?: string;
  metadata?: Record<string, any>;
}

export interface ExpenseSummary {
  total_amount: string; // API returns as string
  expense_count: number;
  by_category: Record<string, string>; // API returns as string
  by_user: Record<string, string>; // API returns as string
}

export interface BalanceSummary {
  group_id: number;
  group_name: string;
  total_expenses: string; // API returns as string
  member_count: number;
  equal_share: string; // API returns as string
  balances: Record<string, string>; // API returns as string
  net_balances: Record<string, string>; // API returns as string
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiError {
  detail: string;
  status_code: number;
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  resetAuth: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}
