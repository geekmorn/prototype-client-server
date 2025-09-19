import React from 'react';
import { Box } from '@mui/material';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box className="min-h-screen bg-gray-50">
      <Header />
      <Box className="container mx-auto px-4 py-8">
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
