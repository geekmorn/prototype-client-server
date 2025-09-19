import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
} from '@mui/material';
import { Expense, ExpenseUpdate, Group } from '../types';
import { useUpdateExpense, useGroups } from '../hooks/useApi';

interface ExpenseEditModalProps {
  open: boolean;
  onClose: () => void;
  expense: Expense | null;
  onSuccess?: () => void;
}

const ExpenseEditModal: React.FC<ExpenseEditModalProps> = ({
  open,
  onClose,
  expense,
  onSuccess,
}) => {
  const [formData, setFormData] = useState<ExpenseUpdate>({
    amount: 0,
    description: '',
    category: '',
  });
  const [error, setError] = useState('');

  const { data: groups } = useGroups();

  const updateExpenseMutation = useUpdateExpense(expense?.id || 0, {
    onSuccess: () => {
      onClose();
      setError('');
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to update expense');
    },
  });

  // Update form data when expense changes
  useEffect(() => {
    if (expense) {
      setFormData({
        amount: parseFloat(expense.amount),
        description: expense.description || '',
        category: expense.category || '',
      });
    }
  }, [expense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }
    if (!expense) return;
    
    updateExpenseMutation.mutate(formData);
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Edit Expense</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}
          
          <TextField
            autoFocus
            margin="dense"
            label="Amount"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            required
            inputProps={{ min: 0, step: 0.01 }}
            className="mb-4"
          />
          
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mb-4"
          />
          
          <TextField
            margin="dense"
            label="Category"
            fullWidth
            variant="outlined"
            value={formData.category || ''}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g., Food, Transportation, Entertainment"
          />

          {expense && (
            <Box className="mt-4 p-3 bg-gray-50 rounded">
              <Typography variant="body2" className="text-gray-600 mb-1">
                Group: {groups?.find(g => g.id === expense.group_id)?.name || 'Unknown Group'}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Paid by: {expense.paid_by_user.full_name || expense.paid_by_user.email}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={updateExpenseMutation.isPending}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {updateExpenseMutation.isPending ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ExpenseEditModal;
