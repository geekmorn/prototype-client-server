import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      // Handle different types of authentication errors
      if (err.response?.status === 401) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (err.response?.status === 422) {
        setError('Please check your email format and try again.');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box className="min-h-screen flex items-center justify-center">
        <Paper elevation={3} className="p-8 w-full">
          <Box className="text-center mb-8">
            <Typography component="h1" variant="h4" className="font-bold text-primary-600">
              Sign In
            </Typography>
            <Typography variant="body2" className="text-gray-600 mt-2">
              Welcome back! Please sign in to your account.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" className="mb-4">
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} className="space-y-4">
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              variant="outlined"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              className="bg-primary-600 hover:bg-primary-700 py-3 mt-4"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
            <Box className="text-center mt-4">
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link component={RouterLink} to="/signup" className="text-primary-600">
                  Sign up here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
