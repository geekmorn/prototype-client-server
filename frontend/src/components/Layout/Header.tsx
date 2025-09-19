import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from '@mui/material';
import {
  AccountCircle,
  Logout,
  Person,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  return (
    <AppBar position="static" className="bg-primary-600">
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
          className="font-bold"
        >
          Expense Tracker
        </Typography>

        {isAuthenticated ? (
          <Box className="flex items-center gap-4">
            <Button
              color="inherit"
              onClick={() => navigate('/groups')}
              className="text-white hover:bg-primary-700"
            >
              Groups
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate('/expenses')}
              className="text-white hover:bg-primary-700"
            >
              Expenses
            </Button>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              {user ? (
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </Avatar>
              ) : (
                <AccountCircle />
              )}
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>
                <Person className="mr-2" />
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout className="mr-2" />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box className="flex items-center gap-2">
            <Button
              color="inherit"
              onClick={() => navigate('/login')}
              className="text-white hover:bg-primary-700"
            >
              Login
            </Button>
            <Button
              color="inherit"
              onClick={() => navigate('/signup')}
              className="text-white hover:bg-primary-700"
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
