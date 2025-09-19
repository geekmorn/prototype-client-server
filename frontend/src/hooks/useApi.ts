import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { 
  User, 
  UserCreate, 
  UserUpdate, 
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

// Query keys
export const queryKeys = {
  users: ['users'] as const,
  user: (id: number) => ['users', id] as const,
  currentUser: ['users', 'me'] as const,
  groups: ['groups'] as const,
  group: (id: number) => ['groups', id] as const,
  groupMembers: (id: number) => ['groups', id, 'members'] as const,
  expenses: (groupId: number) => ['expenses', groupId] as const,
  expense: (id: number) => ['expenses', id] as const,
  expenseSummary: (groupId: number) => ['expenses', groupId, 'summary'] as const,
  balanceSummary: (groupId: number) => ['expenses', groupId, 'balance'] as const,
};

// User hooks
export const useCurrentUser = (options?: UseQueryOptions<User>) => {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: () => apiClient.getCurrentUser(),
    enabled: false, // Only fetch when explicitly called
    ...options,
  });
};

export const useUser = (userId: number, options?: UseQueryOptions<User>) => {
  return useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => apiClient.getUser(userId),
    ...options,
  });
};

export const useSearchUsers = (nameSearch?: string, options?: UseQueryOptions<User[]>) => {
  return useQuery({
    queryKey: [...queryKeys.users, 'search', nameSearch],
    queryFn: () => apiClient.searchUsers(nameSearch),
    enabled: !!nameSearch && nameSearch.length > 0,
    ...options,
  });
};

export const useUpdateUser = (options?: UseMutationOptions<User, Error, UserUpdate>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userData: UserUpdate) => apiClient.updateCurrentUser(userData),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.currentUser, data);
    },
    ...options,
  });
};

// Group hooks
export const useGroups = (options?: UseQueryOptions<Group[]>) => {
  return useQuery({
    queryKey: queryKeys.groups,
    queryFn: () => apiClient.getUserGroups(),
    ...options,
  });
};

export const useGroup = (groupId: number, options?: UseQueryOptions<GroupWithMembers>) => {
  return useQuery({
    queryKey: queryKeys.group(groupId),
    queryFn: () => apiClient.getGroup(groupId),
    ...options,
  });
};

export const useCreateGroup = (options?: UseMutationOptions<GroupWithMembers, Error, GroupCreate>) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...rest } = options || {} as any;

  return useMutation({
    mutationFn: (groupData: GroupCreate) => apiClient.createGroup(groupData),
    onMutate: async (newGroup) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.groups });
      const previousGroups = queryClient.getQueryData<Group[]>(queryKeys.groups);
      const tempId = Date.now() * -1; // temporary negative id
      const optimisticGroup: Group = {
        id: tempId,
        name: newGroup.name,
        description: newGroup.description,
        created_by_user_id: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      queryClient.setQueryData<Group[] | undefined>(queryKeys.groups, (old) => {
        if (!old) return [optimisticGroup];
        return [optimisticGroup, ...old];
      });
      return { previousGroups, tempId } as { previousGroups?: Group[]; tempId: number };
    },
    onSuccess: (createdGroup, variables, context) => {
      // Replace optimistic group (if present) with the real one
      queryClient.setQueryData<Group[] | undefined>(queryKeys.groups, (oldData) => {
        if (!oldData) return [createdGroup as Group];
        const hasTemp = oldData.some((g) => context?.tempId && g.id === context.tempId);
        if (hasTemp) {
          return oldData.map((g) => (g.id === context!.tempId ? (createdGroup as unknown as Group) : g));
        }
        return [createdGroup as Group, ...oldData];
      });
      // Seed the individual group cache too
      queryClient.setQueryData(queryKeys.group(createdGroup.id), createdGroup);
      // Also revalidate to ensure consistency with server
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      // Call caller's onSuccess
      if (onSuccess) onSuccess(createdGroup, variables, context);
    },
    onError: (error, variables, context: { previousGroups?: Group[] } | undefined) => {
      // Rollback to previous groups on error
      if (context?.previousGroups) {
        queryClient.setQueryData(queryKeys.groups, context.previousGroups);
      }
      if (onError) onError(error, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      if (onSettled) onSettled(data, error, variables, context);
    },
    ...(rest as object),
  });
};

export const useUpdateGroup = (groupId: number, options?: UseMutationOptions<Group, Error, GroupUpdate>) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...rest } = options || {} as any;

  return useMutation({
    mutationFn: (groupData: GroupUpdate) => apiClient.updateGroup(groupId, groupData),
    onSuccess: (updatedGroup, variables, context) => {
      // Immediate update: merge into groups list
      queryClient.setQueryData(queryKeys.groups, (oldData: Group[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.map((g) => (g.id === groupId ? { ...g, ...updatedGroup } : g));
      });

      // Merge into individual group cache while preserving members
      queryClient.setQueryData(queryKeys.group(groupId), (oldGroup: GroupWithMembers | undefined) => {
        if (!oldGroup) return oldGroup as any;
        return { ...oldGroup, ...updatedGroup } as GroupWithMembers;
      });

      // Also revalidate lists to sync any server-side changes
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      if (onSuccess) onSuccess(updatedGroup, variables, context);
    },
    onError: (error, variables, context) => {
      if (onError) onError(error, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      if (onSettled) onSettled(data, error, variables, context);
    },
    ...(rest as object),
  });
};

export const useDeleteGroup = (options?: UseMutationOptions<void, Error, number>) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...rest } = options || {} as any;

  return useMutation({
    mutationFn: (groupId: number) => apiClient.deleteGroup(groupId),
    onSuccess: (_, deletedGroupId, variables, context) => {
      // Immediate update: remove deleted group from groups cache
      queryClient.setQueryData(queryKeys.groups, (oldData: Group[] | undefined) => {
        if (!oldData) return oldData;
        return oldData.filter((g) => g.id !== deletedGroupId);
      });
      // Remove individual group cache
      queryClient.removeQueries({ queryKey: queryKeys.group(deletedGroupId) });
      // Also revalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.groups });
      if (onSuccess) onSuccess(_, deletedGroupId, context as any);
    },
    onError: (error, variables, context) => {
      if (onError) onError(error, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      if (onSettled) onSettled(data, error, variables, context);
    },
    ...(rest as object),
  });
};

export const useGroupMembers = (groupId: number, options?: UseQueryOptions<GroupMember[]>) => {
  return useQuery({
    queryKey: queryKeys.groupMembers(groupId),
    queryFn: () => apiClient.getGroupMembers(groupId),
    ...options,
  });
};

export const useAddGroupMember = (groupId: number, options?: UseMutationOptions<{ message: string }, Error, GroupMemberCreate>) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...rest } = options || {} as any;

  return useMutation({
    mutationFn: (memberData: GroupMemberCreate) => apiClient.addGroupMember(groupId, memberData),
    onMutate: async (newMember) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.group(groupId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.groupMembers(groupId) });

      // Snapshot the previous value
      const previousGroup = queryClient.getQueryData<GroupWithMembers>(queryKeys.group(groupId));
      const previousMembers = queryClient.getQueryData<GroupMember[]>(queryKeys.groupMembers(groupId));

      // Optimistically update the group data
      if (previousGroup) {
        // We need to get the user data for the optimistic update
        // For now, we'll create a temporary member object
        const optimisticMember: GroupMember = {
          id: Date.now() * -1, // temporary negative id
          group_id: groupId,
          user_id: newMember.user_id,
          joined_at: new Date().toISOString(),
          user: {
            id: newMember.user_id,
            email: 'Loading...', // Will be updated when the real data comes in
            full_name: 'Loading...',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        };

        queryClient.setQueryData<GroupWithMembers>(queryKeys.group(groupId), (old) => {
          if (!old) return old;
          return {
            ...old,
            members: [...(old.members || []), optimisticMember]
          };
        });

        queryClient.setQueryData<GroupMember[]>(queryKeys.groupMembers(groupId), (old) => {
          if (!old) return [optimisticMember];
          return [...old, optimisticMember];
        });
      }

      return { previousGroup, previousMembers };
    },
    onSuccess: (data, variables, context) => {
      // Invalidate to get the real data from server
      queryClient.invalidateQueries({ queryKey: queryKeys.groupMembers(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousGroup) {
        queryClient.setQueryData(queryKeys.group(groupId), context.previousGroup);
      }
      if (context?.previousMembers) {
        queryClient.setQueryData(queryKeys.groupMembers(groupId), context.previousMembers);
      }
      if (onError) onError(error, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      if (onSettled) onSettled(data, error, variables, context);
    },
    ...(rest as object),
  });
};

export const useRemoveGroupMember = (groupId: number, options?: UseMutationOptions<void, Error, number>) => {
  const queryClient = useQueryClient();
  const { onSuccess, onError, onSettled, ...rest } = options || {} as any;

  return useMutation({
    mutationFn: (userId: number) => apiClient.removeGroupMember(groupId, userId),
    onMutate: async (userId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.group(groupId) });
      await queryClient.cancelQueries({ queryKey: queryKeys.groupMembers(groupId) });

      // Snapshot the previous value
      const previousGroup = queryClient.getQueryData<GroupWithMembers>(queryKeys.group(groupId));
      const previousMembers = queryClient.getQueryData<GroupMember[]>(queryKeys.groupMembers(groupId));

      // Optimistically update the group data
      if (previousGroup) {
        queryClient.setQueryData<GroupWithMembers>(queryKeys.group(groupId), (old) => {
          if (!old) return old;
          return {
            ...old,
            members: (old.members || []).filter(member => member.user_id !== userId)
          };
        });

        queryClient.setQueryData<GroupMember[]>(queryKeys.groupMembers(groupId), (old) => {
          if (!old) return old;
          return old.filter(member => member.user_id !== userId);
        });
      }

      return { previousGroup, previousMembers };
    },
    onSuccess: (data, variables, context) => {
      // Invalidate to get the real data from server
      queryClient.invalidateQueries({ queryKey: queryKeys.groupMembers(groupId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.group(groupId) });
      if (onSuccess) onSuccess(data, variables, context);
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousGroup) {
        queryClient.setQueryData(queryKeys.group(groupId), context.previousGroup);
      }
      if (context?.previousMembers) {
        queryClient.setQueryData(queryKeys.groupMembers(groupId), context.previousMembers);
      }
      if (onError) onError(error, variables, context);
    },
    onSettled: (data, error, variables, context) => {
      if (onSettled) onSettled(data, error, variables, context);
    },
    ...(rest as object),
  });
};

// Expense hooks
export const useGroupExpenses = (groupId: number, limit: number = 100, offset: number = 0, options?: UseQueryOptions<Expense[]>) => {
  return useQuery({
    queryKey: [...queryKeys.expenses(groupId), { limit, offset }],
    queryFn: () => apiClient.getGroupExpenses(groupId, limit, offset),
    ...options,
  });
};

export const useExpense = (expenseId: number, options?: UseQueryOptions<Expense>) => {
  return useQuery({
    queryKey: queryKeys.expense(expenseId),
    queryFn: () => apiClient.getExpense(expenseId),
    ...options,
  });
};

export const useCreateExpense = (options?: UseMutationOptions<Expense, Error, ExpenseCreate>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (expenseData: ExpenseCreate) => apiClient.createExpense(expenseData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses(data.group_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenseSummary(data.group_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.balanceSummary(data.group_id) });
    },
    ...options,
  });
};

export const useUpdateExpense = (expenseId: number, options?: UseMutationOptions<Expense, Error, ExpenseUpdate>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (expenseData: ExpenseUpdate) => apiClient.updateExpense(expenseId, expenseData),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.expense(expenseId), data);
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses(data.group_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.expenseSummary(data.group_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.balanceSummary(data.group_id) });
    },
    ...options,
  });
};

export const useDeleteExpense = (options?: UseMutationOptions<void, Error, number>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (expenseId: number) => apiClient.deleteExpense(expenseId),
    onSuccess: (_, expenseId) => {
      // We need to get the group_id from the expense to invalidate the right queries
      // For now, invalidate all expense-related queries
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
    ...options,
  });
};

export const useExpenseSummary = (groupId: number, options?: UseQueryOptions<ExpenseSummary>) => {
  return useQuery({
    queryKey: queryKeys.expenseSummary(groupId),
    queryFn: () => apiClient.getGroupExpenseSummary(groupId),
    ...options,
  });
};

export const useBalanceSummary = (groupId: number, options?: UseQueryOptions<BalanceSummary>) => {
  return useQuery({
    queryKey: queryKeys.balanceSummary(groupId),
    queryFn: () => apiClient.getGroupBalanceSummary(groupId),
    ...options,
  });
};
