import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Paper,
} from '@mui/material';
import {
  Receipt,
  Close,
  Edit,
  Delete,
  Person,
  AttachMoney,
  Category,
  CalendarToday,
} from '@mui/icons-material';
import { Expense, Group } from '../types';
import { useExpense, useDeleteExpense, useGroups } from '../hooks/useApi';

interface ExpenseDetailModalProps {
  open: boolean;
  onClose: () => void;
  expenseId: number | null;
  onEdit?: (expense: Expense) => void;
  onDelete?: () => void;
}

const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  open,
  onClose,
  expenseId,
  onEdit,
  onDelete,
}) => {
  const [error, setError] = useState('');

  const { data: expense, isLoading, error: expenseError } = useExpense(
    expenseId || 0,
    { enabled: open && !!expenseId } as any
  );

  const { data: groups } = useGroups();

  const deleteExpenseMutation = useDeleteExpense(expenseId || 0, {
    onSuccess: () => {
      onClose();
      if (onDelete) onDelete();
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to delete expense');
    },
  });

  useEffect(() => {
    if (expenseError) {
      setError(expenseError.message || 'Failed to load expense details');
    }
  }, [expenseError]);

  const handleDeleteExpense = () => {
    if (window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      if (expenseId) {
        deleteExpenseMutation.mutate(expenseId);
      }
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  const getGroupName = (groupId: number) => {
    const group = groups?.find(g => g.id === groupId);
    return group?.name || 'Unknown Group';
  };

  if (isLoading) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box className="flex justify-center items-center py-8">
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (!expense) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Alert severity="error">
            Failed to load expense details
          </Alert>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle className="flex justify-between items-center">
        <Box>
          <Typography variant="h5" className="font-semibold">
            Expense Details
          </Typography>
          <Typography variant="body2" className="text-gray-600 mt-1">
            {getGroupName(expense.group_id)}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" className="mb-4">
            {error}
          </Alert>
        )}

        <Box className="mb-6">
          <Box className="flex items-center gap-2 mb-4">
            <Chip
              icon={<AttachMoney />}
              label={`$${parseFloat(expense.amount).toFixed(2)}`}
              color="primary"
              variant="outlined"
              className="text-lg font-semibold"
            />
            {expense.category && (
              <Chip
                icon={<Category />}
                label={expense.category}
                size="small"
                variant="outlined"
              />
            )}
          </Box>

          <Divider className="my-4" />

          <Paper className="p-4 mb-4">
            <Typography variant="h6" className="font-semibold mb-3">
              Expense Information
            </Typography>
            
            <Box className="space-y-3">
              <Box className="flex items-center gap-3">
                <Person className="text-gray-500" />
                <Box>
                  <Typography variant="body2" className="text-gray-600">
                    Paid by
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {expense.paid_by_user.full_name || expense.paid_by_user.email}
                  </Typography>
                </Box>
              </Box>

              <Box className="flex items-center gap-3">
                <Receipt className="text-gray-500" />
                <Box>
                  <Typography variant="body2" className="text-gray-600">
                    Description
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {expense.description || 'No description provided'}
                  </Typography>
                </Box>
              </Box>

              <Box className="flex items-center gap-3">
                <CalendarToday className="text-gray-500" />
                <Box>
                  <Typography variant="body2" className="text-gray-600">
                    Created
                  </Typography>
                  <Typography variant="body1" className="font-medium">
                    {new Date(expense.created_at).toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              {expense.updated_at !== expense.created_at && (
                <Box className="flex items-center gap-3">
                  <CalendarToday className="text-gray-500" />
                  <Box>
                    <Typography variant="body2" className="text-gray-600">
                      Last Updated
                    </Typography>
                    <Typography variant="body1" className="font-medium">
                      {new Date(expense.updated_at).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Paper>

          {expense.metadata && Object.keys(expense.metadata).length > 0 && (
            <Paper className="p-4">
              <Typography variant="h6" className="font-semibold mb-3">
                Additional Information
              </Typography>
              <Box className="space-y-2">
                {Object.entries(expense.metadata).map(([key, value]) => (
                  <Box key={key} className="flex justify-between">
                    <Typography variant="body2" className="text-gray-600 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </Typography>
                    <Typography variant="body2" className="font-medium">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}
        </Box>
      </DialogContent>

      <DialogActions className="justify-between">
        <Box>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => onEdit && onEdit(expense)}
            className="mr-2"
          >
            Edit Expense
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDeleteExpense}
            disabled={deleteExpenseMutation.isPending}
          >
            Delete Expense
          </Button>
        </Box>
        <Button onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExpenseDetailModal;
