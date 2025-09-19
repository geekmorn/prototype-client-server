// Test utility to verify token is properly set in headers
import { apiClient } from '../services/api';

export const testTokenInHeaders = async () => {
  console.log('=== Testing Token in Headers ===');
  
  // Check if token exists in localStorage
  const token = localStorage.getItem('token');
  console.log('Token in localStorage:', token ? `${token.substring(0, 20)}...` : 'No token found');
  
  // Test getCurrentUser call
  try {
    console.log('Testing getCurrentUser call...');
    const user = await apiClient.getCurrentUser();
    console.log('getCurrentUser successful:', user);
    return true;
  } catch (error) {
    console.error('getCurrentUser failed:', error);
    return false;
  }
};

// Test login flow
export const testLoginFlow = async (email: string, password: string) => {
  console.log('=== Testing Login Flow ===');
  
  try {
    // Step 1: Login
    console.log('Step 1: Calling login...');
    const tokenData = await apiClient.login({ email, password });
    console.log('Login successful, token received:', tokenData.access_token.substring(0, 20) + '...');
    
    // Step 2: Store token
    console.log('Step 2: Storing token in localStorage...');
    localStorage.setItem('token', tokenData.access_token);
    console.log('Token stored successfully');
    
    // Step 3: Test getCurrentUser
    console.log('Step 3: Testing getCurrentUser with stored token...');
    const userData = await apiClient.getCurrentUser();
    console.log('getCurrentUser successful:', userData);
    
    return { success: true, user: userData };
  } catch (error) {
    console.error('Login flow failed:', error);
    return { success: false, error };
  }
};
