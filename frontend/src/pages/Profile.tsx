import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { useUpdateUser } from '../hooks/useApi';
import { UserUpdate, User } from '../types';
import { apiClient } from '../services/api';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [displayUser, setDisplayUser] = useState<User | null>(user);
  const [formData, setFormData] = useState<UserUpdate>({
    full_name: user?.full_name || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [debugInfo, setDebugInfo] = useState<string>('');
  
  const updateUserMutation = useUpdateUser({
    onSuccess: (updated) => {
      setSuccess('Profile updated successfully');
      setError('');
      setFormData({ full_name: updated.full_name || '' });
      setDisplayUser(updated);
      // Persist updated user for future sessions
      try { localStorage.setItem('user', JSON.stringify(updated)); } catch {}
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Update failed');
      setSuccess('');
    },
  });

  const testTokenFlow = async () => {
    try {
      setDebugInfo('Testing token flow...');
      const tokenInfo = await apiClient.testTokenHeaders();
      setDebugInfo(`Token exists: ${tokenInfo.hasToken}, Preview: ${tokenInfo.tokenPreview}`);
      
      // Test getCurrentUser call
      const userData = await apiClient.getCurrentUser();
      setDebugInfo(prev => prev + `\n\ngetCurrentUser successful: ${JSON.stringify(userData, null, 2)}`);
    } catch (error: any) {
      setDebugInfo(`Error: ${error.message}`);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      full_name: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Only send full_name; do not include email in the request body
    updateUserMutation.mutate({ full_name: formData.full_name });
  };

  if (!displayUser) {
    return (
      <Container>
        <Typography>Please log in to view your profile.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" className="font-bold text-gray-800 mb-6">
        Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={3} className="p-6">
            <Typography variant="h6" className="font-semibold mb-4">
              Personal Information
            </Typography>

            {error && (
              <Alert severity="error" className="mb-4">
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" className="mb-4">
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} className="space-y-4">
              <TextField
                fullWidth
                label="Full Name"
                name="full_name"
                value={formData.full_name || ''}
                onChange={handleChange}
                variant="outlined"
              />
              <Button
                type="submit"
                variant="contained"
                disabled={updateUserMutation.isPending}
                className="bg-primary-600 hover:bg-primary-700"
              >
                {updateUserMutation.isPending ? 'Updating...' : 'Update Profile'}
              </Button>
            </Box>

            {/* Debug Section */}
            <Box className="mt-6 p-4 bg-gray-100 rounded">
              <Typography variant="h6" className="font-semibold mb-2">
                Debug Token Flow
              </Typography>
              <Button
                variant="outlined"
                onClick={testTokenFlow}
                className="mb-2"
              >
                Test Token in Headers
              </Button>
              {debugInfo && (
                <Box className="mt-2 p-2 bg-white rounded border">
                  <Typography variant="body2" component="pre" className="whitespace-pre-wrap text-xs">
                    {debugInfo}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" className="font-semibold mb-4">
                Account Information
              </Typography>
              <Box className="space-y-2">
                <Typography variant="body2" className="text-gray-600">
                  <strong>User ID:</strong> {displayUser.id}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  <strong>Member since:</strong> {new Date(displayUser.created_at).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" className="text-gray-600">
                  <strong>Last updated:</strong> {new Date(displayUser.updated_at).toLocaleDateString()}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;
