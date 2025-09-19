import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
} from '@mui/material';
import {
  People,
  Receipt,
  AccountBalance,
  TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useGroups, useGroupExpenses } from '../hooks/useApi';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { data: groups } = useGroups();
  const navigate = useNavigate();

  // Get expenses from all groups for summary
  // For now, we'll use a simplified approach without calling hooks in a loop
  const allExpenses: any[] = [];

  const totalExpenses = allExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const recentExpenses = allExpenses
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  if (!isAuthenticated) {
    return (
      <Container maxWidth="lg">
        <Box className="text-center py-16">
          <Typography variant="h3" className="font-bold text-gray-800 mb-4">
            Welcome to Expense Tracker
          </Typography>
          <Typography variant="h6" className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Track shared expenses with friends and family. Create groups, add expenses, 
            and see who owes what - all in one place.
          </Typography>
          <Box className="flex gap-4 justify-center">
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/signup')}
              className="bg-primary-600 hover:bg-primary-700 px-8 py-3"
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              className="border-primary-600 text-primary-600 hover:bg-primary-50 px-8 py-3"
            >
              Sign In
            </Button>
          </Box>
        </Box>

        <Grid container spacing={4} className="mt-16">
          <Grid size={{ xs: 12, md: 4 }}>
            <Card className="text-center p-6">
              <People className="text-6xl text-primary-600 mb-4" />
              <Typography variant="h5" className="font-semibold mb-2">
                Create Groups
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Organize expenses by trips, households, or any shared activities
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card className="text-center p-6">
              <Receipt className="text-6xl text-primary-600 mb-4" />
              <Typography variant="h5" className="font-semibold mb-2">
                Track Expenses
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Add expenses with descriptions, categories, and metadata
              </Typography>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card className="text-center p-6">
              <AccountBalance className="text-6xl text-primary-600 mb-4" />
              <Typography variant="h5" className="font-semibold mb-2">
                Settle Balances
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                See who owes what and settle up easily
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box className="mb-8">
        <Typography variant="h4" className="font-bold text-gray-800 mb-2">
          Welcome back, {user?.full_name || user?.email}!
        </Typography>
        <Typography variant="body1" className="text-gray-600">
          Here's an overview of your expense tracking activity.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Summary Cards */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent className="text-center">
              <People className="text-4xl text-primary-600 mb-2" />
              <Typography variant="h4" className="font-bold">
                {groups?.length || 0}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Groups
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent className="text-center">
              <Receipt className="text-4xl text-green-600 mb-2" />
              <Typography variant="h4" className="font-bold">
                {allExpenses.length}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Total Expenses
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent className="text-center">
              <TrendingUp className="text-4xl text-blue-600 mb-2" />
              <Typography variant="h4" className="font-bold">
                ${totalExpenses.toFixed(2)}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Total Amount
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 3 }}>
          <Card>
            <CardContent className="text-center">
              <AccountBalance className="text-4xl text-orange-600 mb-2" />
              <Typography variant="h4" className="font-bold">
                ${(totalExpenses / (groups?.length || 1)).toFixed(2)}
              </Typography>
              <Typography variant="body2" className="text-gray-600">
                Avg per Group
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h6" className="font-semibold">
                  Recent Expenses
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/expenses')}
                  className="border-primary-600 text-primary-600"
                >
                  View All
                </Button>
              </Box>
              {recentExpenses.length === 0 ? (
                <Box className="text-center py-8">
                  <Receipt className="text-6xl text-gray-400 mb-4" />
                  <Typography variant="h6" className="text-gray-600 mb-2">
                    No expenses yet
                  </Typography>
                  <Typography variant="body2" className="text-gray-500 mb-4">
                    Add your first expense to get started
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => navigate('/expenses')}
                    className="bg-primary-600 hover:bg-primary-700"
                  >
                    Add Expense
                  </Button>
                </Box>
              ) : (
                <Box className="space-y-3">
                  {recentExpenses.map((expense) => (
                    <Paper key={expense.id} className="p-3">
                      <Box className="flex justify-between items-start">
                        <Box>
                          <Typography variant="body1" className="font-medium">
                            ${expense.amount.toFixed(2)}
                          </Typography>
                          <Typography variant="body2" className="text-gray-600">
                            {expense.description || 'No description'}
                          </Typography>
                          <Typography variant="caption" className="text-gray-500">
                            Paid by {expense.paid_by_user.full_name || expense.paid_by_user.email}
                          </Typography>
                        </Box>
                        <Typography variant="caption" className="text-gray-500">
                          {new Date(expense.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Paper>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-4">
                Quick Actions
              </Typography>
              <Box className="space-y-3">
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<Receipt />}
                  onClick={() => navigate('/expenses')}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  Add Expense
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<People />}
                  onClick={() => navigate('/groups')}
                  className="border-primary-600 text-primary-600"
                >
                  Manage Groups
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AccountBalance />}
                  onClick={() => navigate('/expenses')}
                  className="border-gray-600 text-gray-600"
                >
                  View Balances
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
