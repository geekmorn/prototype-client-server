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
import { UserCreate } from '../types';
import { apiClient } from '../services/api';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState<UserCreate>({
    email: '',
    full_name: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      // Create user account
      await apiClient.signup(formData);
      // Auto-login after signup
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err: any) {
      // Handle different types of signup errors
      if (err.response?.status === 400) {
        if (err.response?.data?.detail?.includes('email')) {
          setError('An account with this email already exists. Please use a different email or try logging in.');
        } else {
          setError('Please check your information and try again.');
        }
      } else if (err.response?.status === 422) {
        setError('Please check your email format and try again.');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Signup failed. Please try again.');
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
              Sign Up
            </Typography>
            <Typography variant="body2" className="text-gray-600 mt-2">
              Create your account to start tracking expenses.
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
              label="Full Name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              autoComplete="name"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              variant="outlined"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              className="bg-primary-600 hover:bg-primary-700 py-3 mt-4"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            <Box className="text-center mt-4">
              <Typography variant="body2">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" className="text-primary-600">
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Signup;
