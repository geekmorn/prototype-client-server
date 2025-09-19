import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  Add,
  Receipt,
  FilterList,
  Visibility,
  AttachMoney,
  TrendingUp,
  People,
} from '@mui/icons-material';
import { useGroups, useGroupExpenses, useAllExpenses, useCreateExpense, useExpenseSummary, useBalanceSummary } from '../hooks/useApi';
import { ExpenseCreate, Expense } from '../types';
import ExpenseEditModal from '../components/ExpenseEditModal';
import ExpenseDetailModal from '../components/ExpenseDetailModal';

const Expenses: React.FC = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<ExpenseCreate>({
    group_id: 0,
    amount: 0,
    description: '',
    category: '',
  });
  const [error, setError] = useState('');
  const [filterGroup, setFilterGroup] = useState<number | ''>('');
  
  const { data: groups, isLoading: groupsLoading, error: groupsError } = useGroups();
  
  // Load all expenses by default, or group expenses if filter is selected
  const { 
    data: allExpenses, 
    isLoading: allExpensesLoading, 
    error: allExpensesError 
  } = useAllExpenses(100, 0, { enabled: !filterGroup } as any);

  const { 
    data: groupExpenses, 
    isLoading: groupExpensesLoading, 
    error: groupExpensesError 
  } = useGroupExpenses(
    filterGroup as number, 
    100, 
    0, 
    { enabled: !!filterGroup } as any
  );

  // Use the appropriate expenses based on filter
  const expenses = filterGroup ? groupExpenses : allExpenses;
  const expensesLoading = filterGroup ? groupExpensesLoading : allExpensesLoading;
  const expensesError = filterGroup ? groupExpensesError : allExpensesError;

  // Load summary data for the selected group
  const { data: expenseSummary } = useExpenseSummary(
    filterGroup as number,
    { enabled: !!filterGroup } as any
  );

  const { data: balanceSummary } = useBalanceSummary(
    filterGroup as number,
    { enabled: !!filterGroup } as any
  );
  
  const createExpenseMutation = useCreateExpense({
    onSuccess: () => {
      setCreateModalOpen(false);
      setFormData({ group_id: 0, amount: 0, description: '', category: '' });
      setError('');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to create expense');
    },
  });
  

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.group_id || formData.amount <= 0) {
      setError('Please select a group and enter a valid amount');
      return;
    }
    createExpenseMutation.mutate(formData);
  };

  // Auto-set group_id when filterGroup changes
  useEffect(() => {
    if (filterGroup && filterGroup !== formData.group_id) {
      setFormData(prev => ({ ...prev, group_id: filterGroup as number }));
    }
  }, [filterGroup]);


  const handleViewDetails = (expense: Expense) => {
    setSelectedExpense(expense);
    setDetailModalOpen(true);
  };


  const handleEditSuccess = () => {
    setEditModalOpen(false);
  };

  const handleDetailDelete = () => {
    setDetailModalOpen(false);
  };

  const handleModalClose = () => {
    setEditModalOpen(false);
    setDetailModalOpen(false);
  };

  const handleCloseAllModals = () => {
    setCreateModalOpen(false);
    setEditModalOpen(false);
    setDetailModalOpen(false);
    setSelectedExpense(null);
  };

  // Clear selected expense when component unmounts
  React.useEffect(() => {
    return () => {
      setSelectedExpense(null);
    };
  }, []);

  // Clear selected expense if it's no longer in the expenses list
  React.useEffect(() => {
    if (selectedExpense && expenses && !expenses.find(e => e.id === selectedExpense.id)) {
      setSelectedExpense(null);
    }
  }, [expenses, selectedExpense]);

  const isLoading = groupsLoading || expensesLoading;
  const hasError = groupsError || expensesError;

  if (isLoading) {
    return (
      <Container>
        <Box className="flex justify-center items-center py-8">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (hasError) {
    return (
      <Container>
        <Alert severity="error">
          Failed to load data: {(groupsError || expensesError)?.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box className="flex justify-between items-center mb-6">
        <Typography variant="h4" className="font-bold text-gray-800">
          Expenses
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            if (filterGroup) {
              setFormData(prev => ({ ...prev, group_id: filterGroup as number }));
            }
            setCreateModalOpen(true);
          }}
          className="bg-primary-600 hover:bg-primary-700"
        >
          Add Expense
        </Button>
      </Box>

      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Filter by Group */}
      <Box className="mb-6">
        <FormControl fullWidth className="max-w-xs">
          <InputLabel>Filter by Group (Optional)</InputLabel>
          <Select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value as number | '')}
            label="Filter by Group (Optional)"
          >
            <MenuItem value="">All Groups</MenuItem>
            {groups?.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      {filterGroup && expenseSummary && (
        <Box className="mb-6">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box className="flex items-center">
                    <AttachMoney className="text-green-600 mr-2" />
                    <Box>
                      <Typography variant="h6" className="font-semibold">
                        ${parseFloat(expenseSummary.total_amount).toFixed(2)}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        Total Expenses
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box className="flex items-center">
                    <Receipt className="text-blue-600 mr-2" />
                    <Box>
                      <Typography variant="h6" className="font-semibold">
                        {expenseSummary.expense_count}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        Total Transactions
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box className="flex items-center">
                    <TrendingUp className="text-purple-600 mr-2" />
                    <Box>
                      <Typography variant="h6" className="font-semibold">
                        {Object.keys(expenseSummary.by_category).length}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        Categories
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Card>
                <CardContent>
                  <Box className="flex items-center">
                    <People className="text-orange-600 mr-2" />
                    <Box>
                      <Typography variant="h6" className="font-semibold">
                        {Object.keys(expenseSummary.by_user).length}
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        Contributors
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Balance Summary */}
      {filterGroup && balanceSummary && (
        <Paper className="p-4 mb-6">
          <Typography variant="h6" className="font-semibold mb-3">
            Balance Summary
          </Typography>
          <Box className="flex items-center justify-between mb-2">
            <Typography variant="body2" className="text-gray-600">
              Equal Share per Person:
            </Typography>
            <Typography variant="body1" className="font-semibold">
              ${parseFloat(balanceSummary.equal_share).toFixed(2)}
            </Typography>
          </Box>
          <Box className="flex items-center justify-between">
            <Typography variant="body2" className="text-gray-600">
              Total Group Expenses:
            </Typography>
            <Typography variant="body1" className="font-semibold">
              ${parseFloat(balanceSummary.total_expenses).toFixed(2)}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Expenses List */}
      {expensesLoading ? (
        <Box className="flex justify-center items-center py-8">
          <CircularProgress />
        </Box>
      ) : expenses && expenses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Receipt className="text-6xl text-gray-400 mb-4" />
            <Typography variant="h6" className="text-gray-600 mb-2">
              No expenses found
            </Typography>
            <Typography variant="body2" className="text-gray-500 mb-4">
              {filterGroup 
                ? 'No expenses in this group yet. Add your first expense to get started!'
                : 'No expenses found across all your groups. Add your first expense to get started!'
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                if (filterGroup) {
                  setFormData(prev => ({ ...prev, group_id: filterGroup as number }));
                }
                setCreateModalOpen(true);
              }}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Add Expense
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {expenses?.map((expense) => {
            const group = groups?.find(g => g.id === expense.group_id);
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={expense.id}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent>
                    <Box className="flex justify-between items-start mb-2">
                      <Typography variant="h6" className="font-semibold text-green-600">
                        ${parseFloat(expense.amount).toFixed(2)}
                      </Typography>
                      <Chip
                        label={expense.category || 'Uncategorized'}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                    <Typography variant="body2" className="text-gray-600 mb-2">
                      {expense.description || 'No description'}
                    </Typography>
                    <Typography variant="caption" className="text-gray-500">
                      Paid by {expense.paid_by_user.full_name || expense.paid_by_user.email}
                    </Typography>
                    {group && (
                      <Typography variant="caption" className="text-gray-500 block">
                        Group: {group.name}
                      </Typography>
                    )}
                    <Typography variant="caption" className="text-gray-500 block">
                      {new Date(expense.created_at).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions className="justify-center">
                    <Button
                      size="small"
                      onClick={() => handleViewDetails(expense)}
                      className="text-primary-600"
                      startIcon={<Visibility />}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Create Expense Dialog */}
      <Dialog open={createModalOpen} onClose={() => setCreateModalOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleCreateExpense}>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="dense" required>
              <InputLabel>Group</InputLabel>
              <Select
                value={formData.group_id}
                onChange={(e) => setFormData({ ...formData, group_id: e.target.value as number })}
                label="Group"
              >
                {groups?.map((group) => (
                  <MenuItem key={group.id} value={group.id}>
                    {group.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              autoFocus
              margin="dense"
              label="Amount"
              type="number"
              fullWidth
              variant="outlined"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              margin="dense"
              label="Category"
              fullWidth
              variant="outlined"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Food, Transportation, Entertainment"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createExpenseMutation.isPending}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {createExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Expense Modal */}
      <ExpenseEditModal
        key={`edit-${selectedExpense?.id || 'none'}`}
        open={editModalOpen}
        onClose={handleModalClose}
        expense={selectedExpense}
        onSuccess={handleEditSuccess}
      />

      {/* Expense Detail Modal */}
      <ExpenseDetailModal
        key={`detail-${selectedExpense?.id || 'none'}`}
        open={detailModalOpen}
        onClose={handleModalClose}
        expenseId={selectedExpense?.id || null}
        onEdit={(expense) => {
          setSelectedExpense(expense);
          setEditModalOpen(true);
        }}
        onDelete={handleDetailDelete}
      />
    </Container>
  );
};

export default Expenses;
